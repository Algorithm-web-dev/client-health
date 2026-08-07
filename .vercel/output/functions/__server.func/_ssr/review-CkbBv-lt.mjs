import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { E as EmptyState } from "./EmptyState-DkYfS83D.mjs";
import { S as Skeleton, R as RiskArrow, F as FlagList, U as UrgencyBadge } from "./skeleton-D4TiB6tA.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { u as useProfile } from "./useProfile-CSLo6pXR.mjs";
import { p as parseTrajectory, a as parseUpsell, b as parseFlags, c as acceptAction, d as dismissAction, s as saveDecision, f as fetchReviewQueue } from "./review-vmuShfzf.mjs";
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
import "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
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
import "./router-B82dyFaT.mjs";
import "./db-CEBZ_C7z.mjs";
function ReviewPage() {
  const {
    profile,
    role,
    isLoading: profileLoading
  } = useProfile();
  const identifiers = reactExports.useMemo(() => [profile?.full_name ?? "", profile?.email ?? ""].filter(Boolean), [profile]);
  const seeAll = role === "admin" || role === "director";
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["review-queue", identifiers.join("|"), seeAll],
    enabled: !profileLoading && Boolean(profile),
    queryFn: () => fetchReviewQueue(identifiers, seeAll)
  });
  const items = data ?? [];
  const pending = items.filter((i) => !i.review).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Review", description: "Agent output per client, with your confirmation or override.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
      pending,
      " awaiting decision · ",
      items.length,
      " total"
    ] }) }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-6 text-sm text-destructive", role: "alert", children: [
      "Could not load the review queue: ",
      error.message
    ] }) : isLoading || profileLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [0, 1].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full rounded-xl" }, i)) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No agent output to review yet", hint: "Items appear here once a cycle closes and the batch analysis has run." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewCard, { item }, item.output.id)) })
  ] });
}
function ReviewCard({
  item
}) {
  const queryClient = useQueryClient();
  const {
    profile,
    role
  } = useProfile();
  const readOnly = role === "director";
  const [mode, setMode] = reactExports.useState("none");
  const [reason, setReason] = reactExports.useState("");
  const trajectory = parseTrajectory(item.output.trajectory_flag);
  const upsell = parseUpsell(item.output.upsell_window);
  const newFlags = parseFlags(item.delta?.new_flags);
  const resolvedFlags = parseFlags(item.delta?.resolved_flags);
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["review-queue"]
    });
    void queryClient.invalidateQueries({
      queryKey: ["portfolio"]
    });
  };
  const decide = useMutation({
    mutationFn: (decision) => saveDecision({
      agentOutputId: item.output.id,
      decision,
      overrideReason: reason,
      reviewedBy: profile.id
    }),
    onSuccess: (_d, decision) => {
      toast.success(decision === "confirm" ? "Analysis confirmed" : "Override recorded");
      setMode("none");
      setReason("");
      invalidate();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients/$id", params: {
          id: item.client.id
        }, className: "hover:underline", children: item.client.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          item.output.cycle_id,
          " · ",
          item.client.tier ? `Tier ${item.client.tier}` : "No tier"
        ] })
      ] }),
      item.review ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border", children: item.review.decision === "override" ? "Overridden" : "Confirmed" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card border-l-4 border-l-primary p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "What your answers changed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskArrow, { before: item.delta?.risk_before ?? null, after: item.delta?.risk_after ?? null }) }),
      item.delta?.summary ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground", children: item.delta.summary }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "No delta recorded for this cycle." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlagList, { flags: newFlags, tone: "new" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlagList, { flags: resolvedFlags, tone: "resolved" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Insight" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 whitespace-pre-line text-sm leading-relaxed", children: item.output.insight_narrative ?? "No narrative returned." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Trajectory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium capitalize", children: trajectory?.direction ?? "Unknown" }),
        trajectory?.categories.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: trajectory.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border", children: c }, c)) }) : null,
        trajectory?.note ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: trajectory.note }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Upsell window" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: upsell?.open ? "Open" : "Closed" }),
        upsell?.suggested_service ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm", children: [
          "Suggested: ",
          upsell.suggested_service
        ] }) : null,
        upsell?.rationale ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: upsell.rationale }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Recommended actions" }),
      item.recommended.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No actions recommended." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-3", children: item.recommended.map((rec) => /* @__PURE__ */ jsxRuntimeExports.jsx(ActionRow, { item, rec, onDone: invalidate, readOnly }, rec.action)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Your decision" }),
      item.review ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: item.review.decision }),
        item.review.override_reason ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: item.review.override_reason }) : null
      ] }) : readOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Awaiting the CI lead's decision. Directors have read-only access." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => decide.mutate("confirm"), disabled: decide.isPending, children: "Confirm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMode(mode === "override" ? "none" : "override"), disabled: decide.isPending, children: "Override" })
        ] }),
        mode === "override" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `reason-${item.output.id}`, className: "text-sm font-medium", children: "Why are you overriding the agent? (min 20 characters)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: `reason-${item.output.id}`, value: reason, onChange: (e) => setReason(e.target.value), rows: 3, placeholder: "Explain what the agent got wrong and what you know that it doesn't." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: reason.trim().length < 20 || decide.isPending, onClick: () => decide.mutate("override"), children: "Save override" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              reason.trim().length,
              "/20 characters"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The agent's flag is never deleted — it stays visible with strikethrough alongside your reason." })
        ] }) : null
      ] })
    ] })
  ] });
}
function ActionRow({
  item,
  rec,
  onDone,
  readOnly
}) {
  const existing = item.actions.find((a) => a.description === rec.action);
  const [owner, setOwner] = reactExports.useState(rec.owner ?? item.client.ci_leads?.[0] ?? "");
  const [deadline, setDeadline] = reactExports.useState("");
  const accept = useMutation({
    mutationFn: () => acceptAction({
      clientId: item.client.id,
      cycleId: item.output.cycle_id,
      description: rec.action,
      owner: owner.trim() || null,
      deadline: deadline || null
    }),
    onSuccess: () => {
      toast.success("Added to the action log");
      onDone();
    },
    onError: (e) => toast.error(e.message)
  });
  const dismiss = useMutation({
    mutationFn: () => dismissAction({
      clientId: item.client.id,
      cycleId: item.output.cycle_id,
      description: rec.action
    }),
    onSuccess: () => {
      toast.success("Action dismissed");
      onDone();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-lg border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: rec.action }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UrgencyBadge, { urgency: rec.urgency })
    ] }),
    existing ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: existing.status === "dismissed" ? "Dismissed" : `Accepted — owner ${existing.owner ?? "unassigned"}${existing.deadline ? `, due ${existing.deadline}` : ""}` }) : readOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Not yet actioned" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: owner, onChange: (e) => setOwner(e.target.value), placeholder: "Owner", "aria-label": "Action owner", className: "h-9 w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value), "aria-label": "Action deadline", className: "h-9 w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => accept.mutate(), disabled: accept.isPending, children: "Accept" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => dismiss.mutate(), disabled: dismiss.isPending, children: "Dismiss" })
    ] })
  ] });
}
export {
  ReviewPage as component
};
