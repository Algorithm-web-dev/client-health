import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildUserPrompt,
  callModel,
  loadContext,
  parseAgentJson,
  persistValidation,
  questionCount,
  SYSTEM_PROMPT,
} from "@/lib/generate-questions.server";

/** Phase 2: agent reads a submission and returns follow-up questions + validation flags. */
export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ submission_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // TanStack Start / Nitro: try both process.env and import.meta.env
    const apiKey =
      process.env["ANTHROPIC_API_KEY"] ??
      (import.meta.env as Record<string, string | undefined>)["ANTHROPIC_API_KEY"] ??
      (import.meta.env as Record<string, string | undefined>)["VITE_ANTHROPIC_API_KEY"];

    if (!apiKey) {
      console.error("generate-questions: ANTHROPIC_API_KEY not found in environment");
      return { error: "parse_failed" as const };
    }

    const { client, submission, previous, previousQa } = await loadContext(
      context.supabase,
      data.submission_id,
    );

    const n = questionCount(
      typeof submission["overall_rag"] === "string" ? submission["overall_rag"] : null,
    );

    let raw: string;
    try {
      raw = await callModel(
        SYSTEM_PROMPT(n),
        buildUserPrompt({ client, submission, previous, previousQa, n }),
        apiKey,
      );
    } catch (error) {
      console.error("generate-questions model call failed", error);
      return { error: "parse_failed" as const };
    }

    const result = parseAgentJson(raw);
    if (!result) return { error: "parse_failed" as const };

    try {
      await persistValidation(context.supabase, data.submission_id, result);
    } catch (error) {
      console.error("generate-questions could not store validation flags", error);
    }

    return {
      questions: result.questions,
      validation_flags: result.validation_flags,
      hidden_risk: result.hidden_risk,
      hidden_risk_reason: result.hidden_risk_reason,
    };
  });