import { supabase } from "@/integrations/supabase/client";

export const generateQuestions = async (args: { data: { submission_id: string } }) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  
  const res = await fetch(
    "https://vldvvfgzsseqswaligwf.supabase.co/functions/v1/generate-questions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": "sb_publishable_ARkcAqFMYniaP1QgpGOj6w_3-Ek0O-D",
      },
      body: JSON.stringify({ submission_id: args.data.submission_id }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};
