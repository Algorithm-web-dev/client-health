import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RagPill } from "@/components/RagPill";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { Rag, Submission } from "@/lib/db";
import {
  computeOverallRag,
  EMPTY_FORM,
  FALLBACK_QUESTIONS,
  fetchClientSubmissions,
  fetchWizardContext,
  finalizeSubmission,
  formFromSubmission,
  requestAgentQuestions,
  saveSubmission,
  type AgentQuestion,
  type WizardForm,
} from "@/lib/wizard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/wizard")({
  beforeLoad: ({ context }) => {
    if (context.role !== "ci" && context.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Scoring wizard — Client Health" },
      {
        name: "description",
        content: "Step through the bi-weekly scoring flow for each assigned client.",
      },
      { property: "og:title", content: "Scoring wizard — Client Health" },
      {
        property: "og:description",
        content: "Step through the bi-weekly scoring flow for each assigned client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WizardPage,
});

const RAGS: Rag[] = ["Green", "Amber", "Red"];

function RagPicker({
  value,
  onChange,
  label,
}: {
  value: Rag | null;
  onChange: (r: Rag) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {RAGS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            aria-pressed={value === r}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm font-medium transition-colors sm:py-2",
              value === r
                ? r === "Green"
                  ? "border-success bg-success/10 text-success"
                  : r === "Amber"
                    ? "border-warning bg-warning/10 text-warning"
                    : "border-destructive bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

const STEP_TITLES = [
  "SEO / Performance",
  "Paid performance",
  "Relationship",
  "Growth",
  "Next action",
  "Agent questions",
];

type Phase = "select" | "form" | "questions" | "done";

function WizardPage() {
  const { user } = useAuth();
  const { profile, role } = useProfile();
  const isAdmin = role === "admin";

  const identifiers = useMemo(
    () => [profile?.full_name ?? "", profile?.email ?? ""].filter(Boolean),
    [profile?.full_name, profile?.email],
  );

  const contextQuery = useQuery({
    queryKey: ["wizard-context", identifiers.join("|"), isAdmin],
    enabled: Boolean(profile),
    queryFn: () => fetchWizardContext(identifiers, isAdmin),
  });

  const cycle = contextQuery.data?.cycle ?? null;
  const clients = contextQuery.data?.clients ?? [];

  const [clientId, setClientId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("select");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [agentPending, setAgentPending] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<AgentQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [wasFastPath, setWasFastPath] = useState(false);

  const submissionsQuery = useQuery({
    queryKey: ["wizard-submissions", clientId, cycle?.id],
    enabled: Boolean(clientId && cycle?.id),
    queryFn: () => fetchClientSubmissions(clientId, cycle!.id),
  });

  const prefillSource = submissionsQuery.data?.current ?? submissionsQuery.data?.previous ?? null;
  const editingExisting = Boolean(submissionsQuery.data?.current);
  const overall = computeOverallRag(form);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startFullPath() {
    setForm(prefillSource ? formFromSubmission(prefillSource) : EMPTY_FORM);
    setErrors([]);
    setStep(0);
    setPhase("form");
  }

  function validateStep(current: number, f: WizardForm): string[] {
    const problems: string[] = [];
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

  async function submitPhaseOne(f: WizardForm, fastPath: boolean) {
    if (!user || !cycle) return;
    setSaving(true);
    try {
      const saved = await saveSubmission({
        clientId,
        cycleId: cycle.id,
        userId: user.id,
        existingId: submissionsQuery.data?.current?.id ?? null,
        fastPath,
        form: f,
      });
      setSubmission(saved);

      if (fastPath) {
        await finalizeSubmission({
          submission: saved,
          answers: [],
          isFallback: false,
          ragAtTime: computeOverallRag(f),
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
      toast.error((error as Error).message || "Could not save the submission.");
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
        answers: questions.map((q, i) => ({ ...q, answer_text: answers[i] ?? "" })),
        isFallback,
        ragAtTime: computeOverallRag(form),
      });
      setWasFastPath(false);
      setPhase("done");
    } catch (error) {
      toast.error((error as Error).message || "Could not save your answers.");
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Bi-weekly scoring"
        description={
          cycle
            ? `Open cycle: ${cycle.label} (${cycle.start_date} → ${cycle.end_date})`
            : "Score each of your clients for the open cycle, one step at a time."
        }
      />

      {contextQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your clients…
          </CardContent>
        </Card>
      ) : !cycle ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            There is no open cycle right now. A director or admin needs to open one before scoring
            can start.
          </CardContent>
        </Card>
      ) : phase === "done" ? (
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" />
            <div>
              <h2 className="text-lg font-semibold">
                {wasFastPath ? "Marked as no material change" : "Submission complete"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedClient?.name} · {cycle.label}
                {wasFastPath ? " · carried forward from the previous cycle" : ""}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Overall</span>
              <RagPill status={computeOverallRag(form)} />
            </div>
            <Button onClick={resetAll}>Score another client</Button>
          </CardContent>
        </Card>
      ) : phase === "select" ? (
        <Card>
          <CardHeader>
            <CardTitle>Choose a client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="client">Your clients</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.tier ? ` · Tier ${c.tier}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active clients are assigned to you yet.
                </p>
              ) : null}
            </div>

            {clientId ? (
              submissionsQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading previous scores…
                </p>
              ) : (
                <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    {editingExisting
                      ? "A submission already exists for this cycle — you are editing it."
                      : prefillSource
                        ? `Pre-filled from ${prefillSource.cycle_id}.`
                        : "No previous submission — starting from a blank score."}
                    {submissionsQuery.data && submissionsQuery.data.fastPathStreak > 0
                      ? ` ${submissionsQuery.data.fastPathStreak} consecutive fast-path cycle${
                          submissionsQuery.data.fastPathStreak === 1 ? "" : "s"
                        }.`
                      : ""}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      onClick={handleFastPath}
                      disabled={!submissionsQuery.data?.previous || saving}
                    >
                      <Zap className="size-4" /> No material change
                    </Button>
                    <Button onClick={startFullPath} disabled={saving}>
                      Start full scoring <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">
                Step {progressStep} of 6 · {STEP_TITLES[progressStep - 1]}
              </span>
              <span className="text-muted-foreground">{selectedClient?.name}</span>
            </div>
            <Progress value={(progressStep / 6) * 100} />
          </div>

          {phase === "form" ? (
            <Card>
              <CardHeader>
                <CardTitle>{STEP_TITLES[step]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {step === 0 ? (
                  <>
                    <RagPicker
                      label="SEO / performance status"
                      value={form.performance_rag}
                      onChange={(r) => set("performance_rag", r)}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="perf-why">Why?</Label>
                      <Textarea
                        id="perf-why"
                        rows={4}
                        value={form.performance_reason}
                        onChange={(e) => set("performance_reason", e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <RagPicker
                      label="Paid performance status"
                      value={form.paid_rag}
                      onChange={(r) => set("paid_rag", r)}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="paid-why">Why?</Label>
                      <Textarea
                        id="paid-why"
                        rows={4}
                        value={form.paid_reason}
                        onChange={(e) => set("paid_reason", e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <RagPicker
                      label="Relationship status"
                      value={form.relationship_rag}
                      onChange={(r) => set("relationship_rag", r)}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="rel-why">Why?</Label>
                      <Textarea
                        id="rel-why"
                        rows={4}
                        value={form.relationship_reason}
                        onChange={(e) => set("relationship_reason", e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confidence">
                        Will this client still be with us in 12 months?
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="confidence"
                          min={1}
                          max={10}
                          step={1}
                          value={[form.confidence_score]}
                          onValueChange={([v]) => set("confidence_score", v ?? 7)}
                          className="flex-1"
                        />
                        <span className="w-8 text-right text-sm font-semibold">
                          {form.confidence_score}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <RagPicker
                      label="Growth status"
                      value={form.growth_rag}
                      onChange={(r) => set("growth_rag", r)}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="growth-why">Why?</Label>
                      <Textarea
                        id="growth-why"
                        rows={4}
                        value={form.growth_reason}
                        onChange={(e) => set("growth_reason", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2 sm:col-span-3">
                        <Label htmlFor="upsell-op">Upsell opportunity (optional)</Label>
                        <Input
                          id="upsell-op"
                          value={form.upsell_opportunity}
                          onChange={(e) => set("upsell_opportunity", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="upsell-value">Value (optional)</Label>
                        <Input
                          id="upsell-value"
                          value={form.upsell_value}
                          onChange={(e) => set("upsell_value", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upsell-prob">Probability %</Label>
                        <Input
                          id="upsell-prob"
                          type="number"
                          min={0}
                          max={100}
                          value={form.upsell_probability}
                          onChange={(e) => set("upsell_probability", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="action">Next action</Label>
                      <Textarea
                        id="action"
                        rows={3}
                        value={form.next_action}
                        onChange={(e) => set("next_action", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="owner">Owner</Label>
                        <Input
                          id="owner"
                          value={form.action_owner}
                          onChange={(e) => set("action_owner", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={form.action_deadline}
                          onChange={(e) => set("action_deadline", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                      <span className="text-muted-foreground">Computed overall RAG</span>
                      <RagPill status={overall} />
                    </div>
                  </>
                ) : null}

                {errors.length > 0 ? (
                  <ul className="space-y-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => (step === 0 ? setPhase("select") : setStep(step - 1))}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button onClick={handleNext} disabled={saving} className="w-full sm:w-auto">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                    {step === 4 ? "Save & continue" : "Next"}
                    {step < 4 ? <ArrowRight className="size-4" /> : null}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Agent questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {agentPending ? (
                  <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> The agent is reading your
                    submission…
                  </p>
                ) : (
                  <>
                    {isFallback ? (
                      <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        Standard questions shown — agent unavailable
                      </div>
                    ) : null}
                    {questions.map((q, i) => (
                      <div key={`${q.question_text}-${i}`} className="space-y-2">
                        <Label htmlFor={`q-${i}`}>{q.question_text}</Label>
                        {q.question_context ? (
                          <p className="text-xs text-muted-foreground">{q.question_context}</p>
                        ) : null}
                        <Textarea
                          id={`q-${i}`}
                          rows={3}
                          value={answers[i] ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[i] = e.target.value;
                              return next;
                            })
                          }
                        />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button onClick={handleFinalSubmit} disabled={saving}>
                        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                        Submit
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

