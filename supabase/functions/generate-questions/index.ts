import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "claude-sonnet-4-6";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { submission_id } = await req.json();
    if (!submission_id) return json({ error: "missing submission_id" }, 400);

    // Keys from Supabase Vault — never in code
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Load submission, client, prior submission, prior Q&A
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submission_id)
      .single();
    if (subErr) throw subErr;

    const [clientRes, priorRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", submission.client_id).single(),
      supabase
        .from("submissions")
        .select("*")
        .eq("client_id", submission.client_id)
        .neq("id", submission_id)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(1),
    ]);
    if (clientRes.error) throw clientRes.error;

    const client = clientRes.data;
    const previous = priorRes.data?.[0] ?? null;
    let previousQa: { question_text: string; answer_text: string | null }[] = [];
    if (previous) {
      const { data: qa } = await supabase
        .from("questions")
        .select("question_text, answer_text")
        .eq("submission_id", previous.id);
      previousQa = qa ?? [];
    }

    // Question count by RAG
    const n = submission.overall_rag === "Red" ? 6 : submission.overall_rag === "Amber" ? 4 : 2;

    // Build prompts
    const leads = Array.isArray(client.ci_leads) ? client.ci_leads.join(", ") : "—";
    const qa =
      previousQa.length > 0
        ? previousQa.map((q) => `- Q: ${q.question_text}\n  A: ${q.answer_text ?? "(unanswered)"}`).join("\n")
        : "(first detailed cycle — none)";

    const prev = previous as Record<string, unknown> | null;
    const systemPrompt = `You are the Client Health agent for Algorithm Agency, a South African digital marketing agency. Client Impact leads (CIs) score their clients bi-weekly on Performance, Relationship and Growth (RAG: Green/Amber/Red) plus a 1-10 confidence score ("will this client still be with us in 12 months").

Your job right now: read the CI's scores and reasons for ONE client and generate ${n} sharp follow-up questions that a perceptive colleague would ask. Rules:
- Questions must be SPECIFIC to what the CI wrote — reference names, events, and details from their reasons. Never generic.
- Surface what the CI knows but hasn't written: gut-read, what's been tried, stakeholder shifts, whether the client is comparing agencies.
- Do NOT ask things the CI already answered in their reasons.
- Do NOT repeat questions asked in the previous cycle (provided below) — build on their previous answers instead.
- Also validate: flag any contradiction between a score and its reason (e.g. Green relationship but reason mentions the client is unresponsive).
- Hidden risk rule: overall Green with confidence <= 4 is a hidden risk.

Respond ONLY with JSON, no preamble, no markdown fences:
{"questions":[{"text":"...","context":"one line on why you're asking"}],"validation_flags":[{"field":"performance|relationship|growth|confidence","issue":"...","severity":"low|medium|high"}],"hidden_risk":false,"hidden_risk_reason":""}`;

    const userPrompt = `CLIENT: ${client.name}
CI lead: ${leads} · Director support: ${client.director_support ?? "—"} · Tier ${client.tier ?? "—"}

THIS CYCLE'S SUBMISSION:
- SEO/Performance: ${submission.performance_rag} — "${submission.performance_reason ?? ""}"
- Paid performance: ${submission.paid_rag} — "${submission.paid_reason ?? ""}"
- Relationship: ${submission.relationship_rag} — "${submission.relationship_reason ?? ""}"
- Confidence score: ${submission.confidence_score}/10
- Growth: ${submission.growth_rag} — "${submission.growth_reason ?? ""}"
- Overall RAG: ${submission.overall_rag}
- Planned next action: ${submission.next_action ?? "(none)"}

PREVIOUS CYCLE:
- Performance ${prev?.performance_rag ?? "—"}, Relationship ${prev?.relationship_rag ?? "—"}, Growth ${prev?.growth_rag ?? "—"}, Confidence ${prev?.confidence_score ?? "—"}/10
- Prior reasons: perf "${prev?.performance_reason ?? ""}" · rel "${prev?.relationship_reason ?? ""}" · growth "${prev?.growth_reason ?? ""}"

PREVIOUS CYCLE Q&A (do not repeat these questions):
${qa}

Generate exactly ${n} questions.`;

    // Call Claude
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);

    const aiData = await res.json() as { content?: { type: string; text?: string }[] };
    const raw = aiData.content?.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n") ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      return json({ error: "parse_failed" }, 200);
    }

    // Store validation flags back to submission
    await supabase.from("submissions").update({
      validation_flags: result.validation_flags ?? [],
      hidden_risk: result.hidden_risk ?? false,
      hidden_risk_reason: result.hidden_risk_reason ?? null,
    }).eq("id", submission_id);

    return json({
      questions: result.questions ?? [],
      validation_flags: result.validation_flags ?? [],
      hidden_risk: result.hidden_risk ?? false,
      hidden_risk_reason: result.hidden_risk_reason ?? "",
    });
  } catch (err) {
    console.error("generate-questions error:", err);
    return json({ error: "parse_failed" }, 200);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}


