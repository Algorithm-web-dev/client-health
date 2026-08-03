import type { Rag, TrajectoryDirection } from "@/lib/db";
import { cn } from "@/lib/utils";

const RAG_CLASS: Record<Rag, string> = {
  Green: "bg-success/10 text-success ring-success/20",
  Amber: "bg-warning/10 text-warning ring-warning/20",
  Red: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function RagPill({ status, className }: { status: Rag | null; className?: string }) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border",
          className,
        )}
      >
        No score
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        RAG_CLASS[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function TrajectoryLabel({ direction }: { direction: TrajectoryDirection | null }) {
  if (!direction) return null;
  return (
    <span
      className={cn(
        "text-xs font-medium capitalize",
        direction === "deteriorating"
          ? "text-destructive"
          : direction === "improving"
            ? "text-success"
            : "text-muted-foreground",
      )}
    >
      {direction}
    </span>
  );
}
