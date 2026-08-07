import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader } from "./PageHeader-CGH2hvKy.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, P as Progress } from "./progress-CIhT2qvU.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.mjs";
import { S as Slider$1, a as SliderTrack, b as SliderRange, c as SliderThumb } from "../_libs/radix-ui__react-slider.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { R as RagPill } from "./RagPill-D0s37ObT.mjs";
import { u as useAuth } from "./router-B82dyFaT.mjs";
import { u as useProfile } from "./useProfile-CSLo6pXR.mjs";
import { d as db } from "./db-CEBZ_C7z.mjs";
import { d as LoaderCircle, a as CircleCheck, Z as Zap, j as ArrowRight, k as ArrowLeft, T as TriangleAlert } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
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
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./client-by8QvJ8A.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Slider$1,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderTrack, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRange, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Slider$1.displayName;
const generateQuestions = async (args) => {
  try {
    const res = await fetch(
      "https://vldvvfgzsseqswaligwf.supabase.co/functions/v1/generate-questions",
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
    console.log("[generate-questions] HTTP status:", res.status);
    const data = await res.json();
    console.log("[generate-questions] response data:", JSON.stringify(data));
    if (data.error) return { error: "parse_failed" };
    return data;
  } catch (err) {
    console.error("[generate-questions] fetch error:", String(err));
    return { error: "parse_failed" };
  }
};
const EMPTY_FORM = {
  performance_rag: null,
  performance_reason: "",
  paid_rag: null,
  paid_reason: "",
  relationship_rag: null,
  relationship_reason: "",
  confidence_score: 7,
  growth_rag: null,
  growth_reason: "",
  upsell_opportunity: "",
  upsell_value: "",
  upsell_probability: "",
  next_action: "",
  action_owner: "",
  action_deadline: ""
};
function formFromSubmission(s) {
  return {
    performance_rag: s.performance_rag ?? null,
    performance_reason: s.performance_reason ?? "",
    paid_rag: s.paid_rag ?? null,
    paid_reason: s.paid_reason ?? "",
    relationship_rag: s.relationship_rag ?? null,
    relationship_reason: s.relationship_reason ?? "",
    confidence_score: s.confidence_score ?? 7,
    growth_rag: s.growth_rag ?? null,
    growth_reason: s.growth_reason ?? "",
    upsell_opportunity: s.upsell_opportunity ?? "",
    upsell_value: s.upsell_value ?? "",
    upsell_probability: s.upsell_probability == null ? "" : String(s.upsell_probability),
    next_action: s.next_action ?? "",
    action_owner: s.action_owner ?? "",
    action_deadline: s.action_deadline ?? ""
  };
}
const RAG_RANK = { Green: 0, Amber: 1, Red: 2 };
function computeOverallRag(form) {
  const rags = [form.performance_rag, form.paid_rag, form.relationship_rag, form.growth_rag].filter(
    (r) => r !== null
  );
  if (rags.length === 0) return null;
  let worst = "Green";
  for (const r of rags) if (RAG_RANK[r] > RAG_RANK[worst]) worst = r;
  if (worst === "Green" && form.confidence_score <= 4) return "Amber";
  return worst;
}
const FALLBACK_QUESTIONS = {
  Green: [
    { question_text: "What is the single biggest risk to this account over the next 3 months?", question_context: null },
    { question_text: "What would need to happen for this client to increase their spend with us?", question_context: null }
  ],
  Amber: [
    { question_text: "What specifically moved this account away from Green this cycle?", question_context: null },
    { question_text: "Which stakeholder is least satisfied right now, and why?", question_context: null },
    { question_text: "What is the one metric the client is judging us on today?", question_context: null },
    { question_text: "What needs to change before the next cycle to move this back to Green?", question_context: null }
  ],
  Red: [
    { question_text: "What is the root cause of the Red status — delivery, results, or relationship?", question_context: null },
    { question_text: "Has the client raised the possibility of reducing scope or leaving?", question_context: null },
    { question_text: "Which commitments have we missed, and when?", question_context: null },
    { question_text: "Who from our side owns the recovery plan, and what is the first step?", question_context: null },
    { question_text: "What support do you need from the director to save this account?", question_context: null }
  ]
};
function isLeadFor(client, identifiers) {
  const leads = (client.ci_leads ?? []).map((l) => l.trim().toLowerCase());
  return identifiers.some((id) => leads.includes(id));
}
async function fetchWizardContext(identifiers, isAdmin) {
  const [cycleRes, clientsRes] = await Promise.all([
    db.cycles().select("*").eq("status", "open").order("start_date", { ascending: false }).limit(1),
    db.clients().select("*").eq("status", "active").order("name")
  ]);
  if (cycleRes.error) throw cycleRes.error;
  if (clientsRes.error) throw clientsRes.error;
  const ids = identifiers.filter(Boolean).map((i) => i.trim().toLowerCase());
  const all = clientsRes.data ?? [];
  return {
    cycle: cycleRes.data?.[0] ?? null,
    clients: isAdmin ? all : all.filter((c) => isLeadFor(c, ids))
  };
}
async function fetchClientSubmissions(clientId, cycleId) {
  const { data, error } = await db.submissions().select("*").eq("client_id", clientId).order("submitted_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  const rows = data ?? [];
  const current = rows.find((r) => r.cycle_id === cycleId) ?? null;
  const prior = rows.filter((r) => r.cycle_id !== cycleId);
  let streak = 0;
  for (const r of prior) {
    if (r.fast_path) streak += 1;
    else break;
  }
  return { current, previous: prior[0] ?? null, fastPathStreak: streak };
}
async function saveSubmission({
  clientId,
  cycleId,
  userId,
  existingId,
  fastPath,
  form
}) {
  const probability = form.upsell_probability.trim() === "" ? null : Number(form.upsell_probability);
  const payload = {
    client_id: clientId,
    cycle_id: cycleId,
    submitted_by: userId,
    fast_path: fastPath,
    performance_rag: form.performance_rag,
    performance_reason: form.performance_reason || null,
    paid_rag: form.paid_rag,
    paid_reason: form.paid_reason || null,
    relationship_rag: form.relationship_rag,
    relationship_reason: form.relationship_reason || null,
    confidence_score: form.confidence_score,
    growth_rag: form.growth_rag,
    growth_reason: form.growth_reason || null,
    overall_rag: computeOverallRag(form),
    upsell_opportunity: form.upsell_opportunity || null,
    upsell_value: form.upsell_value || null,
    upsell_probability: probability != null && Number.isFinite(probability) ? probability : null,
    next_action: form.next_action || null,
    action_owner: form.action_owner || null,
    action_deadline: form.action_deadline || null,
    status: "phase1_complete",
    submitted_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const query = existingId ? db.submissions().update(payload).eq("id", existingId).select("*").single() : db.submissions().upsert(payload, { onConflict: "client_id,cycle_id" }).select("*").single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
const AGENT_TIMEOUT_MS = 45e3;
async function requestAgentQuestions(submissionId) {
  const call = (async () => {
    const data = await generateQuestions({ data: { submission_id: submissionId } });
    const list = data?.questions;
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.map((q) => {
      const row = q;
      const text = typeof row["text"] === "string" ? row["text"] : null;
      if (!text) return null;
      const ctx = typeof row["context"] === "string" && row["context"] ? row["context"] : null;
      return { question_text: text, question_context: ctx };
    }).filter((q) => q !== null);
  })();
  console.log("[wizard] calling requestAgentQuestions for", submissionId);
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), AGENT_TIMEOUT_MS));
  try {
    const result = await Promise.race([call, timeout]);
    console.log("[wizard] agent result:", result);
    return result;
  } catch (err) {
    console.error("[wizard] SERVER FUNCTION ERROR:", JSON.stringify(err, null, 2));
    return null;
  }
}
async function finalizeSubmission(args) {
  const { submission, answers, isFallback, ragAtTime } = args;
  if (answers.length > 0) {
    const { error } = await db.questions().insert(
      answers.map((a) => ({
        submission_id: submission.id,
        client_id: submission.client_id,
        cycle_id: submission.cycle_id,
        question_text: a.question_text,
        question_context: a.question_context,
        answer_text: a.answer_text || null,
        generated_by_agent: !isFallback,
        is_fallback: isFallback,
        rag_at_time: ragAtTime
      }))
    );
    if (error) throw error;
  }
  const { error: updateError } = await db.submissions().update({ status: "submitted" }).eq("id", submission.id);
  if (updateError) throw updateError;
}
const RAGS = ["Green", "Amber", "Red"];
function RagPicker({
  value,
  onChange,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: RAGS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onChange(r), "aria-pressed": value === r, className: cn("rounded-lg border px-4 py-3 text-sm font-medium transition-colors sm:py-2", value === r ? r === "Green" ? "border-success bg-success/10 text-success" : r === "Amber" ? "border-warning bg-warning/10 text-warning" : "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:bg-muted"), children: r }, r)) })
  ] });
}
const STEP_TITLES = ["SEO / Performance", "Paid performance", "Relationship", "Growth", "Next action", "Agent questions"];
function WizardPage() {
  const {
    user
  } = useAuth();
  const {
    profile,
    role
  } = useProfile();
  const isAdmin = role === "admin";
  const identifiers = reactExports.useMemo(() => [profile?.full_name ?? "", profile?.email ?? ""].filter(Boolean), [profile?.full_name, profile?.email]);
  const contextQuery = useQuery({
    queryKey: ["wizard-context", identifiers.join("|"), isAdmin],
    enabled: Boolean(profile),
    queryFn: () => fetchWizardContext(identifiers, isAdmin)
  });
  const cycle = contextQuery.data?.cycle ?? null;
  const clients = contextQuery.data?.clients ?? [];
  const [clientId, setClientId] = reactExports.useState("");
  const [showClientList, setShowClientList] = reactExports.useState(false);
  const [phase, setPhase] = reactExports.useState("select");
  const [step, setStep] = reactExports.useState(0);
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [errors, setErrors] = reactExports.useState([]);
  const [saving, setSaving] = reactExports.useState(false);
  const [agentPending, setAgentPending] = reactExports.useState(false);
  const [submission, setSubmission] = reactExports.useState(null);
  const [questions, setQuestions] = reactExports.useState([]);
  const [answers, setAnswers] = reactExports.useState([]);
  const [isFallback, setIsFallback] = reactExports.useState(false);
  const [wasFastPath, setWasFastPath] = reactExports.useState(false);
  const submissionsQuery = useQuery({
    queryKey: ["wizard-submissions", clientId, cycle?.id],
    enabled: Boolean(clientId && cycle?.id),
    queryFn: () => fetchClientSubmissions(clientId, cycle.id)
  });
  const prefillSource = submissionsQuery.data?.current ?? submissionsQuery.data?.previous ?? null;
  const editingExisting = Boolean(submissionsQuery.data?.current);
  const overall = computeOverallRag(form);
  function set(key, value) {
    setForm((f) => ({
      ...f,
      [key]: value
    }));
  }
  function startFullPath() {
    setForm(prefillSource ? formFromSubmission(prefillSource) : EMPTY_FORM);
    setErrors([]);
    setStep(0);
    setPhase("form");
  }
  function validateStep(current, f) {
    const problems = [];
    if (current === 0) {
      if (!f.performance_rag) problems.push("Pick a RAG status for SEO / performance.");
      if (!f.performance_reason.trim()) problems.push("Explain why in the Why? field.");
    }
    if (current === 1) {
      if (!f.paid_rag) problems.push("Pick a RAG status for paid performance.");
      if (!f.paid_reason.trim()) problems.push("Explain why in the Why? field.");
    }
    if (current === 2) {
      if (!f.relationship_rag) problems.push("Pick a RAG status for the relationship.");
      if (!f.relationship_reason.trim()) problems.push("Explain why in the Why? field.");
    }
    if (current === 3) {
      if (!f.growth_rag) problems.push("Pick a RAG status for growth.");
      if (!f.growth_reason.trim()) problems.push("Explain why in the Why? field.");
    }
    if (current === 4) {
      if (!f.next_action.trim()) problems.push("Describe the next action.");
      if (!f.action_owner.trim()) problems.push("Name an owner for the next action.");
      if (!f.action_deadline) problems.push("Set a deadline for the next action.");
    }
    return problems;
  }
  async function handleNext() {
    const problems = validateStep(step, form);
    setErrors(problems);
    if (problems.length > 0) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    await submitPhaseOne(form, false);
  }
  async function submitPhaseOne(f, fastPath) {
    if (!user || !cycle) return;
    setSaving(true);
    try {
      const saved = await saveSubmission({
        clientId,
        cycleId: cycle.id,
        userId: user.id,
        existingId: submissionsQuery.data?.current?.id ?? null,
        fastPath,
        form: f
      });
      setSubmission(saved);
      if (fastPath) {
        await finalizeSubmission({
          submission: saved,
          answers: [],
          isFallback: false,
          ragAtTime: computeOverallRag(f)
        });
        setWasFastPath(true);
        setPhase("done");
        return;
      }
      setPhase("questions");
      setAgentPending(true);
      const agentQuestions = await requestAgentQuestions(saved.id);
      const rag = computeOverallRag(f) ?? "Amber";
      if (agentQuestions && agentQuestions.length > 0) {
        setQuestions(agentQuestions);
        setAnswers(agentQuestions.map(() => ""));
        setIsFallback(false);
      } else {
        const fallback = FALLBACK_QUESTIONS[rag];
        setQuestions(fallback);
        setAnswers(fallback.map(() => ""));
        setIsFallback(true);
      }
      setAgentPending(false);
    } catch (error) {
      toast.error(error.message || "Could not save the submission.");
      setPhase("form");
      setAgentPending(false);
    } finally {
      setSaving(false);
    }
  }
  async function handleFastPath() {
    const previous = submissionsQuery.data?.previous;
    if (!previous) {
      toast.error("No previous submission to copy forward.");
      return;
    }
    await submitPhaseOne(formFromSubmission(previous), true);
  }
  async function handleFinalSubmit() {
    if (!submission) return;
    setSaving(true);
    try {
      await finalizeSubmission({
        submission,
        answers: questions.map((q, i) => ({
          ...q,
          answer_text: answers[i] ?? ""
        })),
        isFallback,
        ragAtTime: computeOverallRag(form)
      });
      setWasFastPath(false);
      setPhase("done");
    } catch (error) {
      toast.error(error.message || "Could not save your answers.");
    } finally {
      setSaving(false);
    }
  }
  function resetAll() {
    setClientId("");
    setPhase("select");
    setStep(0);
    setForm(EMPTY_FORM);
    setQuestions([]);
    setAnswers([]);
    setSubmission(null);
    setErrors([]);
    setWasFastPath(false);
    setIsFallback(false);
  }
  const selectedClient = clients.find((c) => c.id === clientId) ?? null;
  const progressStep = phase === "questions" || phase === "done" ? 6 : step + 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Bi-weekly scoring", description: cycle ? `Open cycle: ${cycle.label} (${cycle.start_date} → ${cycle.end_date})` : "Score each of your clients for the open cycle, one step at a time." }),
    contextQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-2 py-8 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
      " Loading your clients…"
    ] }) }) : !cycle ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-sm text-muted-foreground", children: "There is no open cycle right now. A director or admin needs to open one before scoring can start." }) }) : phase === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 py-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto size-10 text-success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: wasFastPath ? "Marked as no material change" : "Submission complete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          selectedClient?.name,
          " · ",
          cycle.label,
          wasFastPath ? " · carried forward from the previous cycle" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Overall" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RagPill, { status: computeOverallRag(form) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: resetAll, children: "Score another client" })
    ] }) }) : phase === "select" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Choose a client" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "client", children: "Your clients" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: clientId, onValueChange: setClientId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "client", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a client..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: clients.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
              c.name,
              c.tier ? ` - Tier ${c.tier}` : ""
            ] }, c.id)) })
          ] }),
          clients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No active clients are assigned to you yet." }) : null
        ] }),
        clientId ? submissionsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          " Loading previous scores…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-lg border border-border bg-muted/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            editingExisting ? "A submission already exists for this cycle — you are editing it." : prefillSource ? `Pre-filled from ${prefillSource.cycle_id}.` : "No previous submission — starting from a blank score.",
            submissionsQuery.data && submissionsQuery.data.fastPathStreak > 0 ? ` ${submissionsQuery.data.fastPathStreak} consecutive fast-path cycle${submissionsQuery.data.fastPathStreak === 1 ? "" : "s"}.` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleFastPath, disabled: !submissionsQuery.data?.previous || saving, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4" }),
              " No material change"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startFullPath, disabled: saving, children: [
              "Start full scoring ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
            ] })
          ] })
        ] }) : null
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "Step ",
            progressStep,
            " of 6 · ",
            STEP_TITLES[progressStep - 1]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: selectedClient?.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progressStep / 6 * 100 })
      ] }),
      phase === "form" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: STEP_TITLES[step] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          step === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RagPicker, { label: "SEO / performance status", value: form.performance_rag, onChange: (r) => set("performance_rag", r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "perf-why", children: "Why?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "perf-why", rows: 4, value: form.performance_reason, onChange: (e) => set("performance_reason", e.target.value) })
            ] })
          ] }) : null,
          step === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RagPicker, { label: "Paid performance status", value: form.paid_rag, onChange: (r) => set("paid_rag", r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paid-why", children: "Why?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "paid-why", rows: 4, value: form.paid_reason, onChange: (e) => set("paid_reason", e.target.value) })
            ] })
          ] }) : null,
          step === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RagPicker, { label: "Relationship status", value: form.relationship_rag, onChange: (r) => set("relationship_rag", r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rel-why", children: "Why?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "rel-why", rows: 4, value: form.relationship_reason, onChange: (e) => set("relationship_reason", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confidence", children: "Will this client still be with us in 12 months?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { id: "confidence", min: 1, max: 10, step: 1, value: [form.confidence_score], onValueChange: ([v]) => set("confidence_score", v ?? 7), className: "flex-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-right text-sm font-semibold", children: form.confidence_score })
              ] })
            ] })
          ] }) : null,
          step === 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RagPicker, { label: "Growth status", value: form.growth_rag, onChange: (r) => set("growth_rag", r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "growth-why", children: "Why?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "growth-why", rows: 4, value: form.growth_reason, onChange: (e) => set("growth_reason", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "upsell-op", children: "Upsell opportunity (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "upsell-op", value: form.upsell_opportunity, onChange: (e) => set("upsell_opportunity", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "upsell-value", children: "Value (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "upsell-value", value: form.upsell_value, onChange: (e) => set("upsell_value", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "upsell-prob", children: "Probability %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "upsell-prob", type: "number", min: 0, max: 100, value: form.upsell_probability, onChange: (e) => set("upsell_probability", e.target.value) })
              ] })
            ] })
          ] }) : null,
          step === 4 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "action", children: "Next action" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "action", rows: 3, value: form.next_action, onChange: (e) => set("next_action", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "owner", children: "Owner" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "owner", value: form.action_owner, onChange: (e) => set("action_owner", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "deadline", children: "Deadline" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "deadline", type: "date", value: form.action_deadline, onChange: (e) => set("action_deadline", e.target.value) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Computed overall RAG" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(RagPill, { status: overall })
            ] })
          ] }) : null,
          errors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: errors.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: e }, e)) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => step === 0 ? setPhase("select") : setStep(step - 1), disabled: saving, className: "w-full sm:w-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
              " Back"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNext, disabled: saving, className: "w-full sm:w-auto", children: [
              saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : null,
              step === 4 ? "Save & continue" : "Next",
              step < 4 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" }) : null
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Agent questions" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-5", children: agentPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 py-6 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          " The agent is reading your submission…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          isFallback ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 size-4 shrink-0" }),
            "Standard questions shown — agent unavailable"
          ] }) : null,
          questions.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `q-${i}`, children: q.question_text }),
            q.question_context ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: q.question_context }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: `q-${i}`, rows: 3, value: answers[i] ?? "", onChange: (e) => setAnswers((prev) => {
              const next = [...prev];
              next[i] = e.target.value;
              return next;
            }) })
          ] }, `${q.question_text}-${i}`)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleFinalSubmit, disabled: saving, children: [
            saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : null,
            "Submit"
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  WizardPage as component
};
