// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

Deno.serve(async (req) => {
  const body = await req.json();
  const url = body["url"];
  const fromDb = body["from_db"];

  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  if (fromDb) {
    const { data } = await supabase
      .from("process_link")
      .select("url")
      .eq("is_processed", false);
    data?.map(async (url) => {
    });
  }

  if (!url) {
    return new Response(
      JSON.stringify({ error: "URL is required" }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const response = await fetchRmseResponse(url);
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch data" }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  processRmseResponse(response);
  return new Response(
    rmseResponse,
    { headers: { "Content-Type": "application/json" } },
  );
});

const processRmseResponse = async (response: Response) => {
  const res = await response.json();
  res.data;
};

const fetchRmseResponse = async (url: string): Promise<Response> => {
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
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54407/functions/v1/rmse' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
