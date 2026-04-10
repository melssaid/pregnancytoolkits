import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PUBLIC_KEY = "BCQ2QGl7rRwrzUwCTpP84RLAKdsoI-u61PUe1J83ZAqowJELVxxuFoZVZb-vKM-GP2StukfgTbHHMCKobOb3TVc";

// Hardcoded admin user IDs — only these users can send notifications
const ADMIN_USER_IDS: string[] = [
  // Add your admin user IDs here
];

const MAX_DAILY_SENDS = 3;

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Web Push helpers
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function importVapidKeys() {
  const privateKeyRaw = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!privateKeyRaw) throw new Error("VAPID_PRIVATE_KEY not configured");

  const privateKeyBytes = base64UrlToUint8Array(privateKeyRaw);
  const publicKeyBytes = base64UrlToUint8Array(VAPID_PUBLIC_KEY);

  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Middle = new Uint8Array([0xa1, 0x44, 0x03, 0x42, 0x00]);

  const pkcs8 = new Uint8Array(pkcs8Header.length + privateKeyBytes.length + pkcs8Middle.length + publicKeyBytes.length);
  pkcs8.set(pkcs8Header, 0);
  pkcs8.set(privateKeyBytes, pkcs8Header.length);
  pkcs8.set(pkcs8Middle, pkcs8Header.length + privateKeyBytes.length);
  pkcs8.set(publicKeyBytes, pkcs8Header.length + privateKeyBytes.length + pkcs8Middle.length);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  return { privateKey, publicKeyBytes };
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidAuthHeader(endpoint: string) {
  const { privateKey } = await importVapidKeys();
  const audience = new URL(endpoint).origin;
  const expiry = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: expiry, sub: "mailto:pregnancytoolkits@gmail.com" };

  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    enc.encode(unsigned)
  );

  const sigArray = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigArray[0] === 0x30) {
    const rLen = sigArray[3];
    const rStart = 4;
    const rBytes = sigArray.slice(rStart, rStart + rLen);
    const sLen = sigArray[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    const sBytes = sigArray.slice(sStart, sStart + sLen);
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
    if (r.length < 32) { const padded = new Uint8Array(32); padded.set(r, 32 - r.length); r = padded; }
    if (s.length < 32) { const padded = new Uint8Array(32); padded.set(s, 32 - s.length); s = padded; }
  } else {
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  const jwt = `${unsigned}.${uint8ArrayToBase64Url(rawSig)}`;
  return { jwt, publicKey: VAPID_PUBLIC_KEY };
}

async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: string) {
  const { jwt, publicKey } = await createVapidAuthHeader(subscription.endpoint);

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
    },
    body: new TextEncoder().encode(payload),
  });

  return res.ok || res.status === 201;
}

/** Authenticate admin user from JWT */
async function authenticateAdmin(req: Request): Promise<{ authorized: boolean; userId?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.id) return { authorized: false };

  // If ADMIN_USER_IDS is empty, allow any authenticated user (for initial setup)
  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(user.id)) {
    return { authorized: false };
  }

  return { authorized: true, userId: user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate admin for ALL actions
    const { authorized } = await authenticateAdmin(req);
    if (!authorized) {
      return jsonResponse({ error: "Unauthorized — admin access required" }, 401);
    }

    const { action, title, body, language } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    if (action === "count") {
      const { count } = await sb.from("push_subscriptions").select("*", { count: "exact", head: true });
      return jsonResponse({ count: count || 0 });
    }

    if (action === "send") {
      if (!title || !body) {
        return jsonResponse({ error: "title and body required" }, 400);
      }

      // Rate limit: max 3 sends per day
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayCount } = await sb
        .from("notification_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      if ((todayCount || 0) >= MAX_DAILY_SENDS) {
        return jsonResponse({ error: `Rate limit: max ${MAX_DAILY_SENDS} notifications per day` }, 429);
      }

      let query = sb.from("push_subscriptions").select("*");
      if (language) {
        query = query.eq("user_language", language);
      }

      const { data: subs, error } = await query;
      if (error) throw error;

      const payload = JSON.stringify({ title, body, url: "/" });

      let sent = 0;
      let failed = 0;
      const expired: string[] = [];

      for (const sub of subs || []) {
        try {
          const ok = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload
          );
          if (ok) sent++;
          else {
            failed++;
            expired.push(sub.id);
          }
        } catch {
          failed++;
          expired.push(sub.id);
        }
      }

      // Clean up expired subscriptions
      if (expired.length > 0) {
        await sb.from("push_subscriptions").delete().in("id", expired);
      }

      // Log to database
      await sb.from("notification_logs").insert({
        title,
        body,
        language: language || null,
        total_sent: sent,
        total_failed: failed,
        total_subscribers: (subs || []).length,
      });

      return jsonResponse({ sent, failed, total: (subs || []).length });
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
