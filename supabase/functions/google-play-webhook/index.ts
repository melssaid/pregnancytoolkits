/**
 * Google Play Billing Webhook (RTDN)
 * Receives Real-Time Developer Notifications from Google Cloud Pub/Sub
 * and updates subscriptions + logs every event for auditing.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const NOTIFICATION_TYPES: Record<number, string> = {
  1: "SUBSCRIPTION_RECOVERED",
  2: "SUBSCRIPTION_RENEWED",
  3: "SUBSCRIPTION_CANCELED",
  4: "SUBSCRIPTION_PURCHASED",
  5: "SUBSCRIPTION_ON_HOLD",
  6: "SUBSCRIPTION_IN_GRACE_PERIOD",
  7: "SUBSCRIPTION_RESTARTED",
  8: "SUBSCRIPTION_PRICE_CHANGE_CONFIRMED",
  9: "SUBSCRIPTION_DEFERRED",
  10: "SUBSCRIPTION_PAUSED",
  11: "SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED",
  12: "SUBSCRIPTION_REVOKED",
  13: "SUBSCRIPTION_EXPIRED",
};

// Active statuses that grant premium access
const ACTIVE_STATUSES = new Set([1, 2, 4, 7]); // recovered, renewed, purchased, restarted
// Statuses that revoke premium access
const INACTIVE_STATUSES = new Set([12, 13]); // revoked, expired
// Statuses that put subscription on hold
const HOLD_STATUSES = new Set([5, 6, 10]); // on_hold, grace_period, paused

function getSupabaseClient(): any {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function calcEndDate(from: Date, type: string): string {
  const end = new Date(from);
  if (type === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end.toISOString();
}

async function logWebhookEvent(
  supabase: any,
  eventType: string,
  notificationType: string | null,
  purchaseToken: string | null,
  subscriptionId: string | null,
  rawPayload: unknown,
  status: string,
  errorMessage: string | null = null
) {
  try {
    await supabase.from("webhook_logs").insert({
      event_type: eventType,
      notification_type: notificationType,
      purchase_token: purchaseToken?.substring(0, 50) || null,
      subscription_id: subscriptionId,
      raw_payload: rawPayload,
      processing_status: status,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("Failed to log webhook event:", e);
  }
}

async function handleSubscriptionNotification(
  supabase: any,
  notificationType: number,
  purchaseToken: string,
  subscriptionId: string,
  notification: Record<string, unknown>
) {
  const typeName = NOTIFICATION_TYPES[notificationType] || `UNKNOWN_${notificationType}`;
  const now = new Date().toISOString();
  const subType = subscriptionId === "premium_yearly" ? "yearly" : "monthly";

  // Find subscription by google_play_token
  const { data: existingSub, error: findError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("google_play_token", purchaseToken)
    .maybeSingle();

  if (findError) {
    console.error("Error finding subscription:", findError.message);
    return { success: false, error: findError.message };
  }

  if (!existingSub && notificationType !== 4) {
    console.warn(`No subscription found for token. Type: ${typeName}`);
    return { success: false, error: "Subscription not found" };
  }

  // PURCHASED
  if (notificationType === 4) {
    if (existingSub) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          subscription_type: subType,
          subscription_start: now,
          subscription_end: calcEndDate(new Date(), subType),
          google_play_order_id: (notification as Record<string, string>).orderId || null,
          updated_at: now,
        })
        .eq("id", existingSub.id);

      if (error) return { success: false, error: error.message };
      console.log(`Activated subscription ${existingSub.id} — ${subType}`);
    } else {
      console.warn("No subscription record with this purchaseToken for PURCHASED event.");
      return { success: false, error: "No matching subscription record" };
    }
  }

  // RENEWED / RECOVERED / RESTARTED
  else if (ACTIVE_STATUSES.has(notificationType) && existingSub) {
    const baseDate = existingSub.subscription_end
      ? new Date(existingSub.subscription_end)
      : new Date();
    const newEnd = calcEndDate(baseDate, existingSub.subscription_type === "yearly" ? "yearly" : "monthly");

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "active", subscription_end: newEnd, updated_at: now })
      .eq("id", existingSub.id);

    if (error) return { success: false, error: error.message };
    console.log(`Renewed ${existingSub.id} until ${newEnd}`);
  }

  // CANCELED (user chose not to renew — stays active until period ends)
  else if (notificationType === 3 && existingSub) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: now })
      .eq("id", existingSub.id);

    if (error) return { success: false, error: error.message };
    console.log(`Canceled ${existingSub.id} — active until ${existingSub.subscription_end}`);
  }

  // REVOKED (refund — immediate loss of access)
  else if (notificationType === 12 && existingSub) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "revoked", subscription_end: now, updated_at: now })
      .eq("id", existingSub.id);

    if (error) return { success: false, error: error.message };
    console.log(`REVOKED (refund) ${existingSub.id} — access removed immediately`);
  }

  // EXPIRED
  else if (notificationType === 13 && existingSub) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "expired", updated_at: now })
      .eq("id", existingSub.id);

    if (error) return { success: false, error: error.message };
    console.log(`Expired ${existingSub.id}`);
  }

  // ON_HOLD / GRACE_PERIOD / PAUSED
  else if (HOLD_STATUSES.has(notificationType) && existingSub) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "on_hold", updated_at: now })
      .eq("id", existingSub.id);

    if (error) return { success: false, error: error.message };
    console.log(`Set ${existingSub.id} to on_hold (${typeName})`);
  }

  else {
    console.log(`Unhandled: ${typeName}`);
  }

  return { success: true };
}

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

  const supabase = getSupabaseClient();

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get("GOOGLE_PLAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const providedSecret =
      url.searchParams.get("secret") || req.headers.get("x-webhook-secret");

    if (providedSecret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messageData = body?.message?.data;

    if (!messageData) {
      await logWebhookEvent(supabase, "missing_data", null, null, null, body, "error", "No message data");
      return new Response(JSON.stringify({ error: "No message data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const decoded = atob(messageData);
    const notification = JSON.parse(decoded);

    // Test notification
    if (notification?.testNotification) {
      await logWebhookEvent(supabase, "test_ping", null, null, null, notification, "success");
      return new Response(JSON.stringify({ ok: true, type: "test_ping" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subNotification = notification?.subscriptionNotification;
    if (!subNotification) {
      await logWebhookEvent(supabase, "non_subscription", null, null, null, notification, "success");
      return new Response(JSON.stringify({ ok: true, type: "non-subscription" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { notificationType, purchaseToken, subscriptionId } = subNotification;
    const typeName = NOTIFICATION_TYPES[notificationType] || `UNKNOWN_${notificationType}`;

    console.log(`Processing: ${typeName} | product: ${subscriptionId}`);

    const result = await handleSubscriptionNotification(
      supabase,
      notificationType,
      purchaseToken,
      subscriptionId,
      notification
    );

    await logWebhookEvent(
      supabase,
      "subscription",
      typeName,
      purchaseToken,
      subscriptionId,
      notification,
      result.success ? "success" : "error",
      result.error || null
    );

    return new Response(JSON.stringify({ ok: true, type: typeName }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", errorMsg);
    await logWebhookEvent(supabase, "crash", null, null, null, { error: errorMsg }, "error", errorMsg);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
