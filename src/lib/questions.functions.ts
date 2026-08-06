import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  buildUserPrompt,
  callModel,
  loadContext,
  parseAgentJson,
  persistValidation,
  questionCount,
  SYSTEM_PROMPT,
} from "@/lib/generate-questions.server";

export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ submission_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient(
      process.env["SUPABASE_URL"] ?? "",
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
    );
    const apiKey = process.env["ANTHROPIC_API_KEY"] ?? "";
    if (!apiKey) {
      console.error("[generate-questions] ANTHROPIC_API_KEY not set");
      return { error: "parse_failed" as const };
    }
    const { client, submission, previous, previousQa } = await loadContext(supabase, data.submission_id);
    const n = questionCount(typeof submission["overall_rag"] === "string" ? submission["overall_rag"] : null);
    let raw: string;
    try {
      raw = await callModel(SYSTEM_PROMPT(n), buildUserPrompt({ client, submission, previous, previousQa, n }), apiKey);
    } catch (error) {
      console.error("[generate-questions] model call failed", error);
      return { error: "parse_failed" as const };
    }
    const result = parseAgentJson(raw);
    if (!result) return { error: "parse_failed" as const };
    try {
      await persistValidation(supabase, data.submission_id, result);
    } catch (error) {
      console.error("[generate-questions] could not store validation flags", error);
    }
    return {
      questions: result.questions,
      validation_flags: result.validation_flags,
      hidden_risk: result.hidden_risk,
      hidden_risk_reason: result.hidden_risk_reason,
    };
  });
