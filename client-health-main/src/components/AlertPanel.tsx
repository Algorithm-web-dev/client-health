import { AlertTriangle, Repeat, Strikethrough, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PortfolioRow } from "@/lib/db";

type Group = {
  key: string;
  label: string;
  icon: typeof AlertTriangle;
  tone: string;
  rows: { row: PortfolioRow; detail: string }[];
};

/** Cross-portfolio attention panel: hidden risk, deterioration, stale fast-paths, override streaks. */
export function AlertPanel({ rows }: { rows: PortfolioRow[] }) {
  const groups: Group[] = [
    {
      key: "hidden",
      label: "Hidden risks",
      icon: AlertTriangle,
      tone: "text-destructive",
      rows: rows
        .filter((r) => r.latestSubmission?.hidden_risk)
        .map((r) => ({
          row: r,
          detail: r.latestSubmission?.hidden_risk_reason ?? "Green overall but low confidence.",
        })),
    },
    {
      key: "deteriorating",
      label: "Deteriorating trajectories",
      icon: TrendingDown,
      tone: "text-destructive",
      rows: rows
        .filter((r) => r.trajectory === "deteriorating")
        .map((r) => ({ row: r, detail: `Latest agent output for ${r.latestOutput?.cycle_id ?? "—"}` })),
    },
    {
      key: "stale",
      label: "Stale fast-path (3+ cycles)",
      icon: Repeat,
      tone: "text-warning",
      rows: rows
        .filter((r) => r.fastPathStreak >= 3)
        .map((r) => ({
          row: r,
          detail: `No detailed review in ${r.fastPathStreak} cycles`,
        })),
    },
    {
      key: "overrides",
      label: "Overridden-flag streaks",
      icon: Strikethrough,
      tone: "text-warning",
      rows: rows
        .filter((r) => r.overrideStreak >= 2)
        .map((r) => ({
          row: r,
          detail: `${r.overrideStreak} consecutive agent outputs overridden`,
        })),
    },
  ].filter((g) => g.rows.length > 0);

  if (groups.length === 0) {
    return (
      <div className="surface-card mb-6 p-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Nothing needs attention.</span> No hidden
        risks, deteriorating trajectories, stale fast-paths or override streaks in this portfolio.
      </div>
    );
  }

  return (
    <div className="surface-card mb-6 p-5">
      <h2 className="text-sm font-semibold">Needs attention</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key}>
            <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${group.tone}`}>
              <group.icon className="size-3.5" />
              {group.label} · {group.rows.length}
            </p>
            <ul className="mt-2 space-y-1.5">
              {group.rows.map(({ row, detail }) => (
                <li key={row.client.id} className="text-sm">
                  <Link
                    to="/clients/$id"
                    params={{ id: row.client.id }}
                    className="font-medium hover:underline"
                  >
                    {row.client.name}
                  </Link>
                  <span className="text-muted-foreground"> — {detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
