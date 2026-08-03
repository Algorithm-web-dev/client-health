import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supa = SupabaseClient<Database>;
type Row = Record<string, unknown>;

const MODEL = "claude-sonnet-4-6";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type BatchResult = {
  insight_narrative: string;
  trajectory_flag: {
    direction: "improving" | "stable" | "deteriorating";
    categories: string[];
    note: string;
  };
  upsell_window: { open: boolean; rationale: string; suggested_service: string };
  recommended_actions: {
    action: string;
    owner: string;
    urgency: "this_week" | "this_cycle" | "next_cycle";
  }[];
  delta: {
    risk_before: RiskLevel;
    risk_after: RiskLevel;
    new_flags: string[];
    resolved_flags: string[];
    summary: string;
  };
  memory_summary: string;
};

/** Batch (phase 3) system prompt — Appendix B.2. */
export const BATCH_SYSTEM_PROMPT = `You are the Client Health agent for Algorithm Agency. A CI has submitted their bi-weekly scores for a client AND answered your follow-up questions. Produce the full analysis.

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

/** Compact one-line-per-category history line for a prior cycle. */
function compactCycleLine(s: Row): string {
  return `- ${txt(s["cycle_id"])}${s["fast_path"] ? " [fast path]" : ""}: Perf ${txt(s["performance_rag"])} · Paid ${txt(s["paid_rag"])} · Rel ${txt(s["relationship_rag"])} · Growth ${txt(s["growth_rag"])} · Confidence ${txt(String(s["confidence_score"] ?? "—"))}/10 · Overall ${txt(s["overall_rag"])} — rel: "${txt(s["relationship_reason"], "")}"`;
}

export function buildBatchUserPrompt(args: {
  client: Row;
  submission: Row;
  qa: { question_text: string; answer_text: string | null }[];
  history: Row[];
  actions: Row[];
  fastPathStreak: number;
}): string {
  const { client, submission: s, qa, history, actions, fastPathStreak } = args;
  const leads = Array.isArray(client["ci_leads"]) ? (client["ci_leads"] as string[]).join(", ") : "—";

  const staleNote =
    fastPathStreak >= 3
      ? `\nNOTE: this client has had no detailed review for ${fastPathStreak} consecutive cycles — flag this.\n`
      : "";

  const qaBlock =
    qa.length > 0
      ? qa.map((q) => `- Q: ${q.question_text}\n  A: ${txt(q.answer_text, "(unanswered)")}`).join("\n")
      : "(no follow-up questions answered this cycle)";

  const historyBlock =
    history.length > 0 ? history.map(compactCycleLine).join("\n") : "(no prior cycles)";

  const actionBlock =
    actions.length > 0
      ? actions
          .map(
            (a) =>
              `- ${txt(a["description"])} (owner ${txt(a["owner"])}, due ${txt(String(a["deadline"] ?? "—"))}) → status ${txt(a["status"])}${a["outcome"] ? `, outcome: ${txt(a["outcome"])}` : ", outcome: (none recorded)"}`,
          )
          .join("\n")
      : "(none logged)";

  return `CLIENT: ${txt(client["name"])} (CI: ${leads}, Director: ${txt(client["director_support"])})

CLIENT MEMORY (rolling summary from previous cycles):

${txt(client["memory_summary"], "(none yet — first cycle)")}

THIS CYCLE:

- SEO/Performance: ${txt(s["performance_rag"])} — "${txt(s["performance_reason"], "")}"

- Paid: ${txt(s["paid_rag"])} — "${txt(s["paid_reason"], "")}"

- Relationship: ${txt(s["relationship_rag"])} — "${txt(s["relationship_reason"], "")}"

- Confidence: ${txt(String(s["confidence_score"] ?? "—"))}/10

- Growth: ${txt(s["growth_rag"])} — "${txt(s["growth_reason"], "")}"

- Overall: ${txt(s["overall_rag"])}

- Planned action: ${txt(s["next_action"])} (${txt(s["action_owner"])}, ${txt(String(s["action_deadline"] ?? "—"))})

PREVIOUS 3 CYCLES (most recent first):

${historyBlock}

ACTION OUTCOMES SINCE LAST CYCLE:

${actionBlock}

FOLLOW-UP Q&A (the enriched context):

${qaBlock}
${staleNote}
Produce the analysis.`;
}

export function parseBatchJson(raw: string): BatchResult | null {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const p = JSON.parse(text.slice(start, end + 1)) as Partial<BatchResult> & Row;
    if (typeof p.insight_narrative !== "string" || p.insight_narrative.trim() === "") return null;
    const tf = (p.trajectory_flag ?? {}) as Row;
    const direction =
      tf["direction"] === "improving" || tf["direction"] === "deteriorating" ? tf["direction"] : "stable";
    const uw = (p.upsell_window ?? {}) as Row;
    const d = (p.delta ?? {}) as Row;
    const strings = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    const risk = (v: unknown): RiskLevel =>
      v === "Low" || v === "Medium" || v === "High" || v === "Critical" ? v : "Medium";
    const urgency = (v: unknown): "this_week" | "this_cycle" | "next_cycle" =>
      v === "this_week" || v === "next_cycle" ? v : "this_cycle";
    return {
      insight_narrative: p.insight_narrative,
      trajectory_flag: {
        direction,
        categories: strings(tf["categories"]),
        note: typeof tf["note"] === "string" ? tf["note"] : "",
      },
      upsell_window: {
        open: Boolean(uw["open"]),
        rationale: typeof uw["rationale"] === "string" ? uw["rationale"] : "",
        suggested_service:
          typeof uw["suggested_service"] === "string" ? uw["suggested_service"] : "",
      },
      recommended_actions: Array.isArray(p.recommended_actions)
        ? (p.recommended_actions as Row[]).map((a) => ({
            action: txt(a["action"], ""),
            owner: txt(a["owner"], ""),
            urgency: urgency(a["urgency"]),
          }))
        : [],
      delta: {
        risk_before: risk(d["risk_before"]),
        risk_after: risk(d["risk_after"]),
        new_flags: strings(d["new_flags"]),
        resolved_flags: strings(d["resolved_flags"]),
        summary: txt(d["summary"], ""),
      },
      memory_summary: typeof p.memory_summary === "string" ? p.memory_summary : "",
    };
  } catch {
    return null;
  }
}

async function callBatchModel(user: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1600,
      system: BATCH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${body.slice(0, 300)}`);
  }
  const json = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  return (
    json.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("\n") ?? ""
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Up to 3 attempts with exponential backoff; throws when all attempts fail. */
export async function callBatchModelWithRetry(user: string, apiKey: string): Promise<BatchResult> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const parsed = parseBatchJson(await callBatchModel(user, apiKey));
      if (parsed) return parsed;
      lastError = new Error("parse_failed");
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await sleep(1000 * 2 ** attempt);
  }
  throw lastError instanceof Error ? lastError : new Error("batch_failed");
}

export type BatchContext = {
  client: Row;
  submission: Row;
  qa: { question_text: string; answer_text: string | null }[];
  history: Row[];
  actions: Row[];
  fastPathStreak: number;
};

/** Loads everything the batch agent needs for one submission. */
export async function loadBatchContext(supabase: Supa, submissionId: string): Promise<BatchContext> {
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  const [clientRes, qaRes, historyRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", submission.client_id).single(),
    supabase
      .from("questions")
      .select("question_text, answer_text")
      .eq("submission_id", submissionId),
    supabase
      .from("submissions")
      .select("*")
      .eq("client_id", submission.client_id)
      .neq("id", submissionId)
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(3),
  ]);
  if (clientRes.error) throw clientRes.error;
  if (historyRes.error) throw historyRes.error;

  const history = historyRes.data ?? [];
  const previousCycleId = history[0]?.cycle_id ?? null;

  let actions: Row[] = [];
  if (previousCycleId) {
    const { data } = await supabase
      .from("action_log")
      .select("description, owner, deadline, status, outcome, cycle_id, created_at")
      .eq("client_id", submission.client_id)
      .in("cycle_id", [previousCycleId, submission.cycle_id]);
    actions = (data ?? []) as Row[];
  }

  // Consecutive fast-path submissions ending with this one.
  let fastPathStreak = 0;
  for (const s of [submission, ...history]) {
    if (s.fast_path) fastPathStreak += 1;
    else break;
  }

  return {
    client: clientRes.data as Row,
    submission: submission as Row,
    qa: qaRes.data ?? [],
    history: history as Row[],
    actions,
    fastPathStreak,
  };
}
