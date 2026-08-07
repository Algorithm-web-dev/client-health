import { supabase } from "@/integrations/supabase/client";

export const generateQuestions = async (args: { data: { submission_id: string } }) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token ?? "";

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

    if (!res.ok) {
      const errText = await res.text();
      console.error("[generate-questions] HTTP error:", res.status, errText);
      return { error: "parse_failed" };
    }

    const data = await res.json();
    console.log("[generate-questions] response:", data);
    if (data.error) return { error: "parse_failed" };
    return data;
  } catch (err) {
    console.error("[generate-questions] fetch failed:", err);
    return { error: "parse_failed" };
  }
};
