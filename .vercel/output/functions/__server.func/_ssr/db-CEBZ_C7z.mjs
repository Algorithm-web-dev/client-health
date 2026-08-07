import { s as supabase } from "./client-by8QvJ8A.mjs";
const db = {
  profiles: () => supabase.from("profiles"),
  clients: () => supabase.from("clients"),
  cycles: () => supabase.from("cycles"),
  questions: () => supabase.from("questions"),
  submissions: () => supabase.from("submissions"),
  agentOutputs: () => supabase.from("agent_outputs"),
  agentDeltas: () => supabase.from("agent_deltas"),
  reviews: () => supabase.from("reviews"),
  actionLog: () => supabase.from("action_log")
};
function trajectoryDirection(flag) {
  if (!flag || typeof flag !== "object") return null;
  const value = flag["direction"];
  return value === "improving" || value === "stable" || value === "deteriorating" ? value : null;
}
function asRag(value) {
  return value === "Green" || value === "Amber" || value === "Red" ? value : null;
}
async function fetchPortfolio() {
  const [clientsRes, submissionsRes, outputsRes, reviewsRes] = await Promise.all([
    db.clients().select("id, name, tier, ci_leads, director_support, status").neq("status", "archived").order("name", { ascending: true }),
    db.submissions().select(
      "id, client_id, cycle_id, status, submitted_at, overall_rag, confidence_score, hidden_risk, hidden_risk_reason, fast_path"
    ).order("submitted_at", { ascending: false, nullsFirst: false }),
    db.agentOutputs().select("id, client_id, cycle_id, status, insight_narrative, trajectory_flag, created_at").order("created_at", { ascending: false, nullsFirst: false }),
    db.reviews().select("agent_output_id, decision, override_reason, reviewed_at").order("reviewed_at", { ascending: false, nullsFirst: false })
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (submissionsRes.error) throw submissionsRes.error;
  if (outputsRes.error) throw outputsRes.error;
  if (reviewsRes.error) throw reviewsRes.error;
  const submissionsByClient = /* @__PURE__ */ new Map();
  for (const s of submissionsRes.data ?? []) {
    const list = submissionsByClient.get(s.client_id) ?? [];
    list.push(s);
    submissionsByClient.set(s.client_id, list);
  }
  const outputsByClient = /* @__PURE__ */ new Map();
  for (const o of outputsRes.data ?? []) {
    const list = outputsByClient.get(o.client_id) ?? [];
    list.push(o);
    outputsByClient.set(o.client_id, list);
  }
  const overrides = /* @__PURE__ */ new Map();
  const reviewed = /* @__PURE__ */ new Set();
  for (const r of reviewsRes.data ?? []) {
    reviewed.add(r.agent_output_id);
    if (r.decision === "override" && !overrides.has(r.agent_output_id)) {
      overrides.set(r.agent_output_id, r.override_reason);
    }
  }
  return (clientsRes.data ?? []).map((c) => {
    const submissions = submissionsByClient.get(c.id) ?? [];
    const outputs = outputsByClient.get(c.id) ?? [];
    const submission = submissions[0] ?? null;
    const output = outputs[0] ?? null;
    const trajectory = trajectoryDirection(output?.trajectory_flag);
    const overridden = output ? overrides.has(output.id) : false;
    let fastPathStreak = 0;
    for (const s of submissions) {
      if (s.fast_path) fastPathStreak += 1;
      else break;
    }
    let overrideStreak = 0;
    for (const o of outputs) {
      if (!reviewed.has(o.id)) break;
      if (overrides.has(o.id)) overrideStreak += 1;
      else break;
    }
    return {
      client: c,
      ciLeads: c.ci_leads ?? [],
      latestSubmission: submission,
      latestOutput: output,
      trajectory,
      alert: Boolean(submission?.hidden_risk) || trajectory === "deteriorating" || fastPathStreak >= 3 || overrideStreak >= 2,
      fastPathStreak,
      overrideStreak,
      overridden,
      overrideReason: output ? overrides.get(output.id) ?? null : null
    };
  });
}
export {
  asRag as a,
  db as d,
  fetchPortfolio as f
};
