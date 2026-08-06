import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supa = SupabaseClient<Database>;

export type GeneratedQuestion = { text: string; context: string };
export type ValidationFlag = {
  field: "performance" | "relationship" | "growth" | "confidence";
  issue: string;
  severity: "low" | "medium" | "high";
};
export type AgentResult = {
  questions: GeneratedQuestion[];
  validation_flags: ValidationFlag[];
  hidden_risk: boolean;
  hidden_risk_reason: string;
};

export const SYSTEM_PROMPT = (n: number) =>
  `You are the Client Health agent for Algorithm Agency, a South African digital marketing agency. Client Impact leads (CIs) score their clients bi-weekly on Performance, Relationship and Growth (RAG: Green/Amber/Red) plus a 1-10 confidence score ("will this client still be with us in 12 months").

Your job right now: read the CI's scores and reasons for ONE client and generate ${n} sharp follow-up questions that a perceptive colleague would ask. Rules:

- Questions must be SPECIFIC to what the CI wrote — reference names, events, and details from their reasons. Never generic.

- Surface what the CI knows but hasn't written: gut-read, what's been tried, stakeholder shifts, whether the client is comparing agencies.

- Do NOT ask things the CI already answered in their reasons.

- Do NOT repeat questions asked in the previous cycle (provided below) — build on their previous answers instead.

- Also validate: flag any contradiction between a score and its reason (e.g. Green relationship but reason mentions the client is unresponsive).

- Hidden risk rule: overall Green with confidence <= 4 is a hidden risk.

Respond ONLY with JSON, no preamble, no markdown fences:

{"questions":[{"text":"...","context":"one line on why you're asking"}],"validation_flags":[{"field":"performance|relationship|growth|confidence","issue":"...","severity":"low|medium|high"}],"hidden_risk":false,"hidden_risk_reason":""}`;

export function questionCount(overallRag: string | null): number {
  if (overallRag === "Red") return 6;
  if (overallRag === "Amber") return 4;
  return 2;
}

type Row = Record<string, unknown>;

function txt(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

export function buildUserPrompt(args: {
  client: Row;
  submission: Row;
  previous: Row | null;
  previousQa: { question_text: string; answer_text: string | null }[];
  n: number;
}): string {
  const { client, submission: s, previous: p, previousQa, n } = args;
  const leads = Array.isArray(client["ci_leads"]) ? (client["ci_leads"] as string[]).join(", ") : "—";

  const qa =
    previousQa.length > 0
      ? previousQa
          .map((q) => `- Q: ${q.question_text}\n  A: ${txt(q.answer_text, "(unanswered)")}`)
          .join("\n")
      : '(first detailed cycle — none)';

  return `CLIENT: ${txt(client["name"])}

CI lead: ${leads} · Director support: ${txt(client["director_support"])} · Tier ${txt(client["tier"])}

THIS CYCLE'S SUBMISSION:

- SEO/Performance: ${txt(s["performance_rag"])} — "${txt(s["performance_reason"], "")}"

- Paid performance: ${txt(s["paid_rag"])} — "${txt(s["paid_reason"], "")}"

- Relationship: ${txt(s["relationship_rag"])} — "${txt(s["relationship_reason"], "")}"

- Confidence score: ${txt(String(s["confidence_score"] ?? "—"))}/10

- Growth: ${txt(s["growth_rag"])} — "${txt(s["growth_reason"], "")}"

- Overall RAG: ${txt(s["overall_rag"])}

- Planned next action: ${txt(s["next_action"])}

PREVIOUS CYCLE:

${
  p
    ? `- Performance ${txt(p["performance_rag"])}, Relationship ${txt(p["relationship_rag"])}, Growth ${txt(
        p["growth_rag"],
      )}, Confidence ${txt(String(p["confidence_score"] ?? "—"))}/10

- Prior reasons: perf "${txt(p["performance_reason"], "")}" · rel "${txt(p["relationship_reason"], "")}" · growth "${txt(
        p["growth_reason"],
        "",
      )}"`
    : "(no previous submission)"
}

PREVIOUS CYCLE Q&A:

${qa}

Generate exactly ${n} questions.`;
}

/** Strips markdown fences and parses; returns null when the payload is not usable JSON. */
export function parseAgentJson(raw: string): AgentResult | null {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<AgentResult>;
    if (!Array.isArray(parsed.questions)) return null;
    const questions = parsed.questions
      .map((q) => {
        const row = q as Row;
        const t = typeof row["text"] === "string" ? row["text"] : null;
        if (!t) return null;
        return { text: t, context: typeof row["context"] === "string" ? row["context"] : "" };
      })
      .filter((q): q is GeneratedQuestion => q !== null);
    if (questions.length === 0) return null;
    return {
      questions,
      validation_flags: Array.isArray(parsed.validation_flags)
        ? (parsed.validation_flags as ValidationFlag[])
        : [],
      hidden_risk: Boolean(parsed.hidden_risk),
      hidden_risk_reason:
        typeof parsed.hidden_risk_reason === "string" ? parsed.hidden_risk_reason : "",
    };
  } catch {
    return null;
  }
}

const MODEL = "claude-sonnet-4-6";

export async function callModel(system: string, user: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system,
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

export type LoadedContext = {
  client: Row;
  submission: Row;
  previous: Row | null;
  previousQa: { question_text: string; answer_text: string | null }[];
};

export async function loadContext(supabase: Supa, submissionId: string): Promise<LoadedContext> {
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (error) throw error;

  const [clientRes, priorRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", submission.client_id).single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("client_id", submission.client_id)
      .neq("id", submissionId)
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(1),
  ]);
  if (clientRes.error) throw clientRes.error;
  if (priorRes.error) throw priorRes.error;

  const previous = priorRes.data?.[0] ?? null;
  let previousQa: { question_text: string; answer_text: string | null }[] = [];
  if (previous) {
    const { data: qa } = await supabase
      .from("questions")
      .select("question_text, answer_text")
      .eq("submission_id", previous.id);
    previousQa = qa ?? [];
  }

  return { client: clientRes.data as Row, submission: submission as Row, previous, previousQa };
}

export async function persistValidation(
  supabase: Supa,
  submissionId: string,
  result: AgentResult,
): Promise<void> {
  const { error } = await supabase
    .from("submissions")
    .update({
      validation_flags: result.validation_flags,
      hidden_risk: result.hidden_risk,
      hidden_risk_reason: result.hidden_risk_reason || null,
    })
    .eq("id", submissionId);
  if (error) throw error;
}
