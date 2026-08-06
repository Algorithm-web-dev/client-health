import { supabase } from "@/integrations/supabase/client";

// Calls the Supabase Edge Function instead of a TanStack server function
// Keys live in Supabase Vault — never in code or GitHub
export const generateQuestions = async (args: { data: { submission_id: string } }) => {
  const { data, error } = await supabase.functions.invoke("generate-questions", {
    body: { submission_id: args.data.submission_id },
  });
  if (error) throw error;
  return data;
};
