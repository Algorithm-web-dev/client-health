import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { I as Inbox } from "../_libs/lucide-react.mjs";
function EmptyState({
  title,
  hint,
  icon,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card flex flex-col items-center gap-3 p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground", children: icon ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "size-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: title }),
      hint ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: hint }) : null
    ] }),
    action
  ] });
}
export {
  EmptyState as E
};
