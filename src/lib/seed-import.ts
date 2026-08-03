import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

export const SEED_CYCLE_ID = "2026-W00-SEED";

export type SeedClient = {
  name: string;
  ci_leads?: string[] | string | null;
  ci_lead?: string | null;
  director_support?: string | null;
  tier?: string | null;
  scope?: Record<string, boolean> | null;
  memory_summary?: string | null;
  status?: string | null;
};

export type SeedSubmission = {
  client_name?: string | null;
  client?: string | null;
  performance_rag?: string | null;
  performance_reason?: string | null;
  paid_rag?: string | null;
  paid_reason?: string | null;
  relationship_rag?: string | null;
  relationship_reason?: string | null;
  confidence_score?: number | null;
  growth_rag?: string | null;
  growth_reason?: string | null;
  overall_rag?: string | null;
  upsell_opportunity?: string | null;
  upsell_value?: string | null;
  upsell_probability?: number | null;
  next_action?: string | null;
  action_owner?: string | null;
  action_deadline?: string | null;
  hidden_risk?: boolean | null;
  hidden_risk_reason?: string | null;
};

export type SeedFile = {
  clients: SeedClient[];
  seed_submissions?: SeedSubmission[];
};

export type ImportSummary = {
  clientsCreated: number;
  clientsUpdated: number;
  submissionsCreated: number;
  submissionsUpdated: number;
  skipped: string[];
};

/** Validates the uploaded JSON shape and throws a readable message when it's wrong. */
export function parseSeedFile(raw: string): SeedFile {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!json || typeof json !== "object") throw new Error("Expected a JSON object at the top level.");
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj["clients"])) {
    throw new Error('Missing a "clients" array.');
  }
  const clients = (obj["clients"] as SeedClient[]).filter((c) => c && typeof c.name === "string");
  if (clients.length === 0) throw new Error("No clients with a name were found in the file.");
  const submissions = Array.isArray(obj["seed_submissions"])
    ? (obj["seed_submissions"] as SeedSubmission[])
    : [];
  return { clients, seed_submissions: submissions };
}

function normaliseLeads(client: SeedClient): string[] {
  const raw = client.ci_leads ?? client.ci_lead ?? [];
  if (Array.isArray(raw)) return raw.filter((l): l is string => typeof l === "string" && l.length > 0);
  if (typeof raw === "string" && raw.length > 0) return [raw];
  return [];
}

async function ensureSeedCycle() {
  const { error } = await db.cycles().upsert(
    {
      id: SEED_CYCLE_ID,
      label: "Seed baseline",
      start_date: "2026-01-01",
      end_date: "2026-01-01",
      status: "closed",
      is_seed: true,
      batch_run_completed: false,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

/**
 * Imports the seed file. Idempotent: clients are matched on name, submissions on
 * (client, seed cycle) — re-running updates the existing rows instead of duplicating.
 */
export async function importSeed(file: SeedFile): Promise<ImportSummary> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;

  await ensureSeedCycle();

  const existingRes = await db.clients().select("id, name");
  if (existingRes.error) throw existingRes.error;
  const byName = new Map<string, string>();
  for (const c of existingRes.data ?? []) byName.set(c.name.trim().toLowerCase(), c.id);

  const summary: ImportSummary = {
    clientsCreated: 0,
    clientsUpdated: 0,
    submissionsCreated: 0,
    submissionsUpdated: 0,
    skipped: [],
  };

  const idsByName = new Map<string, string>();

  for (const client of file.clients) {
    const key = client.name.trim().toLowerCase();
    const payload = {
      name: client.name.trim(),
      ci_leads: normaliseLeads(client),
      director_support: client.director_support ?? null,
      tier: client.tier ?? null,
      scope: client.scope ?? {},
      memory_summary: client.memory_summary ?? null,
      status: client.status ?? "active",
    };

    const existingId = byName.get(key);
    if (existingId) {
      const { error } = await db.clients().update(payload).eq("id", existingId);
      if (error) throw error;
      idsByName.set(key, existingId);
      summary.clientsUpdated += 1;
    } else {
      const { data, error } = await db.clients().insert(payload).select("id").single();
      if (error) throw error;
      idsByName.set(key, data.id);
      byName.set(key, data.id);
      summary.clientsCreated += 1;
    }
  }

  const submissions = file.seed_submissions ?? [];
  if (submissions.length > 0) {
    const existingSubs = await db
      .submissions()
      .select("id, client_id")
      .eq("cycle_id", SEED_CYCLE_ID);
    if (existingSubs.error) throw existingSubs.error;
    const subByClient = new Map<string, string>();
    for (const s of existingSubs.data ?? []) subByClient.set(s.client_id, s.id);

    for (const sub of submissions) {
      const name = (sub.client_name ?? sub.client ?? "").trim();
      const clientId = idsByName.get(name.toLowerCase()) ?? byName.get(name.toLowerCase());
      if (!clientId) {
        summary.skipped.push(name || "(submission with no client name)");
        continue;
      }

      const payload = {
        client_id: clientId,
        cycle_id: SEED_CYCLE_ID,
        submitted_by: userId,
        is_seed: true,
        fast_path: false,
        performance_rag: sub.performance_rag ?? null,
        performance_reason: sub.performance_reason ?? null,
        paid_rag: sub.paid_rag ?? null,
        paid_reason: sub.paid_reason ?? null,
        relationship_rag: sub.relationship_rag ?? null,
        relationship_reason: sub.relationship_reason ?? null,
        confidence_score: sub.confidence_score ?? null,
        growth_rag: sub.growth_rag ?? null,
        growth_reason: sub.growth_reason ?? null,
        overall_rag: sub.overall_rag ?? null,
        upsell_opportunity: sub.upsell_opportunity ?? null,
        upsell_value: sub.upsell_value ?? null,
        upsell_probability: sub.upsell_probability ?? null,
        next_action: sub.next_action ?? null,
        action_owner: sub.action_owner ?? null,
        action_deadline: sub.action_deadline ?? null,
        hidden_risk: sub.hidden_risk ?? false,
        hidden_risk_reason: sub.hidden_risk_reason ?? null,
        status: "submitted",
      };

      const existingId = subByClient.get(clientId);
      if (existingId) {
        const { error } = await db.submissions().update(payload).eq("id", existingId);
        if (error) throw error;
        summary.submissionsUpdated += 1;
      } else {
        const { data, error } = await db.submissions().insert(payload).select("id").single();
        if (error) throw error;
        subByClient.set(clientId, data.id);
        summary.submissionsCreated += 1;
      }
    }
  }

  return summary;
}
