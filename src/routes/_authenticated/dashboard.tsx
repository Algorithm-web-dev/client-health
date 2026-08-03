import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RagPill, TrajectoryLabel } from "@/components/RagPill";
import { EmptyState } from "@/components/EmptyState";
import { AlertPanel } from "@/components/AlertPanel";
import { OverrideAnnotation } from "@/components/review/ReviewBits";


import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { asRag, fetchPortfolio, type PortfolioRow } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Portfolio dashboard — Client Health" },
      {
        name: "description",
        content: "Bi-weekly health scores across the Algorithm Agency client portfolio.",
      },
      { property: "og:title", content: "Portfolio dashboard — Client Health" },
      {
        property: "og:description",
        content: "Bi-weekly health scores across the Algorithm Agency client portfolio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const ALL = "all";
const UNASSIGNED = "Unassigned";

function leadsLabel(row: PortfolioRow) {
  return row.ciLeads.length > 0 ? row.ciLeads.join(", ") : UNASSIGNED;
}

function DashboardPage() {
  const [ci, setCi] = useState<string>(ALL);
  const [tier, setTier] = useState<string>(ALL);
  const [rag, setRag] = useState<string>(ALL);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const ciOptions = useMemo(() => {
    const set = new Set<string>();
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


  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Health status across all clients for the current bi-weekly cycle."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={ci} onValueChange={setCi}>
          <SelectTrigger className="w-[200px]" aria-label="Filter by CI lead">
            <SelectValue placeholder="CI lead" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All CI leads</SelectItem>
            {ciOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by tier">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All tiers</SelectItem>
            <SelectItem value="A">Tier A</SelectItem>
            <SelectItem value="B">Tier B</SelectItem>
            <SelectItem value="C">Tier C</SelectItem>
            <SelectItem value="D">Tier D</SelectItem>
            <SelectItem value="none">No tier</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rag} onValueChange={setRag}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by RAG status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="Green">Green</SelectItem>
            <SelectItem value="Amber">Amber</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
            <SelectItem value="none">No score</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} client{filtered.length === 1 ? "" : "s"}
          {alerts > 0 ? ` · ${alerts} needing attention` : ""}
        </span>
      </div>

      {error ? (
        <div className="surface-card p-6 text-sm text-destructive" role="alert">
          Could not load the portfolio: {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No clients yet"
          hint="Once clients are imported or created, their bi-weekly health lands here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No clients match these filters"
          hint="Clear a filter to see the rest of the portfolio."
        />
      ) : hasNoSubmissions ? (
        <>
          <AlertPanel rows={filtered} />
          <EmptyState
            title="No submissions yet this cycle"
            hint="Start with your highest-risk client — the wizard pre-fills from their last cycle."
          />
        </>
      ) : (
        <>
        <AlertPanel rows={filtered} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {filtered.map((row) => (
            <Link
              key={row.client.id}
              to="/clients/$id"
              params={{ id: row.client.id }}
              className="surface-card block p-5 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">{row.client.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{leadsLabel(row)}</p>
                </div>
                {row.alert ? (
                  <AlertTriangle
                    className="size-5 shrink-0 text-destructive"
                    aria-label={
                      row.latestSubmission?.hidden_risk
                        ? "Hidden risk flagged"
                        : "Trajectory deteriorating"
                    }
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <RagPill status={asRag(row.latestSubmission?.overall_rag)} />
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  {row.client.tier ? `Tier ${row.client.tier}` : "No tier"}
                </span>
                {row.overridden && row.trajectory ? (
                  <OverrideAnnotation
                    flag={row.trajectory}
                    reason={row.overrideReason}
                  />
                ) : (
                  <TrajectoryLabel direction={row.trajectory} />
                )}
              </div>


              <dl className="mt-4 flex items-end justify-between border-t border-border pt-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Confidence</dt>
                  <dd className="font-semibold tabular-nums">
                    {row.latestSubmission?.confidence_score ?? "—"}
                    <span className="text-xs font-normal text-muted-foreground">/10</span>
                  </dd>
                </div>
                <div className="text-right">
                  <dt className="text-xs text-muted-foreground">Latest cycle</dt>
                  <dd className="font-medium">{row.latestSubmission?.cycle_id ?? "None"}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
        </>
      )}

    </div>
  );
}
