import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useProfile } from "./useProfile-CSLo6pXR.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { S as Skeleton, R as RiskArrow, F as FlagList, O as OverrideAnnotation } from "./skeleton-D4TiB6tA.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.mjs";
import { d as db } from "./db-CEBZ_C7z.mjs";
import { b as parseFlags, p as parseTrajectory, A as ACTION_OUTCOMES, e as setActionOutcome } from "./review-vmuShfzf.mjs";
import { R as Route } from "./router-B82dyFaT.mjs";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Legend, b as Line } from "../_libs/recharts.mjs";
import "./client-by8QvJ8A.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const RAG_VALUE = { Red: 1, Amber: 2, Green: 3 };
function ragValue(value) {
  if (!value) return null;
  return RAG_VALUE[value] ?? null;
}
async function fetchClientDetail(clientId) {
  const [clientRes, subsRes, outputsRes, deltasRes, actionsRes] = await Promise.all([
    db.clients().select("*").eq("id", clientId).maybeSingle(),
    db.submissions().select("*").eq("client_id", clientId),
    db.agentOutputs().select("*").eq("client_id", clientId),
    db.agentDeltas().select("*").eq("client_id", clientId),
    db.actionLog().select("*").eq("client_id", clientId)
  ]);
  for (const res of [clientRes, subsRes, outputsRes, deltasRes, actionsRes]) {
    if (res.error) throw res.error;
  }
  if (!clientRes.data) throw new Error("Client not found");
  const byCycle = (a, b) => a.cycle_id.localeCompare(b.cycle_id);
  const submissions = [...subsRes.data ?? []].sort(byCycle);
  return {
    client: clientRes.data,
    submissions,
    outputs: [...outputsRes.data ?? []].sort(byCycle).reverse(),
    deltas: [...deltasRes.data ?? []].sort(byCycle).reverse(),
    actions: [...actionsRes.data ?? []].sort(byCycle).reverse(),
    scores: submissions.map((s) => ({
      cycle: s.cycle_id,
      performance: ragValue(s.performance_rag),
      paid: ragValue(s.paid_rag),
      relationship: ragValue(s.relationship_rag),
      growth: ragValue(s.growth_rag),
      overall: ragValue(s.overall_rag),
      confidence: s.confidence_score
    }))
  };
}
const RAG_TICKS = {
  1: "Red",
  2: "Amber",
  3: "Green"
};
function ClientDetailPage() {
  const {
    id
  } = Route.useParams();
  const queryClient = useQueryClient();
  const {
    role
  } = useProfile();
  const readOnly = role === "director";
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["client-detail", id],
    queryFn: () => fetchClientDetail(id)
  });
  const reviewsQuery = useQuery({
    queryKey: ["client-reviews", id],
    enabled: Boolean(data),
    queryFn: async () => {
      const ids = (data?.outputs ?? []).map((o) => o.id);
      if (ids.length === 0) return [];
      const {
        data: rows,
        error: err
      } = await db.reviews().select("*").in("agent_output_id", ids);
      if (err) throw err;
      return rows ?? [];
    }
  });
  const overrides = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of reviewsQuery.data ?? []) {
      if (r.decision === "override") map.set(r.agent_output_id, r.override_reason);
    }
    return map;
  }, [reviewsQuery.data]);
  const outcome = useMutation({
    mutationFn: (input) => setActionOutcome(input),
    onSuccess: () => {
      toast.success("Outcome saved");
      void queryClient.invalidateQueries({
        queryKey: ["client-detail", id]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-80 w-full rounded-xl" })
    ] });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-6 text-sm text-destructive", role: "alert", children: [
      "Could not load this client: ",
      error?.message ?? "Unknown error"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: data.client.name, description: `${data.client.ci_leads?.join(", ") || "Unassigned"} · ${data.client.tier ? `Tier ${data.client.tier}` : "No tier"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Score history" }),
      data.scores.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No submissions yet — score this client in the wizard to start the history." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-80 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: data.scores, margin: {
        top: 8,
        right: 16,
        bottom: 8,
        left: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "cycle", tick: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "rag", domain: [1, 3], ticks: [1, 2, 3], tickFormatter: (v) => RAG_TICKS[v] ?? "", tick: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "conf", orientation: "right", domain: [1, 10], tick: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "rag", type: "monotone", dataKey: "performance", name: "SEO/Perf", stroke: "var(--color-chart-1, #1a4fa0)", connectNulls: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "rag", type: "monotone", dataKey: "paid", name: "Paid", stroke: "var(--color-chart-2, #a05c00)", connectNulls: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "rag", type: "monotone", dataKey: "relationship", name: "Relationship", stroke: "var(--color-chart-3, #b52b2b)", connectNulls: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "rag", type: "monotone", dataKey: "growth", name: "Growth", stroke: "var(--color-chart-4, #1a7a4a)", connectNulls: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "conf", type: "monotone", dataKey: "confidence", name: "Confidence", stroke: "#6b7280", strokeDasharray: "4 3", connectNulls: true })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Delta history" }),
      data.deltas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No agent deltas yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-4", children: data.deltas.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-l-4 border-l-primary pl-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: d.cycle_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskArrow, { before: d.risk_before, after: d.risk_after })
        ] }),
        d.summary ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: d.summary }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlagList, { flags: parseFlags(d.new_flags), tone: "new" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlagList, { flags: parseFlags(d.resolved_flags), tone: "resolved" })
      ] }, d.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Past insights" }),
      data.outputs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No agent insights yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-5", children: data.outputs.map((o) => {
        const traj = parseTrajectory(o.trajectory_flag);
        const isOverridden = overrides.has(o.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-t border-border pt-4 first:border-t-0 first:pt-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: o.cycle_id }),
            traj?.direction ? isOverridden ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverrideAnnotation, { flag: `Trajectory: ${traj.direction}`, reason: overrides.get(o.id) ?? null }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium capitalize text-muted-foreground", children: [
              "Trajectory: ",
              traj.direction
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: isOverridden ? "mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground line-through" : "mt-2 whitespace-pre-line text-sm leading-relaxed", children: o.insight_narrative ?? "No narrative." }),
          isOverridden ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-primary", children: [
            "CI override: ",
            overrides.get(o.id) ?? "No reason given"
          ] }) : null
        ] }, o.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Action log" }),
      data.actions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No actions logged yet — accept a recommended action in Review to track it here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-3", children: data.actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(ActionLogRow, { action: a, readOnly, pending: outcome.isPending, onSet: (value) => outcome.mutate({
        id: a.id,
        outcome: value
      }) }, a.id)) })
    ] })
  ] });
}
function ActionLogRow({
  action,
  pending,
  onSet,
  readOnly
}) {
  const [value, setValue] = reactExports.useState(action.outcome ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "rounded-lg border border-border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: action.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        action.cycle_id,
        " · ",
        action.owner ?? "Unassigned",
        action.deadline ? ` · due ${action.deadline}` : "",
        " · ",
        action.status
      ] })
    ] }),
    action.outcome || readOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border", children: action.outcome ? ACTION_OUTCOMES.find((o) => o.value === action.outcome)?.label ?? action.outcome : "No outcome yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, onValueChange: setValue, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-44", "aria-label": "Set outcome", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Outcome" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ACTION_OUTCOMES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !value || pending, onClick: () => onSet(value), children: "Close action" })
    ] })
  ] }) });
}
export {
  ClientDetailPage as component
};
