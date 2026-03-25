/**
 * activate-subscription Edge Function
 * 
 * Called from the client after a successful Google Play purchase.
 * Uses service_role to update the subscriptions table (RLS restricts UPDATE to service_role).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify JWT — ensure the caller is authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller's identity
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { subscriptionId, userId, purchaseToken, productId, orderId } = body;

    // Validate required fields
    if (!purchaseToken || !productId) {
      return new Response(JSON.stringify({ error: "Missing purchaseToken or productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate productId
    if (!["premium_monthly", "premium_yearly"].includes(productId)) {
      return new Response(JSON.stringify({ error: "Invalid productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    if (subscriptionId) {
      // Verify the subscription belongs to this user
      const { data: sub } = await serviceClient
        .from("subscriptions")
        .select("user_id")
        .eq("id", subscriptionId)
        .single();

      if (!sub || sub.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Subscription not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
        .eq("id", subscriptionId);

      if (updateError) {
        console.error("Update failed:", updateError.message);
        return new Response(JSON.stringify({ error: "Update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new subscription — use the authenticated user's ID
      const targetUserId = user.id;
      const { error: insertError } = await serviceClient
        .from("subscriptions")
        .insert({
          user_id: targetUserId,
          status: "active",
          subscription_type: subType,
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          google_play_token: purchaseToken,
          google_play_order_id: orderId || null,
        });

      if (insertError) {
        console.error("Insert failed:", insertError.message);
        return new Response(JSON.stringify({ error: "Insert failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, type: subType }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Activation error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
