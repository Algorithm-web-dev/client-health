import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { s as supabase } from "./client-by8QvJ8A.mjs";
import { d as db } from "./db-CEBZ_C7z.mjs";
import { d as LoaderCircle, U as Upload } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const SEED_CYCLE_ID = "2026-W00-SEED";
function parseSeedFile(raw) {
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!json || typeof json !== "object") throw new Error("Expected a JSON object at the top level.");
  const obj = json;
  if (!Array.isArray(obj["clients"])) {
    throw new Error('Missing a "clients" array.');
  }
  const clients = obj["clients"].filter((c) => c && typeof c.name === "string");
  if (clients.length === 0) throw new Error("No clients with a name were found in the file.");
  const submissions = Array.isArray(obj["seed_submissions"]) ? obj["seed_submissions"] : [];
  return { clients, seed_submissions: submissions };
}
function normaliseLeads(client) {
  const raw = client.ci_leads ?? client.ci_lead ?? [];
  if (Array.isArray(raw)) return raw.filter((l) => typeof l === "string" && l.length > 0);
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
      batch_run_completed: false
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}
async function importSeed(file) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;
  await ensureSeedCycle();
  const existingRes = await db.clients().select("id, name");
  if (existingRes.error) throw existingRes.error;
  const byName = /* @__PURE__ */ new Map();
  for (const c of existingRes.data ?? []) byName.set(c.name.trim().toLowerCase(), c.id);
  const summary = {
    clientsCreated: 0,
    clientsUpdated: 0,
    submissionsCreated: 0,
    submissionsUpdated: 0,
    skipped: []
  };
  const idsByName = /* @__PURE__ */ new Map();
  for (const client of file.clients) {
    const key = client.name.trim().toLowerCase();
    const payload = {
      name: client.name.trim(),
      ci_leads: normaliseLeads(client),
      director_support: client.director_support ?? null,
      tier: client.tier ?? null,
      scope: client.scope ?? {},
      memory_summary: client.memory_summary ?? null,
      status: client.status ?? "active"
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
    const existingSubs = await db.submissions().select("id, client_id").eq("cycle_id", SEED_CYCLE_ID);
    if (existingSubs.error) throw existingSubs.error;
    const subByClient = /* @__PURE__ */ new Map();
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
        status: "submitted"
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
function AdminImportPage() {
  const queryClient = useQueryClient();
  const [raw, setRaw] = reactExports.useState("");
  const [fileName, setFileName] = reactExports.useState(null);
  const [summary, setSummary] = reactExports.useState(null);
  const run = useMutation({
    mutationFn: async () => importSeed(parseSeedFile(raw)),
    onSuccess: (result) => {
      setSummary(result);
      toast.success("Seed import complete");
      void queryClient.invalidateQueries({
        queryKey: ["portfolio"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setSummary(null);
    setRaw(await file.text());
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Seed import", description: `Loads baseline clients and submissions into cycle ${SEED_CYCLE_ID}. Safe to re-run — clients are matched on name and updated in place.` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card space-y-5 p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "seed-file", children: "Seed JSON file" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "seed-file", type: "file", accept: "application/json,.json", onChange: (e) => void handleFile(e.target.files?.[0]), className: "block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Expected shape: ",
          "{",
          ' "clients": [...], "seed_submissions": [...] ',
          "}"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "seed-json", children: "Or paste the JSON" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "seed-json", value: raw, onChange: (e) => {
          setRaw(e.target.value);
          setSummary(null);
        }, rows: 10, className: "font-mono text-xs", placeholder: '{ "clients": [], "seed_submissions": [] }' }),
        fileName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Loaded from ",
          fileName
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => run.mutate(), disabled: !raw.trim() || run.isPending, children: [
        run.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
        "Run import"
      ] })
    ] }),
    summary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card mt-5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Import result" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-3 grid gap-3 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Clients created", value: summary.clientsCreated }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Clients updated", value: summary.clientsUpdated }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Submissions created", value: summary.submissionsCreated }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Submissions updated", value: summary.submissionsUpdated })
      ] }),
      summary.skipped.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-sm text-warning", children: [
        "Skipped ",
        summary.skipped.length,
        " submission(s) with no matching client:",
        " ",
        summary.skipped.join(", ")
      ] }) : null
    ] }) : null
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-lg font-semibold tabular-nums", children: value })
  ] });
}
export {
  AdminImportPage as component
};
