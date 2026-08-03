import { cn } from "@/lib/utils";

const URGENCY_CLASS: Record<string, string> = {
  this_week: "bg-destructive/10 text-destructive ring-destructive/20",
  this_cycle: "bg-warning/10 text-warning ring-warning/20",
  next_cycle: "bg-muted text-muted-foreground ring-border",
};

const URGENCY_LABEL: Record<string, string> = {
  this_week: "This week",
  this_cycle: "This cycle",
  next_cycle: "Next cycle",
};

export function UrgencyBadge({ urgency }: { urgency: string | null }) {
  const key = urgency ?? "next_cycle";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        URGENCY_CLASS[key] ?? URGENCY_CLASS["next_cycle"],
      )}
    >
      {URGENCY_LABEL[key] ?? key}
    </span>
  );
}

const RISK_CLASS: Record<string, string> = {
  Low: "text-success",
  Medium: "text-warning",
  High: "text-destructive",
  Critical: "text-destructive",
};

const RISK_ORDER: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

export function RiskArrow({ before, after }: { before: string | null; after: string | null }) {
  const b = RISK_ORDER[before ?? ""] ?? null;
  const a = RISK_ORDER[after ?? ""] ?? null;
  const worse = b !== null && a !== null && a > b;
  const better = b !== null && a !== null && a < b;
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold">
      <span className={cn(RISK_CLASS[before ?? ""] ?? "text-muted-foreground")}>
        {before ?? "—"}
      </span>
      <span
        aria-hidden
        className={cn(
          worse ? "text-destructive" : better ? "text-success" : "text-muted-foreground",
        )}
      >
        {worse ? "↑" : better ? "↓" : "→"}
      </span>
      <span className={cn(RISK_CLASS[after ?? ""] ?? "text-muted-foreground")}>{after ?? "—"}</span>
    </span>
  );
}

export function FlagList({ flags, tone }: { flags: string[]; tone: "new" | "resolved" }) {
  if (flags.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1">
      {flags.map((flag) => (
        <li
          key={flag}
          className={cn(
            "text-sm",
            tone === "new" ? "text-destructive" : "text-success",
          )}
        >
          {tone === "new" ? "▲" : "✓"} {flag}
        </li>
      ))}
    </ul>
  );
}

/** An override never removes the agent's flag — it strikes it through and shows the CI's reason. */
export function OverrideAnnotation({
  flag,
  reason,
  className,
}: {
  flag: string;
  reason: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span className="text-xs font-medium text-muted-foreground line-through">{flag}</span>
      {reason ? (
        <span className="text-xs text-primary">CI override: {reason}</span>
      ) : (
        <span className="text-xs text-primary">CI override</span>
      )}
    </span>
  );
}
