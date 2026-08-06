
import { generateQuestions } from "@/lib/questions.functions";
import { db, type Client, type Cycle, type Rag, type Submission } from "@/lib/db";


export type WizardForm = {
  performance_rag: Rag | null;
  performance_reason: string;
  paid_rag: Rag | null;
  paid_reason: string;
  relationship_rag: Rag | null;
  relationship_reason: string;
  confidence_score: number;
  growth_rag: Rag | null;
  growth_reason: string;
  upsell_opportunity: string;
  upsell_value: string;
  upsell_probability: string;
  next_action: string;
  action_owner: string;
  action_deadline: string;
};

export const EMPTY_FORM: WizardForm = {
  performance_rag: null,
  performance_reason: "",
  paid_rag: null,
  paid_reason: "",
  relationship_rag: null,
  relationship_reason: "",
  confidence_score: 7,
  growth_rag: null,
  growth_reason: "",
  upsell_opportunity: "",
  upsell_value: "",
  upsell_probability: "",
  next_action: "",
  action_owner: "",
  action_deadline: "",
};

export function formFromSubmission(s: Submission): WizardForm {
  return {
    performance_rag: (s.performance_rag as Rag | null) ?? null,
    performance_reason: s.performance_reason ?? "",
    paid_rag: (s.paid_rag as Rag | null) ?? null,
    paid_reason: s.paid_reason ?? "",
    relationship_rag: (s.relationship_rag as Rag | null) ?? null,
    relationship_reason: s.relationship_reason ?? "",
    confidence_score: s.confidence_score ?? 7,
    growth_rag: (s.growth_rag as Rag | null) ?? null,
    growth_reason: s.growth_reason ?? "",
    upsell_opportunity: s.upsell_opportunity ?? "",
    upsell_value: s.upsell_value ?? "",
    upsell_probability: s.upsell_probability == null ? "" : String(s.upsell_probability),
    next_action: s.next_action ?? "",
    action_owner: s.action_owner ?? "",
    action_deadline: s.action_deadline ?? "",
  };
}

const RAG_RANK: Record<Rag, number> = { Green: 0, Amber: 1, Red: 2 };

/** Worst of performance / paid / relationship / growth; all-Green with low confidence bumps to Amber. */
export function computeOverallRag(form: WizardForm): Rag | null {
  const rags = [form.performance_rag, form.paid_rag, form.relationship_rag, form.growth_rag].filter(
    (r): r is Rag => r !== null,
  );
  if (rags.length === 0) return null;
  let worst: Rag = "Green";
  for (const r of rags) if (RAG_RANK[r] > RAG_RANK[worst]) worst = r;
  if (worst === "Green" && form.confidence_score <= 4) return "Amber";
  return worst;
}

export type FallbackQuestion = { question_text: string; question_context: string | null };

/** Static fallbacks used when the agent is unavailable: 2 for Green, 4 for Amber, 5 for Red. */
export const FALLBACK_QUESTIONS: Record<Rag, FallbackQuestion[]> = {
  Green: [
    { question_text: "What is the single biggest risk to this account over the next 3 months?", question_context: null },
    { question_text: "What would need to happen for this client to increase their spend with us?", question_context: null },
  ],
  Amber: [
    { question_text: "What specifically moved this account away from Green this cycle?", question_context: null },
    { question_text: "Which stakeholder is least satisfied right now, and why?", question_context: null },
    { question_text: "What is the one metric the client is judging us on today?", question_context: null },
    { question_text: "What needs to change before the next cycle to move this back to Green?", question_context: null },
  ],
  Red: [
    { question_text: "What is the root cause of the Red status — delivery, results, or relationship?", question_context: null },
    { question_text: "Has the client raised the possibility of reducing scope or leaving?", question_context: null },
    { question_text: "Which commitments have we missed, and when?", question_context: null },
    { question_text: "Who from our side owns the recovery plan, and what is the first step?", question_context: null },
    { question_text: "What support do you need from the director to save this account?", question_context: null },
  ],
};

export type AgentQuestion = { question_text: string; question_context: string | null };

export type OpenCycleData = {
  cycle: Cycle | null;
  clients: Client[];
};

function isLeadFor(client: Client, identifiers: string[]): boolean {
  const leads = (client.ci_leads ?? []).map((l) => l.trim().toLowerCase());
  return identifiers.some((id) => {
    const idLower = id.toLowerCase();
    // Exact match
    if (leads.includes(idLower)) return true;
    // First-name match: "Daniel Smith" matches "Daniel"
    const firstName = idLower.split(/[\s@]/)[0];
    if (firstName && leads.some((l) =>
      l === firstName ||
      l.startsWith(firstName + " ") ||
      firstName.startsWith(l + " ")
    )) return true;
    // Email-prefix match: "daniel@algorithm.agency" matches "daniel"
    if (id.includes("@")) {
      const prefix = id.split("@")[0].toLowerCase();
      if (leads.some((l) => l === prefix || prefix.startsWith(l) || l.startsWith(prefix))) return true;
    }
    return false;
  });
}

/** Open cycle plus the clients this CI leads (admins see all active clients). */
export async function fetchWizardContext(
  identifiers: string[],
  isAdmin: boolean,
): Promise<OpenCycleData> {
  const [cycleRes, clientsRes] = await Promise.all([
    db.cycles().select("*").eq("status", "open").order("start_date", { ascending: false }).limit(1),
    db.clients().select("*").eq("status", "active").order("name"),
  ]);
  if (cycleRes.error) throw cycleRes.error;
  if (clientsRes.error) throw clientsRes.error;

  const ids = identifiers.filter(Boolean).map((i) => i.trim().toLowerCase());
  const all = clientsRes.data ?? [];
  return {
    cycle: cycleRes.data?.[0] ?? null,
    clients: isAdmin ? all : all.filter((c) => isLeadFor(c, ids)),
  };
}

export type ClientSubmissions = {
  current: Submission | null;
  previous: Submission | null;
  fastPathStreak: number;
};

/** Current-cycle submission (edit target), latest prior submission (pre-fill), consecutive fast-path count. */
export async function fetchClientSubmissions(
  clientId: string,
  cycleId: string,
): Promise<ClientSubmissions> {
  const { data, error } = await db
    .submissions()
    .select("*")
    .eq("client_id", clientId)
    .order("submitted_at", { ascending: false, nullsFirst: false });
  if (error) throw error;

  const rows = data ?? [];
  const current = rows.find((r) => r.cycle_id === cycleId) ?? null;
  const prior = rows.filter((r) => r.cycle_id !== cycleId);
  let streak = 0;
  for (const r of prior) {
    if (r.fast_path) streak += 1;
    else break;
  }
  return { current, previous: prior[0] ?? null, fastPathStreak: streak };
}

export type SaveArgs = {
  clientId: string;
  cycleId: string;
  userId: string;
  existingId: string | null;
  fastPath: boolean;
  form: WizardForm;
};

export async function saveSubmission({
  clientId,
  cycleId,
  userId,
  existingId,
  fastPath,
  form,
}: SaveArgs): Promise<Submission> {
  const probability = form.upsell_probability.trim() === "" ? null : Number(form.upsell_probability);
  const payload = {
    client_id: clientId,
    cycle_id: cycleId,
    submitted_by: userId,
    fast_path: fastPath,
    performance_rag: form.performance_rag,
    performance_reason: form.performance_reason || null,
    paid_rag: form.paid_rag,
    paid_reason: form.paid_reason || null,
    relationship_rag: form.relationship_rag,
    relationship_reason: form.relationship_reason || null,
    confidence_score: form.confidence_score,
    growth_rag: form.growth_rag,
    growth_reason: form.growth_reason || null,
    overall_rag: computeOverallRag(form),
    upsell_opportunity: form.upsell_opportunity || null,
    upsell_value: form.upsell_value || null,
    upsell_probability: probability != null && Number.isFinite(probability) ? probability : null,
    next_action: form.next_action || null,
    action_owner: form.action_owner || null,
    action_deadline: form.action_deadline || null,
    status: "phase1_complete",
    submitted_at: new Date().toISOString(),
  };

  const query = existingId
    ? db.submissions().update(payload).eq("id", existingId).select("*").single()
    : db.submissions().upsert(payload, { onConflict: "client_id,cycle_id" }).select("*").single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

const AGENT_TIMEOUT_MS = 45_000;

/** Calls the generate-questions function; resolves to null on error or after 10s. */
export async function requestAgentQuestions(submissionId: string): Promise<AgentQuestion[] | null> {
  const call = (async () => {
    const data = await generateQuestions({ data: { submission_id: submissionId } });
    const list = (data as { questions?: unknown } | null)?.questions;
    if (!Array.isArray(list) || list.length === 0) return null;
    return list
      .map((q) => {
        const row = q as Record<string, unknown>;
        const text = typeof row["text"] === "string" ? row["text"] : null;
        if (!text) return null;
        const ctx = typeof row["context"] === "string" && row["context"] ? row["context"] : null;
        return { question_text: text, question_context: ctx } satisfies AgentQuestion;
      })
      .filter((q): q is AgentQuestion => q !== null);
  })();


  console.log('[wizard] calling requestAgentQuestions for', submissionId); const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), AGENT_TIMEOUT_MS));
  try {
    const result = await Promise.race([call, timeout]); console.log('[wizard] agent result:', result); return result;
  } catch (err) {
    console.error("[wizard] SERVER FUNCTION ERROR:", JSON.stringify(err, null, 2));
    return null;
  }
}

export type AnsweredQuestion = AgentQuestion & { answer_text: string };

export async function finalizeSubmission(args: {
  submission: Submission;
  answers: AnsweredQuestion[];
  isFallback: boolean;
  ragAtTime: Rag | null;
}): Promise<void> {
  const { submission, answers, isFallback, ragAtTime } = args;

  if (answers.length > 0) {
    const { error } = await db.questions().insert(
      answers.map((a) => ({
        submission_id: submission.id,
        client_id: submission.client_id,
        cycle_id: submission.cycle_id,
        question_text: a.question_text,
        question_context: a.question_context,
        answer_text: a.answer_text || null,
        generated_by_agent: !isFallback,
        is_fallback: isFallback,
        rag_at_time: ragAtTime,
      })),
    );
    if (error) throw error;
  }

  const { error: updateError } = await db
    .submissions()
    .update({ status: "submitted" })
    .eq("id", submission.id);
  if (updateError) throw updateError;
}



