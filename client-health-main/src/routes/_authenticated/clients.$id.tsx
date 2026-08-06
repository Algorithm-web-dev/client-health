import { useProfile } from "@/hooks/useProfile";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlagList, OverrideAnnotation, RiskArrow } from "@/components/review/ReviewBits";
import { fetchClientDetail } from "@/lib/client-detail";
import {
  ACTION_OUTCOMES,
  parseFlags,
  parseTrajectory,
  setActionOutcome,
} from "@/lib/review";
import { db } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/clients/$id")({
  head: () => ({
    meta: [
      { title: "Client drill-down — Client Health" },
      {
        name: "description",
        content: "Score history, delta history, past insights and action outcomes for a client.",
      },
      { property: "og:title", content: "Client drill-down — Client Health" },
      {
        property: "og:description",
        content: "Score history, delta history, past insights and action outcomes for a client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientDetailPage,
  errorComponent: ({ error }) => (
    <div className="surface-card p-6 text-sm text-destructive" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="surface-card p-6 text-sm text-muted-foreground">Client not found.</div>
  ),
});

const RAG_TICKS: Record<number, string> = { 1: "Red", 2: "Amber", 3: "Green" };

function ClientDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { role } = useProfile();
  const readOnly = role === "director";



  const { data, isLoading, error } = useQuery({
    queryKey: ["client-detail", id],
    queryFn: () => fetchClientDetail(id),
  });

  const reviewsQuery = useQuery({
    queryKey: ["client-reviews", id],
    enabled: Boolean(data),
    queryFn: async () => {
      const ids = (data?.outputs ?? []).map((o) => o.id);
      if (ids.length === 0) return [];
      const { data: rows, error: err } = await db.reviews().select("*").in("agent_output_id", ids);
      if (err) throw err;
      return rows ?? [];
    },
  });

  const overrides = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const r of reviewsQuery.data ?? []) {
      if (r.decision === "override") map.set(r.agent_output_id, r.override_reason);
    }
    return map;
  }, [reviewsQuery.data]);

  const outcome = useMutation({
    mutationFn: (input: { id: string; outcome: string }) => setActionOutcome(input),
    onSuccess: () => {
      toast.success("Outcome saved");
      void queryClient.invalidateQueries({ queryKey: ["client-detail", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="surface-card p-6 text-sm text-destructive" role="alert">
        Could not load this client: {(error as Error)?.message ?? "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.client.name}
        description={`${data.client.ci_leads?.join(", ") || "Unassigned"} · ${
          data.client.tier ? `Tier ${data.client.tier}` : "No tier"
        }`}
      />

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold">Score history</h2>
        {data.scores.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No submissions yet — score this client in the wizard to start the history.
          </p>
        ) : (
          <div className="mt-4 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scores} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cycle" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="rag"
                  domain={[1, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v: number) => RAG_TICKS[v] ?? ""}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="conf"
                  orientation="right"
                  domain={[1, 10]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Line yAxisId="rag" type="monotone" dataKey="performance" name="SEO/Perf" stroke="var(--color-chart-1, #1a4fa0)" connectNulls />
                <Line yAxisId="rag" type="monotone" dataKey="paid" name="Paid" stroke="var(--color-chart-2, #a05c00)" connectNulls />
                <Line yAxisId="rag" type="monotone" dataKey="relationship" name="Relationship" stroke="var(--color-chart-3, #b52b2b)" connectNulls />
                <Line yAxisId="rag" type="monotone" dataKey="growth" name="Growth" stroke="var(--color-chart-4, #1a7a4a)" connectNulls />
                <Line
                  yAxisId="conf"
                  type="monotone"
                  dataKey="confidence"
                  name="Confidence"
                  stroke="#6b7280"
                  strokeDasharray="4 3"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold">Delta history</h2>
        {data.deltas.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No agent deltas yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {data.deltas.map((d) => (
              <li key={d.id} className="border-l-4 border-l-primary pl-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">{d.cycle_id}</span>
                  <RiskArrow before={d.risk_before} after={d.risk_after} />
                </div>
                {d.summary ? <p className="mt-1 text-sm">{d.summary}</p> : null}
                <FlagList flags={parseFlags(d.new_flags)} tone="new" />
                <FlagList flags={parseFlags(d.resolved_flags)} tone="resolved" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold">Past insights</h2>
        {data.outputs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No agent insights yet.</p>
        ) : (
          <ul className="mt-3 space-y-5">
            {data.outputs.map((o) => {
              const traj = parseTrajectory(o.trajectory_flag);
              const isOverridden = overrides.has(o.id);
              return (
                <li key={o.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">{o.cycle_id}</span>
                    {traj?.direction ? (
                      isOverridden ? (
                        <OverrideAnnotation
                          flag={`Trajectory: ${traj.direction}`}
                          reason={overrides.get(o.id) ?? null}
                        />
                      ) : (
                        <span className="text-xs font-medium capitalize text-muted-foreground">
                          Trajectory: {traj.direction}
                        </span>
                      )
                    ) : null}
                  </div>
                  <p
                    className={
                      isOverridden
                        ? "mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground line-through"
                        : "mt-2 whitespace-pre-line text-sm leading-relaxed"
                    }
                  >
                    {o.insight_narrative ?? "No narrative."}
                  </p>
                  {isOverridden ? (
                    <p className="mt-2 text-sm text-primary">
                      CI override: {overrides.get(o.id) ?? "No reason given"}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold">Action log</h2>
        {data.actions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No actions logged yet — accept a recommended action in Review to track it here.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.actions.map((a) => (
              <ActionLogRow
                key={a.id}
                action={a}
                readOnly={readOnly}
                pending={outcome.isPending}
                onSet={(value) => outcome.mutate({ id: a.id, outcome: value })}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActionLogRow({
  action,
  pending,
  onSet,
  readOnly,
}: {
  action: {
    id: string;
    description: string;
    owner: string | null;
    deadline: string | null;
    status: string;
    outcome: string | null;
    cycle_id: string;
  };
  pending: boolean;
  onSet: (outcome: string) => void;
  readOnly: boolean;
}) {
  const [value, setValue] = useState(action.outcome ?? "");

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm">{action.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {action.cycle_id} · {action.owner ?? "Unassigned"}
            {action.deadline ? ` · due ${action.deadline}` : ""} · {action.status}
          </p>
        </div>
        {action.outcome || readOnly ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
            {action.outcome
              ? (ACTION_OUTCOMES.find((o) => o.value === action.outcome)?.label ?? action.outcome)
              : "No outcome yet"}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="h-9 w-44" aria-label="Set outcome">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OUTCOMES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={!value || pending} onClick={() => onSet(value)}>
              Close action
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
