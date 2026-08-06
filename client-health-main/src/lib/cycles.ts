import { db, type Cycle } from "@/lib/db";

export type CycleProgress = {
  cycle: Cycle;
  totalClients: number;
  submittedCount: number;
  perCi: { ci: string; submitted: number; total: number }[];
  submissions: {
    id: string;
    client_id: string;
    client_name: string;
    ci_leads: string[];
    overall_rag: string | null;
    hidden_risk: boolean | null;
    fast_path: boolean;
    status: string;
  }[];
};

export async function fetchCycles(): Promise<Cycle[]> {
  const { data, error } = await db.cycles().select("*").order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCycleProgress(cycle: Cycle): Promise<CycleProgress> {
  const [clientsRes, submissionsRes] = await Promise.all([
    db.clients().select("id, name, ci_leads, status").neq("status", "archived"),
    db
      .submissions()
      .select("id, client_id, status, overall_rag, hidden_risk, fast_path")
      .eq("cycle_id", cycle.id),
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (submissionsRes.error) throw submissionsRes.error;

  const clients = clientsRes.data ?? [];
  const byClient = new Map((submissionsRes.data ?? []).map((s) => [s.client_id, s]));

  const perCiMap = new Map<string, { submitted: number; total: number }>();
  for (const c of clients) {
    for (const ci of c.ci_leads ?? []) {
      const entry = perCiMap.get(ci) ?? { submitted: 0, total: 0 };
      entry.total += 1;
      if (byClient.get(c.id)?.status === "submitted") entry.submitted += 1;
      perCiMap.set(ci, entry);
    }
  }

  const submissions = clients
    .map((c) => {
      const s = byClient.get(c.id);
      if (!s || s.status !== "submitted") return null;
      return {
        id: s.id,
        client_id: c.id,
        client_name: c.name,
        ci_leads: c.ci_leads ?? [],
        overall_rag: s.overall_rag,
        hidden_risk: s.hidden_risk,
        fast_path: s.fast_path,
        status: s.status,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return {
    cycle,
    totalClients: clients.length,
    submittedCount: submissions.length,
    perCi: [...perCiMap.entries()]
      .map(([ci, v]) => ({ ci, ...v }))
      .sort((a, b) => a.ci.localeCompare(b.ci)),
    submissions,
  };
}

export type Digest = { perCi: { ci: string; lines: string[] }[]; director: string[] };

type DigestInput = {
  client_name: string;
  ci_leads: string[];
  overall_rag: string | null;
  hidden_risk: boolean | null;
  narrative: string | null;
  direction: string | null;
  newFlags: string[];
  riskBefore: string | null;
  riskAfter: string | null;
  failed: boolean;
};

/** Builds the post-batch digest for a closed cycle from stored agent output. */
export async function buildDigest(cycleId: string): Promise<Digest> {
  const [clientsRes, submissionsRes, outputsRes, deltasRes] = await Promise.all([
    db.clients().select("id, name, ci_leads"),
    db.submissions().select("id, client_id, overall_rag, hidden_risk").eq("cycle_id", cycleId),
    db
      .agentOutputs()
      .select("id, client_id, status, insight_narrative, trajectory_flag")
      .eq("cycle_id", cycleId),
    db.agentDeltas().select("client_id, new_flags, risk_before, risk_after").eq("cycle_id", cycleId),
  ]);
  if (clientsRes.error) throw clientsRes.error;

  const clients = new Map((clientsRes.data ?? []).map((c) => [c.id, c]));
  const outputs = new Map((outputsRes.data ?? []).map((o) => [o.client_id, o]));
  const deltas = new Map((deltasRes.data ?? []).map((d) => [d.client_id, d]));

  const rows: DigestInput[] = (submissionsRes.data ?? []).map((s) => {
    const client = clients.get(s.client_id);
    const output = outputs.get(s.client_id);
    const delta = deltas.get(s.client_id);
    const flag = (output?.trajectory_flag ?? null) as { direction?: string } | null;
    return {
      client_name: client?.name ?? "Unknown client",
      ci_leads: client?.ci_leads ?? [],
      overall_rag: s.overall_rag,
      hidden_risk: s.hidden_risk,
      narrative: output?.insight_narrative ?? null,
      direction: flag?.direction ?? null,
      newFlags: Array.isArray(delta?.new_flags)
        ? (delta.new_flags as unknown[]).filter((f): f is string => typeof f === "string")
        : [],
      riskBefore: delta?.risk_before ?? null,
      riskAfter: delta?.risk_after ?? null,
      failed: output?.status === "failed",
    };
  });

  const ciNames = [...new Set(rows.flatMap((r) => r.ci_leads))].sort();
  const perCi = ciNames.map((ci) => {
    const mine = rows.filter((r) => r.ci_leads.includes(ci));
    const lines = mine
      .filter((r) => r.hidden_risk || r.newFlags.length > 0 || r.direction === "deteriorating" || r.overall_rag === "Red")
      .map((r) => {
        const bits = [`${r.client_name} — ${r.overall_rag ?? "no score"}`];
        if (r.direction) bits.push(`trajectory ${r.direction}`);
        if (r.hidden_risk) bits.push("hidden risk");
        if (r.newFlags.length > 0) bits.push(`new flags: ${r.newFlags.join("; ")}`);
        return bits.join(" · ");
      });
    return { ci, lines: lines.length > 0 ? lines : ["No flags this cycle."] };
  });

  const reds = rows.filter((r) => r.overall_rag === "Red");
  const deteriorating = rows.filter((r) => r.direction === "deteriorating");
  const hidden = rows.filter((r) => r.hidden_risk);
  const escalations = rows.filter(
    (r) =>
      r.riskBefore &&
      r.riskAfter &&
      r.riskBefore !== r.riskAfter &&
      (r.riskAfter === "High" || r.riskAfter === "Critical"),
  );
  const failed = rows.filter((r) => r.failed);

  const director = [
    `${rows.length} clients analysed for cycle ${cycleId}.`,
    `Portfolio risk: ${reds.length} Red, ${rows.filter((r) => r.overall_rag === "Amber").length} Amber, ${rows.filter((r) => r.overall_rag === "Green").length} Green.`,
    deteriorating.length > 0
      ? `Deteriorating: ${deteriorating.map((r) => r.client_name).join(", ")}.`
      : "No deteriorating trajectories.",
    escalations.length > 0
      ? `Escalations to High/Critical risk this cycle: ${escalations.map((r) => r.client_name).join(", ")}.`
      : "No new risk escalations.",
    hidden.length > 0
      ? `Hidden risks: ${hidden.map((r) => r.client_name).join(", ")}.`
      : "No hidden risks flagged.",
  ];
  if (failed.length > 0) {
    director.push(`Agent failed for: ${failed.map((r) => r.client_name).join(", ")} — re-run needed.`);
  }

  return { perCi, director };
}

export function digestToText(cycleId: string, digest: Digest): string {
  const perCi = digest.perCi
    .map((c) => `${c.ci}\n${c.lines.map((l) => `  - ${l}`).join("\n")}`)
    .join("\n\n");
  return `CLIENT HEALTH DIGEST — ${cycleId}\n\nDIRECTOR SUMMARY\n${digest.director
    .map((l) => `  - ${l}`)
    .join("\n")}\n\nPER CI\n\n${perCi}\n`;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO-week label used for cycle ids, e.g. 2026-W31. */
function isoWeekLabel(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function closeCycle(cycleId: string): Promise<void> {
  const { error } = await db.cycles().update({ status: "closed" }).eq("id", cycleId);
  if (error) throw error;
}

export async function markBatchComplete(cycleId: string): Promise<void> {
  const { error } = await db.cycles().update({ batch_run_completed: true }).eq("id", cycleId);
  if (error) throw error;
}

/** Creates the next bi-weekly cycle starting the day after the given one ends. */
export async function openNextCycle(previous: Cycle): Promise<Cycle> {
  const start = addDays(previous.end_date, 1);
  const end = addDays(start, 13);
  const id = isoWeekLabel(start);
  const { data, error } = await db
    .cycles()
    .insert({ id, label: `Cycle ${id}`, start_date: start, end_date: end, status: "open" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
