/**
 * activate-subscription Edge Function
 * 
 * Called from the client after a successful Google Play purchase.
 * Uses service_role to UPSERT the subscriptions table.
 * Supports anonymous users (no login system).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify JWT — supports anonymous auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth failed:", authError?.message);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { purchaseToken, productId, orderId } = body;

    // Validate required fields
    if (!purchaseToken || !productId) {
      return jsonResponse({ error: "Missing purchaseToken or productId" }, 400);
    }

    if (!["premium_monthly", "premium_yearly"].includes(productId)) {
      return jsonResponse({ error: "Invalid productId" }, 400);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const subType = productId === "premium_yearly" ? "yearly" : "monthly";
    const now = new Date();
    const endDate = new Date(now);
    if (subType === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Check for existing subscription for this user
    const { data: existing } = await serviceClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update existing subscription
      const { error: updateError } = await serviceClient
        .from("subscriptions")
        .update({
          status: "active",
          subscription_type: subType,
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          google_play_token: purchaseToken,
          google_play_order_id: orderId || null,
          updated_at: now.toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Update failed:", updateError.message);
        return jsonResponse({ error: "Update failed" }, 500);
      }
    } else {
      // Create new subscription for this anonymous user
      const { error: insertError } = await serviceClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          status: "active",
          subscription_type: subType,
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          google_play_token: purchaseToken,
          google_play_order_id: orderId || null,
        });

      if (insertError) {
        // Handle unique constraint — try update as fallback
        if (insertError.code === "23505") {
          console.log("Insert conflict — falling back to update for user:", user.id);
          const { error: fallbackErr } = await serviceClient
            .from("subscriptions")
            .update({
              status: "active",
              subscription_type: subType,
              subscription_start: now.toISOString(),
              subscription_end: endDate.toISOString(),
              google_play_token: purchaseToken,
              google_play_order_id: orderId || null,
              updated_at: now.toISOString(),
            })
            .eq("user_id", user.id);

          if (fallbackErr) {
            console.error("Fallback update failed:", fallbackErr.message);
            return jsonResponse({ error: "Activation failed" }, 500);
          }
        } else {
          console.error("Insert failed:", insertError.message);
          return jsonResponse({ error: "Insert failed" }, 500);
        }
      }
    }

    console.log(`✅ Subscription activated: user=${user.id}, type=${subType}, product=${productId}`);
    return jsonResponse({ ok: true, type: subType });
  } catch (err) {
    console.error("Activation error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
