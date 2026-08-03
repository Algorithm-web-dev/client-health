import { db, type ActionLog, type AgentDelta, type AgentOutput, type Client, type Review, type Submission } from "@/lib/db";

export type RecommendedAction = {
  action: string;
  owner: string | null;
  urgency: "this_week" | "this_cycle" | "next_cycle" | null;
};

export type UpsellWindow = {
  open: boolean;
  rationale: string | null;
  suggested_service: string | null;
};

export type TrajectoryFlag = {
  direction: string | null;
  categories: string[];
  note: string | null;
};

export function parseRecommendedActions(value: unknown): RecommendedAction[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const r = raw as Record<string, unknown>;
    const action = typeof r["action"] === "string" ? r["action"] : null;
    if (!action) return [];
    const urgency = r["urgency"];
    return [
      {
        action,
        owner: typeof r["owner"] === "string" ? r["owner"] : null,
        urgency:
          urgency === "this_week" || urgency === "this_cycle" || urgency === "next_cycle"
            ? urgency
            : null,
      },
    ];
  });
}

export function parseUpsell(value: unknown): UpsellWindow | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  return {
    open: r["open"] === true,
    rationale: typeof r["rationale"] === "string" ? r["rationale"] : null,
    suggested_service: typeof r["suggested_service"] === "string" ? r["suggested_service"] : null,
  };
}

export function parseTrajectory(value: unknown): TrajectoryFlag | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  return {
    direction: typeof r["direction"] === "string" ? r["direction"] : null,
    categories: Array.isArray(r["categories"]) ? r["categories"].filter((c): c is string => typeof c === "string") : [],
    note: typeof r["note"] === "string" ? r["note"] : null,
  };
}

export function parseFlags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export type ReviewItem = {
  client: Client;
  output: AgentOutput;
  delta: AgentDelta | null;
  submission: Submission | null;
  review: Review | null;
  actions: ActionLog[];
  recommended: RecommendedAction[];
};

function isLeadFor(client: Client, identifiers: string[]): boolean {
  const leads = (client.ci_leads ?? []).map((l) => l.trim().toLowerCase());
  return identifiers.some((id) => leads.includes(id));
}

/** Completed agent output for this CI's clients, newest first. Admins/directors see all. */
export async function fetchReviewQueue(
  identifiers: string[],
  seeAll: boolean,
): Promise<ReviewItem[]> {
  const [outputsRes, clientsRes, deltasRes, subsRes, reviewsRes, actionsRes] = await Promise.all([
    db.agentOutputs().select("*").order("created_at", { ascending: false, nullsFirst: false }),
    db.clients().select("*"),
    db.agentDeltas().select("*"),
    db.submissions().select("*"),
    db.reviews().select("*").order("reviewed_at", { ascending: false, nullsFirst: false }),
    db.actionLog().select("*").order("created_at", { ascending: false, nullsFirst: false }),
  ]);
  for (const res of [outputsRes, clientsRes, deltasRes, subsRes, reviewsRes, actionsRes]) {
    if (res.error) throw res.error;
  }

  const ids = identifiers.filter(Boolean).map((i) => i.trim().toLowerCase());
  const clients = new Map((clientsRes.data ?? []).map((c) => [c.id, c]));

  return (outputsRes.data ?? [])
    .filter((o) => o.status === "complete" || o.status === "completed" || Boolean(o.insight_narrative))
    .flatMap((output) => {
      const client = clients.get(output.client_id);
      if (!client) return [];
      if (!seeAll && !isLeadFor(client, ids)) return [];
      return [
        {
          client,
          output,
          delta: (deltasRes.data ?? []).find((d) => d.agent_output_id === output.id) ?? null,
          submission: (subsRes.data ?? []).find((s) => s.id === output.submission_id) ?? null,
          review: (reviewsRes.data ?? []).find((r) => r.agent_output_id === output.id) ?? null,
          actions: (actionsRes.data ?? []).filter(
            (a) => a.client_id === output.client_id && a.cycle_id === output.cycle_id,
          ),
          recommended: parseRecommendedActions(output.recommended_actions),
        },
      ];
    });
}

export async function saveDecision(input: {
  agentOutputId: string;
  decision: "confirm" | "override";
  overrideReason?: string;
  reviewedBy: string;
}) {
  if (input.decision === "override" && (input.overrideReason ?? "").trim().length < 20) {
    throw new Error("An override reason of at least 20 characters is required.");
  }
  const { error } = await db.reviews().insert({
    agent_output_id: input.agentOutputId,
    decision: input.decision,
    override_reason: input.decision === "override" ? (input.overrideReason ?? "").trim() : null,
    reviewed_by: input.reviewedBy,
  });
  if (error) throw error;
}

export async function acceptAction(input: {
  clientId: string;
  cycleId: string;
  description: string;
  owner: string | null;
  deadline: string | null;
}) {
  const { error } = await db.actionLog().insert({
    client_id: input.clientId,
    cycle_id: input.cycleId,
    description: input.description,
    owner: input.owner,
    deadline: input.deadline,
    status: "open",
  });
  if (error) throw error;
}

export async function dismissAction(input: {
  clientId: string;
  cycleId: string;
  description: string;
}) {
  const { error } = await db.actionLog().insert({
    client_id: input.clientId,
    cycle_id: input.cycleId,
    description: input.description,
    status: "dismissed",
  });
  if (error) throw error;
}


export async function setActionOutcome(input: {
  id: string;
  outcome: string;
  status?: string;
}) {
  const { error } = await db
    .actionLog()
    .update({ outcome: input.outcome, status: input.status ?? "closed" })
    .eq("id", input.id);
  if (error) throw error;
}

export const ACTION_OUTCOMES = [
  { value: "done", label: "Done" },
  { value: "no_change", label: "No change" },
  { value: "client_responded", label: "Client responded" },
  { value: "improved", label: "Improved" },
  { value: "worsened", label: "Worsened" },
] as const;
