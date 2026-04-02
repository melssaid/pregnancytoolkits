/**
 * Google Play Billing Webhook (RTDN)
 * 
 * Receives Real-Time Developer Notifications from Google Cloud Pub/Sub
 * and updates the subscriptions table accordingly.
 * 
 * Pub/Sub sends POST with JSON: { message: { data: "<base64>", messageId: "..." }, subscription: "..." }
 * The base64-decoded data contains a DeveloperNotification with subscriptionNotification.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

// Google Play subscription notification types
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

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    // Verify webhook secret (MANDATORY)
    const webhookSecret = Deno.env.get("GOOGLE_PLAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("GOOGLE_PLAY_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const providedSecret = req.headers.get("x-webhook-secret");
    if (providedSecret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Received Pub/Sub message:", JSON.stringify(body));

    // Decode Pub/Sub message data
    const messageData = body?.message?.data;
    if (!messageData) {
      console.error("No message data in request");
      return new Response(JSON.stringify({ error: "No message data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const decoded = atob(messageData);
    const notification = JSON.parse(decoded);
    console.log("Decoded notification:", JSON.stringify(notification));

    const subNotification = notification?.subscriptionNotification;
    if (!subNotification) {
      // Could be a test notification or one-time product notification
      console.log("No subscriptionNotification — possibly a test ping");
      return new Response(JSON.stringify({ ok: true, type: "non-subscription" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      notificationType,
      purchaseToken,
      subscriptionId,
    } = subNotification;

    const typeName = NOTIFICATION_TYPES[notificationType] || `UNKNOWN_${notificationType}`;
    console.log(`Processing: ${typeName} for product ${subscriptionId}, token: ${purchaseToken?.substring(0, 20)}...`);

    // Initialize Supabase with service_role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find subscription by google_play_token
    const { data: existingSub, error: findError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("google_play_token", purchaseToken)
      .maybeSingle();

    if (findError) {
      console.error("Error finding subscription:", findError.message);
    }

    // Determine subscription type from product ID
    const subType = subscriptionId === "premium_yearly" ? "yearly" : "monthly";
    const now = new Date().toISOString();

    // Calculate subscription end based on type
    const calcEndDate = (from: Date, type: string): string => {
      const end = new Date(from);
      if (type === "yearly") {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      return end.toISOString();
    };

    switch (notificationType) {
      // PURCHASED
      case 4: {
        if (existingSub) {
          // Update existing record
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              subscription_type: subType,
              subscription_start: now,
              subscription_end: calcEndDate(new Date(), subType),
              google_play_order_id: notification.orderId || null,
              updated_at: now,
            })
            .eq("id", existingSub.id);

          if (error) console.error("Update error (PURCHASED):", error.message);
          else console.log(`Updated subscription ${existingSub.id} to active/${subType}`);
        } else {
          // No existing record with this token — try to find by most recent trial user
          // In practice, the app should set google_play_token before purchase completes
          console.warn("No subscription found with this purchaseToken. Cannot update.");
        }
        break;
      }

      // RENEWED / RECOVERED / RESTARTED
      case 1:
      case 2:
      case 7: {
        if (existingSub) {
          const newEnd = calcEndDate(
            existingSub.subscription_end ? new Date(existingSub.subscription_end) : new Date(),
            existingSub.subscription_type === "yearly" ? "yearly" : "monthly"
          );
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              subscription_end: newEnd,
              updated_at: now,
            })
            .eq("id", existingSub.id);

          if (error) console.error(`Update error (${typeName}):`, error.message);
          else console.log(`Renewed subscription ${existingSub.id} until ${newEnd}`);
        }
        break;
      }

      // CANCELED
      case 3: {
        if (existingSub) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "canceled", updated_at: now })
            .eq("id", existingSub.id);

          if (error) console.error("Update error (CANCELED):", error.message);
          else console.log(`Canceled subscription ${existingSub.id}`);
        }
        break;
      }

      // EXPIRED
      case 13: {
        if (existingSub) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "expired", updated_at: now })
            .eq("id", existingSub.id);

          if (error) console.error("Update error (EXPIRED):", error.message);
          else console.log(`Expired subscription ${existingSub.id}`);
        }
        break;
      }

      // REVOKED (immediate cancellation)
      case 12: {
        if (existingSub) {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "revoked",
              subscription_end: now,
              updated_at: now,
            })
            .eq("id", existingSub.id);

          if (error) console.error("Update error (REVOKED):", error.message);
          else console.log(`Revoked subscription ${existingSub.id}`);
        }
        break;
      }

      // ON_HOLD / IN_GRACE_PERIOD / PAUSED
      case 5:
      case 6:
      case 10: {
        if (existingSub) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "on_hold", updated_at: now })
            .eq("id", existingSub.id);

          if (error) console.error(`Update error (${typeName}):`, error.message);
          else console.log(`Set subscription ${existingSub.id} to on_hold`);
        }
        break;
      }

      default:
        console.log(`Unhandled notification type: ${typeName}`);
    }

    return new Response(JSON.stringify({ ok: true, type: typeName }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
