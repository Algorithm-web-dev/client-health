import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { R as RagPill, T as TrajectoryLabel } from "./RagPill-D0s37ObT.mjs";
import { E as EmptyState } from "./EmptyState-DkYfS83D.mjs";
import { S as Skeleton, O as OverrideAnnotation } from "./skeleton-D4TiB6tA.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.mjs";
import { a as asRag, f as fetchPortfolio } from "./db-CEBZ_C7z.mjs";
import { T as TriangleAlert, f as TrendingDown, R as Repeat, S as Strikethrough } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-slot.mjs";
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
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./client-by8QvJ8A.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
function AlertPanel({ rows }) {
  const groups = [
    {
      key: "hidden",
      label: "Hidden risks",
      icon: TriangleAlert,
      tone: "text-destructive",
      rows: rows.filter((r) => r.latestSubmission?.hidden_risk).map((r) => ({
        row: r,
        detail: r.latestSubmission?.hidden_risk_reason ?? "Green overall but low confidence."
      }))
    },
    {
      key: "deteriorating",
      label: "Deteriorating trajectories",
      icon: TrendingDown,
      tone: "text-destructive",
      rows: rows.filter((r) => r.trajectory === "deteriorating").map((r) => ({ row: r, detail: `Latest agent output for ${r.latestOutput?.cycle_id ?? "—"}` }))
    },
    {
      key: "stale",
      label: "Stale fast-path (3+ cycles)",
      icon: Repeat,
      tone: "text-warning",
      rows: rows.filter((r) => r.fastPathStreak >= 3).map((r) => ({
        row: r,
        detail: `No detailed review in ${r.fastPathStreak} cycles`
      }))
    },
    {
      key: "overrides",
      label: "Overridden-flag streaks",
      icon: Strikethrough,
      tone: "text-warning",
      rows: rows.filter((r) => r.overrideStreak >= 2).map((r) => ({
        row: r,
        detail: `${r.overrideStreak} consecutive agent outputs overridden`
      }))
    }
  ].filter((g) => g.rows.length > 0);
  if (groups.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card mb-6 p-5 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Nothing needs attention." }),
      " No hidden risks, deteriorating trajectories, stale fast-paths or override streaks in this portfolio."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card mb-6 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Needs attention" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-5 sm:grid-cols-2", children: groups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${group.tone}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(group.icon, { className: "size-3.5" }),
        group.label,
        " · ",
        group.rows.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1.5", children: group.rows.map(({ row, detail }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/clients/$id",
            params: { id: row.client.id },
            className: "font-medium hover:underline",
            children: row.client.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " — ",
          detail
        ] })
      ] }, row.client.id)) })
    ] }, group.key)) })
  ] });
}
const ALL = "all";
const UNASSIGNED = "Unassigned";
function leadsLabel(row) {
  return row.ciLeads.length > 0 ? row.ciLeads.join(", ") : UNASSIGNED;
}
function DashboardPage() {
  const [ci, setCi] = reactExports.useState(ALL);
  const [tier, setTier] = reactExports.useState(ALL);
  const [rag, setRag] = reactExports.useState(ALL);
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio
  });
  const rows = reactExports.useMemo(() => data ?? [], [data]);
  const ciOptions = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    for (const r of rows) {
      if (r.ciLeads.length === 0) set.add(UNASSIGNED);
      for (const lead of r.ciLeads) set.add(lead);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [rows]);
  const filtered = rows.filter((r) => {
    if (ci !== ALL) {
      const match = ci === UNASSIGNED ? r.ciLeads.length === 0 : r.ciLeads.includes(ci);
      if (!match) return false;
    }
    if (tier !== ALL && (r.client.tier ?? "none") !== tier) return false;
    if (rag !== ALL && (r.latestSubmission?.overall_rag ?? "none") !== rag) return false;
    return true;
  });
  const alerts = filtered.filter((r) => r.alert).length;
  const hasNoSubmissions = filtered.every((r) => !r.latestSubmission);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Portfolio", description: "Health status across all clients for the current bi-weekly cycle." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ci, onValueChange: setCi, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", "aria-label": "Filter by CI lead", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "CI lead" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ALL, children: "All CI leads" }),
          ciOptions.map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tier, onValueChange: setTier, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", "aria-label": "Filter by tier", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tier" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ALL, children: "All tiers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "A", children: "Tier A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "B", children: "Tier B" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "C", children: "Tier C" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "D", children: "Tier D" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No tier" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rag, onValueChange: setRag, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", "aria-label": "Filter by RAG status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ALL, children: "All statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Green", children: "Green" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Amber", children: "Amber" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Red", children: "Red" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No score" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-sm text-muted-foreground", children: [
        filtered.length,
        " client",
        filtered.length === 1 ? "" : "s",
        alerts > 0 ? ` · ${alerts} needing attention` : ""
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-6 text-sm text-destructive", role: "alert", children: [
      "Could not load the portfolio: ",
      error.message
    ] }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full rounded-xl" }, i)) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No clients yet", hint: "Once clients are imported or created, their bi-weekly health lands here." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No clients match these filters", hint: "Clear a filter to see the rest of the portfolio." }) : hasNoSubmissions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertPanel, { rows: filtered }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No submissions yet this cycle", hint: "Start with your highest-risk client — the wizard pre-fills from their last cycle." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertPanel, { rows: filtered }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: filtered.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/clients/$id", params: {
        id: row.client.id
      }, className: "surface-card block p-5 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold tracking-tight", children: row.client.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-muted-foreground", children: leadsLabel(row) })
          ] }),
          row.alert ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-5 shrink-0 text-destructive", "aria-label": row.latestSubmission?.hidden_risk ? "Hidden risk flagged" : "Trajectory deteriorating" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RagPill, { status: asRag(row.latestSubmission?.overall_rag) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border", children: row.client.tier ? `Tier ${row.client.tier}` : "No tier" }),
          row.overridden && row.trajectory ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverrideAnnotation, { flag: row.trajectory, reason: row.overrideReason }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrajectoryLabel, { direction: row.trajectory })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-4 flex items-end justify-between border-t border-border pt-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Confidence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-semibold tabular-nums", children: [
              row.latestSubmission?.confidence_score ?? "—",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "/10" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Latest cycle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: row.latestSubmission?.cycle_id ?? "None" })
          ] })
        ] })
      ] }, row.client.id)) })
    ] })
  ] });
}
export {
  DashboardPage as component
};
