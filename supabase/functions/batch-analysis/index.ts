import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "claude-sonnet-4-6";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SYSTEM_PROMPT = `You are the Client Health agent for Algorithm Agency. A CI has submitted their bi-weekly scores for a client AND answered your follow-up questions. Produce the full analysis.

Scoring framework: Relationship is the strongest churn predictor. Confidence bands: 9-10 happy/engaged, 7-8 stable, 5-6 disengagement/pressure, 3-4 cost-cutting/reviewing agencies, 1-2 likely leaving. Hidden risk: Green overall + confidence <= 4.

Rules:
- Ground every claim in what the CI actually wrote — quote or reference their words.
- The delta must honestly reflect what the Q&A answers CHANGED vs what the scores alone suggested. If answers revealed nothing new, say so.
- Recommended actions must be concrete and doable within 2 weeks, not vague ("improve communication" is banned).
- Trajectory: compare this cycle vs the previous cycles provided.
- If a stale-review note is present, include "no detailed review in N cycles" in new_flags.
- memory_summary: a rolling summary of this client (max 200 words) that a colleague could read cold and understand the account — carry forward what still matters from the previous summary, add what changed this cycle, drop what's resolved.

Respond ONLY with JSON, no preamble, no markdown fences:
{"insight_narrative":"3-5 sentences, specific","trajectory_flag":{"direction":"improving|stable|deteriorating","categories":["..."],"note":"..."},"upsell_window":{"open":false,"rationale":"...","suggested_service":""},"recommended_actions":[{"action":"...","owner":"...","urgency":"this_week|this_cycle|next_cycle"}],"delta":{"risk_before":"Low|Medium|High|Critical","risk_after":"Low|Medium|High|Critical","new_flags":["..."],"resolved_flags":["..."],"summary":"2-3 sentences: what the CI's answers changed about your assessment"},"memory_summary":"..."}`;

function txt(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function compactCycleLine(s: Record<string, unknown>): string {
  return `- ${txt(s["cycle_id"])}${s["fast_path"] ? " [fast path]" : ""}: Perf ${txt(s["performance_rag"])} · Paid ${txt(s["paid_rag"])} · Rel ${txt(s["relationship_rag"])} · Growth ${txt(s["growth_rag"])} · Confidence ${txt(String(s["confidence_score"] ?? "—"))}/10 · Overall ${txt(s["overall_rag"])} — rel: "${trunc(s["relationship_reason"])}"`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { submission_id } = await req.json();
    if (!submission_id) return json({ ok: false, reason: "missing_submission_id" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Load submission
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submission_id)
      .single();
    if (subErr) throw subErr;

    const [clientRes, qaRes, historyRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", submission.client_id).single(),
      supabase.from("questions").select("question_text, answer_text").eq("submission_id", submission_id),
      supabase
        .from("submissions")
        .select("*")
        .eq("client_id", submission.client_id)
        .neq("id", submission_id)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(3),
    ]);
    if (clientRes.error) throw clientRes.error;

    const client = clientRes.data as Record<string, unknown>;
    const qa = qaRes.data ?? [];
    const history = (historyRes.data ?? []) as Record<string, unknown>[];

    // Load action log from previous cycle
    let actions: Record<string, unknown>[] = [];
    const previousCycleId = history[0]?.cycle_id ?? null;
    if (previousCycleId) {
      const { data } = await supabase
        .from("action_log")
        .select("description, owner, deadline, status, outcome, cycle_id")
        .eq("client_id", submission.client_id)
        .in("cycle_id", [previousCycleId, submission.cycle_id]);
      actions = (data ?? []) as Record<string, unknown>[];
    }

    // Fast-path streak
    let fastPathStreak = 0;
    for (const s of [submission, ...history]) {
      if (s.fast_path) fastPathStreak += 1;
      else break;
    }

    const staleNote = fastPathStreak >= 3
      ? `\nNOTE: this client has had no detailed review for ${fastPathStreak} consecutive cycles — flag this.\n`
      : "";

    const leads = Array.isArray(client["ci_leads"]) ? (client["ci_leads"] as string[]).join(", ") : "—";
    const s = submission as Record<string, unknown>;

    const qaBlock = qa.length > 0
      ? qa.map((q) => `- Q: ${q.question_text}\n  A: ${q.answer_text ?? "(unanswered)"}`).join("\n")
      : "(no follow-up questions answered this cycle)";

    const historyBlock = history.length > 0
      ? history.map(compactCycleLine).join("\n")
      : "(no prior cycles)";

    const actionBlock = actions.length > 0
      ? actions.map((a) => `- ${trunc(a["description"])} (owner ${txt(a["owner"])}, due ${txt(String(a["deadline"] ?? "—"))}) → status ${txt(a["status"])}${a["outcome"] ? `, outcome: ${txt(a["outcome"])}` : ", outcome: (none recorded)"}`).join("\n")
      : "(none logged)";

    const userPrompt = `CLIENT: ${txt(client["name"])} (CI: ${leads}, Director: ${txt(client["director_support"])})

CLIENT MEMORY (rolling summary from previous cycles):
${txt(client["memory_summary"], "(none yet — first cycle)")}

THIS CYCLE:
- SEO/Performance: ${txt(s["performance_rag"])} — "${trunc(s["performance_reason"])}"
- Paid: ${txt(s["paid_rag"])} — "${trunc(s["paid_reason"])}"
- Relationship: ${txt(s["relationship_rag"])} — "${trunc(s["relationship_reason"])}"
- Confidence: ${txt(String(s["confidence_score"] ?? "—"))}/10
- Growth: ${txt(s["growth_rag"])} — "${trunc(s["growth_reason"])}"
- Overall: ${txt(s["overall_rag"])}
- Planned action: ${txt(s["next_action"])} (${txt(s["action_owner"])}, ${txt(String(s["action_deadline"] ?? "—"))})
${staleNote}
PREVIOUS 3 CYCLES (most recent first):
${historyBlock}

ACTION OUTCOMES SINCE LAST CYCLE:
${actionBlock}

FOLLOW-UP Q&A (the enriched context):
${qaBlock}

Produce the analysis.`;

    // Create agent_outputs row
    const { data: output, error: outErr } = await supabase
      .from("agent_outputs")
      .insert({
        submission_id,
        client_id: submission.client_id,
        cycle_id: submission.cycle_id,
        type: "batch",
        status: "pending",
      })
      .select("id")
      .single();
    if (outErr) throw outErr;

    // Call Claude with retry
    let result = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1600,
            system: BATCH_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
        if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
        const aiData = await res.json() as { content?: { type: string; text?: string }[] };
        const raw = aiData.content?.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n") ?? "";
        const clean = raw.replace(/```json|```/g, "").trim();
        result = JSON.parse(clean);
        break;
      } catch (err) {
        lastError = err;
        if (attempt < 2) await sleep(1000 * Math.pow(2, attempt));
      }
    }

    if (!result) {
      await supabase.from("agent_outputs").update({ status: "failed" }).eq("id", output.id);
      throw lastError;
    }

    // Update agent_outputs
    await supabase.from("agent_outputs").update({
      status: "complete",
      insight_narrative: result.insight_narrative,
      trajectory_flag: result.trajectory_flag,
      upsell_window: result.upsell_window,
      recommended_actions: result.recommended_actions,
    }).eq("id", output.id);

    // Insert agent_deltas
    await supabase.from("agent_deltas").insert({
      agent_output_id: output.id,
      client_id: submission.client_id,
      cycle_id: submission.cycle_id,
      risk_before: result.delta.risk_before,
      risk_after: result.delta.risk_after,
      new_flags: result.delta.new_flags,
      resolved_flags: result.delta.resolved_flags,
      summary: result.delta.summary,
    });

    // Update client memory summary
    if (result.memory_summary?.trim()) {
      await supabase.from("clients")
        .update({ memory_summary: result.memory_summary })
        .eq("id", submission.client_id);
    }

    return json({ ok: true, agent_output_id: output.id, trajectory: result.trajectory_flag.direction });
  } catch (err) {
    console.error("batch-analysis error:", err);
    return json({ ok: false, reason: "agent_failed" }, 200);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}









