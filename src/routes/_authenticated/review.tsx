import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FlagList, RiskArrow, UrgencyBadge } from "@/components/review/ReviewBits";
import { useProfile } from "@/hooks/useProfile";
import {
  acceptAction,
  dismissAction,
  fetchReviewQueue,
  parseFlags,
  parseTrajectory,
  parseUpsell,
  saveDecision,
  type ReviewItem,
} from "@/lib/review";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Agent review queue — Client Health" },
      {
        name: "description",
        content: "Confirm or override the agent's analysis for each client after a cycle closes.",
      },
      { property: "og:title", content: "Agent review queue — Client Health" },
      {
        property: "og:description",
        content: "Confirm or override the agent's analysis for each client after a cycle closes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { profile, role, isLoading: profileLoading } = useProfile();
  const identifiers = useMemo(
    () => [profile?.full_name ?? "", profile?.email ?? ""].filter(Boolean),
    [profile],
  );
  const seeAll = role === "admin" || role === "director";

  const { data, isLoading, error } = useQuery({
    queryKey: ["review-queue", identifiers.join("|"), seeAll],
    enabled: !profileLoading && Boolean(profile),
    queryFn: () => fetchReviewQueue(identifiers, seeAll),
  });

  const items = data ?? [];
  const pending = items.filter((i) => !i.review).length;

  return (
    <div>
      <PageHeader
        title="Review"
        description="Agent output per client, with your confirmation or override."
        actions={
          <span className="text-sm text-muted-foreground">
            {pending} awaiting decision · {items.length} total
          </span>
        }
      />

      {error ? (
        <div className="surface-card p-6 text-sm text-destructive" role="alert">
          Could not load the review queue: {(error as Error).message}
        </div>
      ) : isLoading || profileLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No agent output to review yet"
          hint="Items appear here once a cycle closes and the batch analysis has run."
        />
      ) : (
        <div className="space-y-8">
          {items.map((item) => (
            <ReviewCard key={item.output.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const queryClient = useQueryClient();
  const { profile, role } = useProfile();
  const readOnly = role === "director";
  const [mode, setMode] = useState<"none" | "override">("none");
  const [reason, setReason] = useState("");

  const trajectory = parseTrajectory(item.output.trajectory_flag);
  const upsell = parseUpsell(item.output.upsell_window);
  const newFlags = parseFlags(item.delta?.new_flags);
  const resolvedFlags = parseFlags(item.delta?.resolved_flags);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["review-queue"] });
    void queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const decide = useMutation({
    mutationFn: (decision: "confirm" | "override") =>
      saveDecision({
        agentOutputId: item.output.id,
        decision,
        overrideReason: reason,
        reviewedBy: profile!.id,
      }),
    onSuccess: (_d, decision) => {
      toast.success(decision === "confirm" ? "Analysis confirmed" : "Override recorded");
      setMode("none");
      setReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            <Link to="/clients/$id" params={{ id: item.client.id }} className="hover:underline">
              {item.client.name}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground">
            {item.output.cycle_id} · {item.client.tier ? `Tier ${item.client.tier}` : "No tier"}
          </p>
        </div>
        {item.review ? (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
            {item.review.decision === "override" ? "Overridden" : "Confirmed"}
          </span>
        ) : null}
      </header>

      {/* 1. What your answers changed */}
      <div className="surface-card border-l-4 border-l-primary p-5">
        <h3 className="text-sm font-semibold">What your answers changed</h3>
        <div className="mt-3">
          <RiskArrow before={item.delta?.risk_before ?? null} after={item.delta?.risk_after ?? null} />
        </div>
        {item.delta?.summary ? (
          <p className="mt-3 text-sm leading-relaxed text-foreground">{item.delta.summary}</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No delta recorded for this cycle.</p>
        )}
        <FlagList flags={newFlags} tone="new" />
        <FlagList flags={resolvedFlags} tone="resolved" />
      </div>

      {/* 2. Insight narrative */}
      <div className="surface-card p-5">
        <h3 className="text-sm font-semibold">Insight</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
          {item.output.insight_narrative ?? "No narrative returned."}
        </p>
      </div>

      {/* 3. Trajectory + upsell */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Trajectory</h3>
          <p className="mt-2 text-sm font-medium capitalize">{trajectory?.direction ?? "Unknown"}</p>
          {trajectory?.categories.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {trajectory.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          {trajectory?.note ? (
            <p className="mt-3 text-sm text-muted-foreground">{trajectory.note}</p>
          ) : null}
        </div>
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Upsell window</h3>
          <p className="mt-2 text-sm font-medium">{upsell?.open ? "Open" : "Closed"}</p>
          {upsell?.suggested_service ? (
            <p className="mt-1 text-sm">Suggested: {upsell.suggested_service}</p>
          ) : null}
          {upsell?.rationale ? (
            <p className="mt-3 text-sm text-muted-foreground">{upsell.rationale}</p>
          ) : null}
        </div>
      </div>

      {/* 4 + 6. Recommended actions */}
      <div className="surface-card p-5">
        <h3 className="text-sm font-semibold">Recommended actions</h3>
        {item.recommended.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No actions recommended.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {item.recommended.map((rec) => (
                <ActionRow
                key={rec.action}
                item={item}
                rec={rec}
                onDone={invalidate}
                readOnly={readOnly}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 5. Decision */}
      <div className="surface-card p-5">
        <h3 className="text-sm font-semibold">Your decision</h3>
        {item.review ? (
          <div className="mt-2 text-sm">
            <p className="font-medium capitalize">{item.review.decision}</p>
            {item.review.override_reason ? (
              <p className="mt-1 text-muted-foreground">{item.review.override_reason}</p>
            ) : null}
          </div>
        ) : readOnly ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Awaiting the CI lead's decision. Directors have read-only access.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => decide.mutate("confirm")}
                disabled={decide.isPending}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode(mode === "override" ? "none" : "override")}
                disabled={decide.isPending}
              >
                Override
              </Button>
            </div>
            {mode === "override" ? (
              <div className="space-y-2">
                <label htmlFor={`reason-${item.output.id}`} className="text-sm font-medium">
                  Why are you overriding the agent? (min 20 characters)
                </label>
                <Textarea
                  id={`reason-${item.output.id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Explain what the agent got wrong and what you know that it doesn't."
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant="destructive"
                    disabled={reason.trim().length < 20 || decide.isPending}
                    onClick={() => decide.mutate("override")}
                  >
                    Save override
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {reason.trim().length}/20 characters
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The agent's flag is never deleted — it stays visible with strikethrough alongside
                  your reason.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function ActionRow({
  item,
  rec,
  onDone,
  readOnly,
}: {
  item: ReviewItem;
  rec: { action: string; owner: string | null; urgency: string | null };
  onDone: () => void;
  readOnly: boolean;
}) {
  const existing = item.actions.find((a) => a.description === rec.action);
  const [owner, setOwner] = useState(rec.owner ?? item.client.ci_leads?.[0] ?? "");
  const [deadline, setDeadline] = useState("");

  const accept = useMutation({
    mutationFn: () =>
      acceptAction({
        clientId: item.client.id,
        cycleId: item.output.cycle_id,
        description: rec.action,
        owner: owner.trim() || null,
        deadline: deadline || null,
      }),
    onSuccess: () => {
      toast.success("Added to the action log");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dismiss = useMutation({
    mutationFn: () =>
      dismissAction({
        clientId: item.client.id,
        cycleId: item.output.cycle_id,
        description: rec.action,
      }),
    onSuccess: () => {
      toast.success("Action dismissed");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm">{rec.action}</p>
        <UrgencyBadge urgency={rec.urgency} />
      </div>
      {existing ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {existing.status === "dismissed"
            ? "Dismissed"
            : `Accepted — owner ${existing.owner ?? "unassigned"}${existing.deadline ? `, due ${existing.deadline}` : ""}`}
        </p>
      ) : readOnly ? (
        <p className="mt-2 text-xs text-muted-foreground">Not yet actioned</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner"
            aria-label="Action owner"
            className="h-9 w-40"
          />
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            aria-label="Action deadline"
            className="h-9 w-40"
          />
          <Button size="sm" onClick={() => accept.mutate()} disabled={accept.isPending}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dismiss.mutate()}
            disabled={dismiss.isPending}
          >
            Dismiss
          </Button>
        </div>
      )}
    </li>
  );
}
