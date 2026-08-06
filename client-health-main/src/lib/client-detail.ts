import { db, type ActionLog, type AgentDelta, type AgentOutput, type Client, type Submission } from "@/lib/db";

export type ScorePoint = {
  cycle: string;
  performance: number | null;
  paid: number | null;
  relationship: number | null;
  growth: number | null;
  overall: number | null;
  confidence: number | null;
};

export const RAG_VALUE: Record<string, number> = { Red: 1, Amber: 2, Green: 3 };

export function ragValue(value: string | null): number | null {
  if (!value) return null;
  return RAG_VALUE[value] ?? null;
}

export type ClientDetail = {
  client: Client;
  submissions: Submission[];
  outputs: AgentOutput[];
  deltas: AgentDelta[];
  actions: ActionLog[];
  scores: ScorePoint[];
};

/** Everything the drill-down needs: score history, deltas, insights and actions. */
export async function fetchClientDetail(clientId: string): Promise<ClientDetail> {
  const [clientRes, subsRes, outputsRes, deltasRes, actionsRes] = await Promise.all([
    db.clients().select("*").eq("id", clientId).maybeSingle(),
    db.submissions().select("*").eq("client_id", clientId),
    db.agentOutputs().select("*").eq("client_id", clientId),
    db.agentDeltas().select("*").eq("client_id", clientId),
    db.actionLog().select("*").eq("client_id", clientId),
  ]);
  for (const res of [clientRes, subsRes, outputsRes, deltasRes, actionsRes]) {
    if (res.error) throw res.error;
  }
  if (!clientRes.data) throw new Error("Client not found");

  const byCycle = (a: { cycle_id: string }, b: { cycle_id: string }) =>
    a.cycle_id.localeCompare(b.cycle_id);
  const submissions = [...(subsRes.data ?? [])].sort(byCycle);

  return {
    client: clientRes.data,
    submissions,
    outputs: [...(outputsRes.data ?? [])].sort(byCycle).reverse(),
    deltas: [...(deltasRes.data ?? [])].sort(byCycle).reverse(),
    actions: [...(actionsRes.data ?? [])].sort(byCycle).reverse(),
    scores: submissions.map((s) => ({
      cycle: s.cycle_id,
      performance: ragValue(s.performance_rag),
      paid: ragValue(s.paid_rag),
      relationship: ragValue(s.relationship_rag),
      growth: ragValue(s.growth_rag),
      overall: ragValue(s.overall_rag),
      confidence: s.confidence_score,
    })),
  };
}
