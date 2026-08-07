import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { B as Button, b as buttonVariants } from "./button-DA2gxxPy.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, P as Progress } from "./progress-CIhT2qvU.mjs";
import { R as Root2, T as Trigger2, P as Portal2, C as Content2, a as Title2, D as Description2, b as Cancel, A as Action, O as Overlay2 } from "../_libs/radix-ui__react-alert-dialog.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { d as db } from "./db-CEBZ_C7z.mjs";
import { d as LoaderCircle, e as Copy } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/tailwind-merge.mjs";
import "./client-by8QvJ8A.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
const AlertDialog = Root2;
const AlertDialogTrigger = Trigger2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
const analyzeSubmission = async (args) => {
  try {
    const res = await fetch(
      "https://vldvvfgzsseqswaligwf.supabase.co/functions/v1/batch-analysis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sb_publishable_ARkcAqFMYniaP1QgpGOj6w_3-Ek0O-D",
          "apikey": "sb_publishable_ARkcAqFMYniaP1QgpGOj6w_3-Ek0O-D"
        },
        body: JSON.stringify({ submission_id: args.data.submission_id })
      }
    );
    console.log("[batch-analysis] HTTP status:", res.status);
    const data = await res.json();
    console.log("[batch-analysis] response:", JSON.stringify(data));
    if (data.error || !data.ok) throw new Error(data.reason ?? "agent_failed");
    return data;
  } catch (err) {
    console.error("[batch-analysis] fetch error:", String(err));
    throw err;
  }
};
async function fetchCycles() {
  const { data, error } = await db.cycles().select("*").order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function fetchCycleProgress(cycle) {
  const [clientsRes, submissionsRes] = await Promise.all([
    db.clients().select("id, name, ci_leads, status").neq("status", "archived"),
    db.submissions().select("id, client_id, status, overall_rag, hidden_risk, fast_path").eq("cycle_id", cycle.id)
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (submissionsRes.error) throw submissionsRes.error;
  const clients = clientsRes.data ?? [];
  const byClient = new Map((submissionsRes.data ?? []).map((s) => [s.client_id, s]));
  const perCiMap = /* @__PURE__ */ new Map();
  for (const c of clients) {
    for (const ci of c.ci_leads ?? []) {
      const entry = perCiMap.get(ci) ?? { submitted: 0, total: 0 };
      entry.total += 1;
      if (byClient.get(c.id)?.status === "submitted") entry.submitted += 1;
      perCiMap.set(ci, entry);
    }
  }
  const submissions = clients.map((c) => {
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
      status: s.status
    };
  }).filter((s) => s !== null);
  return {
    cycle,
    totalClients: clients.length,
    submittedCount: submissions.length,
    perCi: [...perCiMap.entries()].map(([ci, v]) => ({ ci, ...v })).sort((a, b) => a.ci.localeCompare(b.ci)),
    submissions
  };
}
async function buildDigest(cycleId) {
  const [clientsRes, submissionsRes, outputsRes, deltasRes] = await Promise.all([
    db.clients().select("id, name, ci_leads"),
    db.submissions().select("id, client_id, overall_rag, hidden_risk").eq("cycle_id", cycleId),
    db.agentOutputs().select("id, client_id, status, insight_narrative, trajectory_flag").eq("cycle_id", cycleId),
    db.agentDeltas().select("client_id, new_flags, risk_before, risk_after").eq("cycle_id", cycleId)
  ]);
  if (clientsRes.error) throw clientsRes.error;
  const clients = new Map((clientsRes.data ?? []).map((c) => [c.id, c]));
  const outputs = new Map((outputsRes.data ?? []).map((o) => [o.client_id, o]));
  const deltas = new Map((deltasRes.data ?? []).map((d) => [d.client_id, d]));
  const rows = (submissionsRes.data ?? []).map((s) => {
    const client = clients.get(s.client_id);
    const output = outputs.get(s.client_id);
    const delta = deltas.get(s.client_id);
    const flag = output?.trajectory_flag ?? null;
    return {
      client_name: client?.name ?? "Unknown client",
      ci_leads: client?.ci_leads ?? [],
      overall_rag: s.overall_rag,
      hidden_risk: s.hidden_risk,
      narrative: output?.insight_narrative ?? null,
      direction: flag?.direction ?? null,
      newFlags: Array.isArray(delta?.new_flags) ? delta.new_flags.filter((f) => typeof f === "string") : [],
      riskBefore: delta?.risk_before ?? null,
      riskAfter: delta?.risk_after ?? null,
      failed: output?.status === "failed"
    };
  });
  const ciNames = [...new Set(rows.flatMap((r) => r.ci_leads))].sort();
  const perCi = ciNames.map((ci) => {
    const mine = rows.filter((r) => r.ci_leads.includes(ci));
    const lines = mine.filter((r) => r.hidden_risk || r.newFlags.length > 0 || r.direction === "deteriorating" || r.overall_rag === "Red").map((r) => {
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
    (r) => r.riskBefore && r.riskAfter && r.riskBefore !== r.riskAfter && (r.riskAfter === "High" || r.riskAfter === "Critical")
  );
  const failed = rows.filter((r) => r.failed);
  const director = [
    `${rows.length} clients analysed for cycle ${cycleId}.`,
    `Portfolio risk: ${reds.length} Red, ${rows.filter((r) => r.overall_rag === "Amber").length} Amber, ${rows.filter((r) => r.overall_rag === "Green").length} Green.`,
    deteriorating.length > 0 ? `Deteriorating: ${deteriorating.map((r) => r.client_name).join(", ")}.` : "No deteriorating trajectories.",
    escalations.length > 0 ? `Escalations to High/Critical risk this cycle: ${escalations.map((r) => r.client_name).join(", ")}.` : "No new risk escalations.",
    hidden.length > 0 ? `Hidden risks: ${hidden.map((r) => r.client_name).join(", ")}.` : "No hidden risks flagged."
  ];
  if (failed.length > 0) {
    director.push(`Agent failed for: ${failed.map((r) => r.client_name).join(", ")} — re-run needed.`);
  }
  return { perCi, director };
}
function digestToText(cycleId, digest) {
  const perCi = digest.perCi.map((c) => `${c.ci}
${c.lines.map((l) => `  - ${l}`).join("\n")}`).join("\n\n");
  return `CLIENT HEALTH DIGEST — ${cycleId}

DIRECTOR SUMMARY
${digest.director.map((l) => `  - ${l}`).join("\n")}

PER CI

${perCi}
`;
}
function addDays(date, days) {
  const d = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function isoWeekLabel(date) {
  const d = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((d.getTime() - firstThursday.getTime()) / 864e5 - 3 + (firstThursday.getUTCDay() + 6) % 7) / 7
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
async function closeCycle(cycleId) {
  const { error } = await db.cycles().update({ status: "closed" }).eq("id", cycleId);
  if (error) throw error;
}
async function markBatchComplete(cycleId) {
  const { error } = await db.cycles().update({ batch_run_completed: true }).eq("id", cycleId);
  if (error) throw error;
}
async function openNextCycle(previous) {
  const start = addDays(previous.end_date, 1);
  const end = addDays(start, 13);
  const id = isoWeekLabel(start);
  const { data, error } = await db.cycles().insert({ id, label: `Cycle ${id}`, start_date: start, end_date: end, status: "open" }).select("*").single();
  if (error) throw error;
  return data;
}
function CyclesPage() {
  const queryClient = useQueryClient();
  const runAnalysis = analyzeSubmission;
  const cyclesQuery = useQuery({
    queryKey: ["cycles"],
    queryFn: fetchCycles
  });
  const cycles = cyclesQuery.data ?? [];
  const openCycleRow = cycles.find((c) => c.status === "open") ?? null;
  const latestCycle = cycles[0] ?? null;
  const progressQuery = useQuery({
    queryKey: ["cycle-progress", openCycleRow?.id ?? latestCycle?.id],
    enabled: Boolean(openCycleRow ?? latestCycle),
    queryFn: () => fetchCycleProgress(openCycleRow ?? latestCycle)
  });
  const progress = progressQuery.data ?? null;
  const [running, setRunning] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(0);
  const [total, setTotal] = reactExports.useState(0);
  const [currentName, setCurrentName] = reactExports.useState(null);
  const [failures, setFailures] = reactExports.useState([]);
  const [digest, setDigest] = reactExports.useState(null);
  async function handleCloseCycle() {
    if (!progress) return;
    const cycleId = progress.cycle.id;
    setRunning(true);
    setDigest(null);
    setFailures([]);
    setDone(0);
    setTotal(progress.submissions.length);
    try {
      await closeCycle(cycleId);
    } catch (error) {
      setRunning(false);
      toast.error(`Could not close the cycle: ${error.message}`);
      return;
    }
    const failed = [];
    for (const [index, submission] of progress.submissions.entries()) {
      setCurrentName(submission.client_name);
      try {
        const result = await runAnalysis({
          data: {
            submission_id: submission.id
          }
        });
        if (!result.ok) failed.push(submission.client_name);
      } catch (error) {
        console.error("batch analysis failed", submission.client_name, error);
        failed.push(submission.client_name);
      }
      setDone(index + 1);
    }
    setCurrentName(null);
    setFailures(failed);
    try {
      await markBatchComplete(cycleId);
      setDigest({
        cycleId,
        digest: await buildDigest(cycleId)
      });
    } catch (error) {
      toast.error(`Digest could not be built: ${error.message}`);
    }
    setRunning(false);
    void queryClient.invalidateQueries({
      queryKey: ["cycles"]
    });
    void queryClient.invalidateQueries({
      queryKey: ["cycle-progress"]
    });
  }
  async function handleOpenNext() {
    if (!latestCycle) return;
    try {
      const next = await openNextCycle(latestCycle);
      toast.success(`Cycle ${next.id} is open.`);
      void queryClient.invalidateQueries({
        queryKey: ["cycles"]
      });
    } catch (error) {
      toast.error(`Could not open the next cycle: ${error.message}`);
    }
  }
  const current = progress?.cycle ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cycles", description: "Open, monitor and close bi-weekly scoring cycles." }),
    cyclesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading cycles…" }) : !current ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No cycles yet — open the first bi-weekly cycle to start collecting scores." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
            current.label,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground", children: current.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            current.start_date,
            " → ",
            current.end_date,
            " ·",
            " ",
            progress ? `${progress.submittedCount} of ${progress.totalClients} clients submitted` : "…"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: current.status === "open" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: running || !progress || progress.submissions.length === 0, children: "Close cycle" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                "Close ",
                current.label,
                "?"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                "This locks the cycle and runs the batch agent across",
                " ",
                progress?.submissions.length ?? 0,
                " submitted clients. It cannot be reopened."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleCloseCycle, children: "Close and analyse" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleOpenNext, disabled: running, children: "Open next cycle" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: progress && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.totalClients > 0 ? progress.submittedCount / progress.totalClients * 100 : 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3", children: progress.perCi.map((ci) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ci.ci }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            ci.submitted,
            " / ",
            ci.total
          ] })
        ] }, ci.ci)) })
      ] }) })
    ] }),
    running && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: currentName ? `Analysing client ${Math.min(done + 1, total)} of ${total}… ${currentName}` : "Building the digest…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { className: "mt-2", value: total > 0 ? done / total * 100 : 0 })
      ] })
    ] }) }),
    digest && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          "Digest — ",
          digest.cycleId
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          void navigator.clipboard.writeText(digestToText(digest.cycleId, digest.digest));
          toast.success("Digest copied.");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-4" }),
          " Copy"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6 text-sm", children: [
        failures.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md bg-warning/10 px-3 py-2 text-warning", children: [
          "The agent failed for ",
          failures.length,
          " client(s): ",
          failures.join(", "),
          ". Re-run when ready."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold", children: "Director summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc space-y-1 pl-5 text-muted-foreground", children: digest.digest.director.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: line }, line)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Per CI" }),
          digest.digest.perCi.map((ci) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: ci.ci }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc space-y-1 pl-5 text-muted-foreground", children: ci.lines.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: line }, line)) })
          ] }, ci.ci))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "All cycles" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2 text-sm", children: cycles.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          c.start_date,
          " → ",
          c.end_date,
          " · ",
          c.status,
          c.batch_run_completed ? " · analysed" : ""
        ] })
      ] }, c.id)) })
    ] })
  ] });
}
export {
  CyclesPage as component
};
