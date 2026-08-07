import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { U as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-by8QvJ8A.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-C9VteUTG.css";
const AuthContext = reactExports.createContext(void 0);
async function fetchRole(userId) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!data || data.length === 0) return null;
  const roles = data.map((r) => r.role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("director")) return "director";
  if (roles.includes("ci")) return "ci";
  return null;
}
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [role, setRole] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setRole(null);
        setLoading(false);
        return;
      }
      void fetchRole(nextSession.user.id).then((r) => {
        if (active) {
          setRole(r);
          setLoading(false);
        }
      });
    });
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) setRole(await fetchRole(data.session.user.id));
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const value = reactExports.useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      role,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      }
    }),
    [session, role, loading]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Client Health — Algorithm Agency" },
      {
        name: "description",
        content: "Internal client health scoring tool for Algorithm Agency Client Impact leads."
      },
      { property: "og:title", content: "Client Health — Algorithm Agency" },
      {
        property: "og:description",
        content: "Internal client health scoring tool for Algorithm Agency Client Impact leads."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})
  ] }) });
}
const Route$9 = createFileRoute()({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  }
});
const $$splitComponentImporter$8 = () => import("./route-BFra6Ruf.mjs");
const Route$8 = createFileRoute()({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({
      to: "/login"
    });
    const role = await fetchRole(data.user.id);
    return {
      user: data.user,
      role
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./login-BDFapvn_.mjs");
const Route$7 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Sign in — Client Health"
    }, {
      name: "description",
      content: "Sign in to Client Health, Algorithm Agency's client scoring tool."
    }, {
      property: "og:title",
      content: "Sign in — Client Health"
    }, {
      property: "og:description",
      content: "Sign in to Client Health, Algorithm Agency's client scoring tool."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./cycles-ChfEveZ_.mjs");
const Route$6 = createFileRoute()({
  beforeLoad: ({
    context
  }) => {
    if (context.role !== "director" && context.role !== "admin") {
      throw redirect({
        to: "/dashboard"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Cycles — Client Health"
    }, {
      name: "description",
      content: "Track bi-weekly submission progress, close cycles and run the batch agent."
    }, {
      property: "og:title",
      content: "Cycles — Client Health"
    }, {
      property: "og:description",
      content: "Track bi-weekly submission progress, close cycles and run the batch agent."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./dashboard-BVvAhVln.mjs");
const Route$5 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Portfolio dashboard — Client Health"
    }, {
      name: "description",
      content: "Bi-weekly health scores across the Algorithm Agency client portfolio."
    }, {
      property: "og:title",
      content: "Portfolio dashboard — Client Health"
    }, {
      property: "og:description",
      content: "Bi-weekly health scores across the Algorithm Agency client portfolio."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./review-CkbBv-lt.mjs");
const Route$4 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Agent review queue — Client Health"
    }, {
      name: "description",
      content: "Confirm or override the agent's analysis for each client after a cycle closes."
    }, {
      property: "og:title",
      content: "Agent review queue — Client Health"
    }, {
      property: "og:description",
      content: "Confirm or override the agent's analysis for each client after a cycle closes."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./wizard-GZJN5YH9.mjs");
const Route$3 = createFileRoute()({
  beforeLoad: ({
    context
  }) => {
    if (context.role !== "ci" && context.role !== "admin") {
      throw redirect({
        to: "/dashboard"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Scoring wizard — Client Health"
    }, {
      name: "description",
      content: "Step through the bi-weekly scoring flow for each assigned client."
    }, {
      property: "og:title",
      content: "Scoring wizard — Client Health"
    }, {
      property: "og:description",
      content: "Step through the bi-weekly scoring flow for each assigned client."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.clients-CoYOsLhf.mjs");
const Route$2 = createFileRoute()({
  beforeLoad: ({
    context
  }) => {
    if (context.role !== "admin") {
      throw redirect({
        to: "/dashboard"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Client management — Client Health"
    }, {
      name: "description",
      content: "Create, edit and assign clients to Client Impact leads."
    }, {
      property: "og:title",
      content: "Client management — Client Health"
    }, {
      property: "og:description",
      content: "Create, edit and assign clients to Client Impact leads."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.import-BNs97IeI.mjs");
const Route$1 = createFileRoute()({
  beforeLoad: ({
    context
  }) => {
    if (context.role !== "admin") throw redirect({
      to: "/dashboard"
    });
  },
  head: () => ({
    meta: [{
      title: "Seed import — Client Health"
    }, {
      name: "description",
      content: "Admin-only import of the baseline client and submission seed file."
    }, {
      property: "og:title",
      content: "Seed import — Client Health"
    }, {
      property: "og:description",
      content: "Admin-only import of the baseline client and submission seed file."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitNotFoundComponentImporter = () => import("./clients._id-5GeMacym.mjs");
const $$splitErrorComponentImporter = () => import("./clients._id-OSDPTDfD.mjs");
const $$splitComponentImporter = () => import("./clients._id-RbUJ952_.mjs");
const Route = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Client drill-down — Client Health"
    }, {
      name: "description",
      content: "Score history, delta history, past insights and action outcomes for a client."
    }, {
      property: "og:title",
      content: "Client drill-down — Client Health"
    }, {
      property: "og:description",
      content: "Score history, delta history, past insights and action outcomes for a client."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const IndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const AuthenticatedRouteRoute = Route$8.update({
  id: "/_authenticated",
  getParentRoute: () => Route$a
});
const LoginRoute = Route$7.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$a
});
const AuthenticatedCyclesRoute = Route$6.update({
  id: "/cycles",
  path: "/cycles",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$5.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedReviewRoute = Route$4.update({
  id: "/review",
  path: "/review",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedWizardRoute = Route$3.update({
  id: "/wizard",
  path: "/wizard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminClientsRoute = Route$2.update({
  id: "/admin/clients",
  path: "/admin/clients",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminImportRoute = Route$1.update({
  id: "/admin/import",
  path: "/admin/import",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedClientsIdRoute = Route.update({
  id: "/clients/$id",
  path: "/clients/$id",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedCyclesRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedReviewRoute,
  AuthenticatedWizardRoute,
  AuthenticatedAdminClientsRoute,
  AuthenticatedAdminImportRoute,
  AuthenticatedClientsIdRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  LoginRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r,
  useAuth as u
};
