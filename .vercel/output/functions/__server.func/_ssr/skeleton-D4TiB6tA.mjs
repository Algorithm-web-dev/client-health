import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
const URGENCY_CLASS = {
  this_week: "bg-destructive/10 text-destructive ring-destructive/20",
  this_cycle: "bg-warning/10 text-warning ring-warning/20",
  next_cycle: "bg-muted text-muted-foreground ring-border"
};
const URGENCY_LABEL = {
  this_week: "This week",
  this_cycle: "This cycle",
  next_cycle: "Next cycle"
};
function UrgencyBadge({ urgency }) {
  const key = urgency ?? "next_cycle";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        URGENCY_CLASS[key] ?? URGENCY_CLASS["next_cycle"]
      ),
      children: URGENCY_LABEL[key] ?? key
    }
  );
}
const RISK_CLASS = {
  Low: "text-success",
  Medium: "text-warning",
  High: "text-destructive",
  Critical: "text-destructive"
};
const RISK_ORDER = { Low: 0, Medium: 1, High: 2, Critical: 3 };
function RiskArrow({ before, after }) {
  const b = RISK_ORDER[before ?? ""] ?? null;
  const a = RISK_ORDER[after ?? ""] ?? null;
  const worse = b !== null && a !== null && a > b;
  const better = b !== null && a !== null && a < b;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-semibold", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(RISK_CLASS[before ?? ""] ?? "text-muted-foreground"), children: before ?? "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        "aria-hidden": true,
        className: cn(
          worse ? "text-destructive" : better ? "text-success" : "text-muted-foreground"
        ),
        children: worse ? "↑" : better ? "↓" : "→"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(RISK_CLASS[after ?? ""] ?? "text-muted-foreground"), children: after ?? "—" })
  ] });
}
function FlagList({ flags, tone }) {
  if (flags.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1", children: flags.map((flag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "li",
    {
      className: cn(
        "text-sm",
        tone === "new" ? "text-destructive" : "text-success"
      ),
      children: [
        tone === "new" ? "▲" : "✓",
        " ",
        flag
      ]
    },
    flag
  )) });
}
function OverrideAnnotation({
  flag,
  reason,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex flex-wrap items-baseline gap-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground line-through", children: flag }),
    reason ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary", children: [
      "CI override: ",
      reason
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary", children: "CI override" })
  ] });
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
export {
  FlagList as F,
  OverrideAnnotation as O,
  RiskArrow as R,
  Skeleton as S,
  UrgencyBadge as U
};
