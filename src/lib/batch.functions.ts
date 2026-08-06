import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Calls the Supabase Edge Function — keys live in Supabase Vault
export const analyzeSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ submission_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: result, error } = await supabase.functions.invoke("batch-analysis", {
      body: { submission_id: data.submission_id },
    });
    if (error) throw error;
    return result;
  });
