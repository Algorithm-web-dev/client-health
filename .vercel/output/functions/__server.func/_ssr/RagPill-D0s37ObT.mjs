import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
const RAG_CLASS = {
  Green: "bg-success/10 text-success ring-success/20",
  Amber: "bg-warning/10 text-warning ring-warning/20",
  Red: "bg-destructive/10 text-destructive ring-destructive/20"
};
function RagPill({ status, className }) {
  if (!status) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn(
          "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border",
          className
        ),
        children: "No score"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        RAG_CLASS[status],
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-current", "aria-hidden": true }),
        status
      ]
    }
  );
}
function TrajectoryLabel({ direction }) {
  if (!direction) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "text-xs font-medium capitalize",
        direction === "deteriorating" ? "text-destructive" : direction === "improving" ? "text-success" : "text-muted-foreground"
      ),
      children: direction
    }
  );
}
export {
  RagPill as R,
  TrajectoryLabel as T
};
