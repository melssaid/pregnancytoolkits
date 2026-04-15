/**
 * activate-subscription Edge Function
 * 
 * Called from the client after a successful Google Play purchase.
 * Uses service_role to UPSERT the subscriptions table.
 * Also acknowledges the purchase via Google Play Developer API
 * to prevent automatic refunds after 3 days.
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

// ─── Google Play API Acknowledgment ───

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  }));

  // Import the private key for signing
  const pemContents = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signInput = new TextEncoder().encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, signInput);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${errText}`);
  }

  const tokenData = await res.json();
  return tokenData.access_token;
}

async function acknowledgeSubscription(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
  accessToken: string,
): Promise<boolean> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}:acknowledge`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (res.ok || res.status === 204) {
    console.log(`✅ Server-side acknowledge succeeded for ${subscriptionId}`);
    return true;
  }

  // 400 might mean already acknowledged — that's fine
  if (res.status === 400) {
    const body = await res.text();
    if (body.includes("alreadyAcknowledged") || body.includes("The subscription purchase has already been acknowledged")) {
      console.log(`ℹ️ Already acknowledged for ${subscriptionId}`);
      return true;
    }
    console.warn(`⚠️ Acknowledge returned 400: ${body}`);
    return false;
  }

  const errBody = await res.text();
  console.error(`❌ Acknowledge failed: ${res.status} ${errBody}`);
  return false;
}

// ─── Main Handler ───

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

    // ── Server-side Acknowledge via Google Play API ──
    let serverAcknowledged = false;
    const saKeyJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    if (saKeyJson) {
      try {
        const saKey: ServiceAccountKey = JSON.parse(saKeyJson);
        const accessToken = await getAccessToken(saKey);
        serverAcknowledged = await acknowledgeSubscription(
          "app.pregnancytoolkits.android",
          productId,
          purchaseToken,
          accessToken,
        );
      } catch (ackErr) {
        console.error("Server-side acknowledge error:", ackErr);
      }
    } else {
      console.warn("⚠️ GOOGLE_SERVICE_ACCOUNT_KEY not configured — skipping server-side acknowledge");
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

    console.log(`✅ Subscription activated: user=${user.id}, type=${subType}, product=${productId}, serverAck=${serverAcknowledged}`);
    return jsonResponse({ ok: true, type: subType, acknowledged: serverAcknowledged });
  } catch (err) {
    console.error("Activation error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
