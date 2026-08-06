import { supabase } from "@/integrations/supabase/client";

// Calls Supabase Edge Function directly from client — keys live in Vault, never in code
export const analyzeSubmission = async (args: { data: { submission_id: string } }) => {
  const { data, error } = await supabase.functions.invoke("batch-analysis", {
    body: { submission_id: args.data.submission_id },
  });
  if (error) throw error;
  return data;
};
