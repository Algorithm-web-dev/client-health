import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  importSeed,
  parseSeedFile,
  SEED_CYCLE_ID,
  type ImportSummary,
} from "@/lib/seed-import";

export const Route = createFileRoute("/_authenticated/admin/import")({
  beforeLoad: ({ context }) => {
    if (context.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Seed import — Client Health" },
      {
        name: "description",
        content: "Admin-only import of the baseline client and submission seed file.",
      },
      { property: "og:title", content: "Seed import — Client Health" },
      {
        property: "og:description",
        content: "Admin-only import of the baseline client and submission seed file.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminImportPage,
});

function AdminImportPage() {
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const run = useMutation({
    mutationFn: async () => importSeed(parseSeedFile(raw)),
    onSuccess: (result) => {
      setSummary(result);
      toast.success("Seed import complete");
      void queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setSummary(null);
    setRaw(await file.text());
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Seed import"
        description={`Loads baseline clients and submissions into cycle ${SEED_CYCLE_ID}. Safe to re-run — clients are matched on name and updated in place.`}
      />

      <div className="surface-card space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="seed-file">Seed JSON file</Label>
          <input
            id="seed-file"
            type="file"
            accept="application/json,.json"
            onChange={(e) => void handleFile(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <p className="text-xs text-muted-foreground">
            Expected shape: {"{"} "clients": [...], "seed_submissions": [...] {"}"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seed-json">Or paste the JSON</Label>
          <Textarea
            id="seed-json"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setSummary(null);
            }}
            rows={10}
            className="font-mono text-xs"
            placeholder='{ "clients": [], "seed_submissions": [] }'
          />
          {fileName ? (
            <p className="text-xs text-muted-foreground">Loaded from {fileName}</p>
          ) : null}
        </div>

        <Button onClick={() => run.mutate()} disabled={!raw.trim() || run.isPending}>
          {run.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Run import
        </Button>
      </div>

      {summary ? (
        <div className="surface-card mt-5 p-5">
          <h2 className="text-sm font-semibold">Import result</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <Stat label="Clients created" value={summary.clientsCreated} />
            <Stat label="Clients updated" value={summary.clientsUpdated} />
            <Stat label="Submissions created" value={summary.submissionsCreated} />
            <Stat label="Submissions updated" value={summary.submissionsUpdated} />
          </dl>
          {summary.skipped.length > 0 ? (
            <p className="mt-4 text-sm text-warning">
              Skipped {summary.skipped.length} submission(s) with no matching client:{" "}
              {summary.skipped.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
