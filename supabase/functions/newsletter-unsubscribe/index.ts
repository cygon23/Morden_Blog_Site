import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const allowedOrigins = [
  "https://morden-blog-site.vercel.app",
  "http://localhost:8080",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.join(","),
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Mark subscriber as unsubscribed
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed: true })
      .eq("email", email);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "You have been unsubscribed" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
