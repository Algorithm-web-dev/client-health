export const generateQuestions = async (args: { data: { submission_id: string } }) => {
  try {
    const res = await fetch(
      "https://vldvvfgzsseqswaligwf.supabase.co/functions/v1/generate-questions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sb_publishable_ARkcAqFMYniaP1QgpGOj6w_3-Ek0O-D",
          "apikey": "sb_publishable_ARkcAqFMYniaP1QgpGOj6w_3-Ek0O-D",
        },
        body: JSON.stringify({ submission_id: args.data.submission_id }),
      }
    );
    console.log("[generate-questions] HTTP status:", res.status);
    const data = await res.json();
    console.log("[generate-questions] response data:", JSON.stringify(data));
    if (data.error) return { error: "parse_failed" };
    return data;
  } catch (err) {
    console.error("[generate-questions] fetch error:", String(err));
    return { error: "parse_failed" };
  }
};
