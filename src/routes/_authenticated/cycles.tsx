import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { analyzeSubmission } from "@/lib/batch.functions";
import {
  buildDigest,
  closeCycle,
  digestToText,
  fetchCycleProgress,
  fetchCycles,
  markBatchComplete,
  openNextCycle,
  type Digest,
} from "@/lib/cycles";
import type { Cycle } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/cycles")({
  beforeLoad: ({ context }) => {
    if (context.role !== "director" && context.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Cycles — Client Health" },
      {
        name: "description",
        content: "Track bi-weekly submission progress, close cycles and run the batch agent.",
      },
      { property: "og:title", content: "Cycles — Client Health" },
      {
        property: "og:description",
        content: "Track bi-weekly submission progress, close cycles and run the batch agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CyclesPage,
});

function CyclesPage() {
  const queryClient = useQueryClient();
  const runAnalysis = analyzeSubmission;

  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: fetchCycles });
  const cycles = cyclesQuery.data ?? [];
  const openCycleRow = cycles.find((c) => c.status === "open") ?? null;
  const latestCycle = cycles[0] ?? null;

  const progressQuery = useQuery({
    queryKey: ["cycle-progress", openCycleRow?.id ?? latestCycle?.id],
    enabled: Boolean(openCycleRow ?? latestCycle),
    queryFn: () => fetchCycleProgress((openCycleRow ?? latestCycle) as Cycle),
  });
  const progress = progressQuery.data ?? null;

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const [digest, setDigest] = useState<{ cycleId: string; digest: Digest } | null>(null);

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
      toast.error(`Could not close the cycle: ${(error as Error).message}`);
      return;
    }

    const failed: string[] = [];
    for (const [index, submission] of progress.submissions.entries()) {
      setCurrentName(submission.client_name);
      try {
        const result = await runAnalysis({ data: { submission_id: submission.id } });
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
      setDigest({ cycleId, digest: await buildDigest(cycleId) });
    } catch (error) {
      toast.error(`Digest could not be built: ${(error as Error).message}`);
    }
    setRunning(false);
    void queryClient.invalidateQueries({ queryKey: ["cycles"] });
    void queryClient.invalidateQueries({ queryKey: ["cycle-progress"] });
  }

  async function handleOpenNext() {
    if (!latestCycle) return;
    try {
      const next = await openNextCycle(latestCycle);
      toast.success(`Cycle ${next.id} is open.`);
      void queryClient.invalidateQueries({ queryKey: ["cycles"] });
    } catch (error) {
      toast.error(`Could not open the next cycle: ${(error as Error).message}`);
    }
  }

  const current = progress?.cycle ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cycles"
        description="Open, monitor and close bi-weekly scoring cycles."
      />

      {cyclesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading cycles…</p>
      ) : !current ? (
        <p className="text-sm text-muted-foreground">
          No cycles yet — open the first bi-weekly cycle to start collecting scores.
        </p>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                {current.label}{" "}
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {current.status}
                </span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {current.start_date} → {current.end_date} ·{" "}
                {progress ? `${progress.submittedCount} of ${progress.totalClients} clients submitted` : "…"}
              </p>
            </div>
            <div className="flex gap-2">
              {current.status === "open" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={running || !progress || progress.submissions.length === 0}>
                      Close cycle
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Close {current.label}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This locks the cycle and runs the batch agent across{" "}
                        {progress?.submissions.length ?? 0} submitted clients. It cannot be reopened.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCloseCycle}>
                        Close and analyse
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button variant="outline" onClick={handleOpenNext} disabled={running}>
                  Open next cycle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress && (
              <>
                <Progress
                  value={
                    progress.totalClients > 0
                      ? (progress.submittedCount / progress.totalClients) * 100
                      : 0
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {progress.perCi.map((ci) => (
                    <div
                      key={ci.ci}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{ci.ci}</span>
                      <span className="text-muted-foreground">
                        {ci.submitted} / {ci.total}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {running && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {currentName
                  ? `Analysing client ${Math.min(done + 1, total)} of ${total}… ${currentName}`
                  : "Building the digest…"}
              </p>
              <Progress className="mt-2" value={total > 0 ? (done / total) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {digest && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Digest — {digest.cycleId}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(digestToText(digest.cycleId, digest.digest));
                toast.success("Digest copied.");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {failures.length > 0 && (
              <p className="rounded-md bg-warning/10 px-3 py-2 text-warning">
                The agent failed for {failures.length} client(s): {failures.join(", ")}. Re-run when
                ready.
              </p>
            )}
            <section>
              <h3 className="mb-2 font-semibold">Director summary</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {digest.digest.director.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="font-semibold">Per CI</h3>
              {digest.digest.perCi.map((ci) => (
                <div key={ci.ci}>
                  <p className="font-medium">{ci.ci}</p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {ci.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All cycles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {cycles.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground">
                {c.start_date} → {c.end_date} · {c.status}
                {c.batch_run_completed ? " · analysed" : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

