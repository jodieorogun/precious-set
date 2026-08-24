import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const encoder = new TextEncoder();
async function hashToken(token: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token)); return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { action, token, paths = [], path } = await request.json();
    if (!token) throw new Error("Missing booking token.");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tokenHash = await hashToken(token);
    const { data: booking, error: bookingError } = await admin.from("bookings").select("id, status, inspoImageUrls, inspoImageUrl").or(`manageTokenHash.eq.${tokenHash},manageTokenHashes.cs.{${tokenHash}}`).maybeSingle();
    if (bookingError || !booking) throw new Error("This booking link is invalid or has expired.");
    const imagePaths = Array.from(new Set([...(booking.inspoImageUrls ?? []), ...(booking.inspoImageUrl ? [booking.inspoImageUrl] : [])])).slice(0, 3);
    if (action === "remove") {
      if (!imagePaths.includes(path)) throw new Error("That image is not attached to this booking.");
      const next = imagePaths.filter((item) => item !== path);
      const { error } = await admin.from("bookings").update({ inspoImageUrls: next, inspoImageUrl: next[0] ?? null }).eq("id", booking.id);
      if (error) throw error;
      await admin.storage.from("booking-inspo").remove([path]);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const requestedPaths = paths.filter((item: string) => imagePaths.includes(item));
    const signed = await Promise.all(requestedPaths.map(async (item: string) => { const { data, error } = await admin.storage.from("booking-inspo").createSignedUrl(item, 3600); return error || !data ? null : { path: item, url: data.signedUrl }; }));
    return new Response(JSON.stringify({ images: signed.filter(Boolean) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
