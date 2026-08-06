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
      "https://vldvvfgzsseqswaligwf.supabase.co",
      "sb_secret_SMzo7sI-WVNu6CdsbLY-UA_8xb9cIcx",
    );
    const apiKey = "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";
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




