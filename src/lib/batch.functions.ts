export const analyzeSubmission = async (args: { data: { submission_id: string } }) => {
  try {
    const res = await fetch(
      "https://vldvvfgzsseqswaligwf.supabase.co/functions/v1/batch-analysis",
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
    console.log("[batch-analysis] HTTP status:", res.status);
    const data = await res.json();
    console.log("[batch-analysis] response:", JSON.stringify(data));
    if (data.error || !data.ok) throw new Error(data.reason ?? "agent_failed");
    return data;
  } catch (err) {
    console.error("[batch-analysis] fetch error:", String(err));
    throw err;
  }
};
