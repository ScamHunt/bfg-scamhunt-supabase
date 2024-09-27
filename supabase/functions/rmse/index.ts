// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { RmseResponse } from "./rmse.ts";

Deno.serve(async (req) => {
  const body = await req.json();
  const { url, from_db } = body;

  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  if (from_db) {
    const { data, error } = await supabase
      .from("processed_link")
      .select("*")
      .eq("is_processed", false)
      .limit(10);
    if (error) {
      console.error(error);
      return getResponse({ error: error.message });
    }
    const updatedData = [];
    for (const elem of data) {
      console.log("Processing: ", elem.url);
      try {
        const response = await fetchRmseResponse(elem.url);
        await new Promise((r) => setTimeout(r, 1000));

        const redirects = response.data?.map((item) => item.url) ?? [];
        const scores = response.data?.[0].webrisk_evaluation.scores ?? [];

        updatedData.push({
          id: elem.id,
          url: elem.url,
          is_processed: true,
          processed_at: new Date().toISOString(),
          redirects: redirects,
          risk_scores: scores,
          report_id: elem.report_id,
        });
      } catch (e) {
        console.error(e);
        console.log("Failed to process: ", elem.url);
      }
    }

    if (updatedData.length > 0) {
      const { error } = await supabase
        .from("processed_link")
        .upsert(updatedData);
      if (error) {
        console.error(error);
        return getResponse({ error: error.message });
      }
    }

    return getResponse({ success: true });
  } else if (url) {
    try {
      const response = await fetchRmseResponse(url);
      return getResponse(response);
    } catch (error) {
      console.error(error);
      return getResponse({ error: error.message });
    }
  }
  return getResponse({ error: "Malformed request" });
});

const getResponse = (data: object) =>
  new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );

const fetchRmseResponse = async (url: string): Promise<RmseResponse> => {
  const rmseKey = Deno.env.get("RMSE_API_KEY")!;
  const res = await fetch("https://api.stg.rmse.gasp.gov.sg/evaluate", {
    method: "POST",
    headers: {
      "x-api-key": rmseKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ url: url, source: "kaz" }),
  });
  if (res.status !== 400) {
    throw new Error(
      `Failed to fetch data with code ${res.status}: ${res.statusText}`,
    );
  }
  const data: RmseResponse = await res.json();
  return data;
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54407/functions/v1/rmse' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
