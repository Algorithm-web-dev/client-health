import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildBatchUserPrompt,
  callBatchModelWithRetry,
  loadBatchContext,
} from "@/lib/batch-analysis.server";

/**
 * Phase 3 batch agent — analyses ONE submitted submission.
 * The /cycles page calls this sequentially per client so it can show live progress;
 * a single failure marks that agent_output "failed" and never stops the batch.
 */
export const analyzeSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ submission_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isDirector } = await supabase.rpc("current_role_is", {
      _roles: ["director", "admin"],
    });
    if (!isDirector) throw new Error("Forbidden");
    void userId;

    const ctx = await loadBatchContext(supabase, data.submission_id);
    const submission = ctx.submission as { client_id: string; cycle_id: string };

    // One agent_outputs row per submission — start it as pending.
    const { data: output, error: outputError } = await supabase
      .from("agent_outputs")
      .insert({
        submission_id: data.submission_id,
        client_id: submission.client_id,
        cycle_id: submission.cycle_id,
        type: "batch",
        status: "pending",
      })
      .select("id")
      .single();
    if (outputError) throw outputError;

    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      await supabase.from("agent_outputs").update({ status: "failed" }).eq("id", output.id);
      return { ok: false as const, reason: "missing_api_key" };
    }

    let result;
    try {
      result = await callBatchModelWithRetry(buildBatchUserPrompt(ctx), apiKey);
    } catch (error) {
      console.error("batch-analysis failed for submission", data.submission_id, error);
      await supabase.from("agent_outputs").update({ status: "failed" }).eq("id", output.id);
      return { ok: false as const, reason: "agent_failed" };
    }

    const { error: updateError } = await supabase
      .from("agent_outputs")
      .update({
        status: "complete",
        insight_narrative: result.insight_narrative,
        trajectory_flag: result.trajectory_flag,
        upsell_window: result.upsell_window,
        recommended_actions: result.recommended_actions,
      })
      .eq("id", output.id);
    if (updateError) throw updateError;

    const { error: deltaError } = await supabase.from("agent_deltas").insert({
      agent_output_id: output.id,
      client_id: submission.client_id,
      cycle_id: submission.cycle_id,
      risk_before: result.delta.risk_before,
      risk_after: result.delta.risk_after,
      new_flags: result.delta.new_flags,
      resolved_flags: result.delta.resolved_flags,
      summary: result.delta.summary,
    });
    if (deltaError) console.error("batch-analysis could not store delta", deltaError);

    if (result.memory_summary.trim() !== "") {
      // clients is admin-writable only; the caller is already verified as director/admin.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: memoryError } = await supabaseAdmin
        .from("clients")
        .update({ memory_summary: result.memory_summary })
        .eq("id", submission.client_id);
      if (memoryError) console.error("batch-analysis could not store memory", memoryError);
    }

    return {
      ok: true as const,
      agent_output_id: output.id,
      trajectory: result.trajectory_flag.direction,
    };
  });
