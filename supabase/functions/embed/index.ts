// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import {createClient} from "npm:@supabase/functions-js/edge-runtime.d.ts";

console.log("Hello from Functions!");

// createClient()

// Deno.serve(async (req) => {
  // const openAikey = Deno.env.get("OPENAI_API_KEY");
  // const { query } = await req.json();
  // const response = await fetch("https://api.openai.com/v1/embeddings", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${openAikey}`,
  //   },
  //   body: JSON.stringify({
  //     input: query,
  //     text: "text-embedding-ada-002",
  //   }),
  // });
  // const responseData = await response.json();
  // const embedding = responseData.data[0].embedding;
  
  // return new Response(
  //   JSON.stringify(data),
  //   { headers: { "Content-Type": "application/json" } },
  // );
// });

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/embed' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'

*/
