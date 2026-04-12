import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function computeExpiresAt(durationType: string): string {
  const now = new Date();
  switch (durationType) {
    case "day":
      now.setDate(now.getDate() + 1);
      break;
    case "week":
      now.setDate(now.getDate() + 7);
      break;
    case "month":
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  return now.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, code, device_fingerprint, user_id } = body;

    if (!device_fingerprint || !user_id) {
      return jsonResponse({ error: "Missing device_fingerprint or user_id" }, 400);
    }

    // ── ACTION: CHECK for active coupon ──
    if (action === "check") {
      const { data: claims } = await supabase
        .from("coupon_claims")
        .select("id, coupon_id, expires_at, coupons(code, duration_type, bonus_points)")
        .or(`device_fingerprint.eq.${device_fingerprint},user_id.eq.${user_id}`)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1);

      if (claims && claims.length > 0) {
        const claim = claims[0] as any;
        return jsonResponse({
          active_coupon: {
            couponId: claim.coupon_id,
            code: claim.coupons?.code || "",
            durationType: claim.coupons?.duration_type || "",
            expiresAt: claim.expires_at,
            bonusPoints: claim.coupons?.bonus_points ?? 60,
          },
        });
      }
      return jsonResponse({ active_coupon: null });
    }

    // ── ACTION: REDEEM coupon ──
    if (action === "redeem") {
      if (!code) {
        return jsonResponse({ error: "MISSING_CODE" }, 400);
      }

      // 1. Find coupon
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();

      if (couponErr || !coupon) {
        return jsonResponse({ error: "INVALID_CODE" }, 404);
      }

      // 2. Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return jsonResponse({ error: "COUPON_EXPIRED" }, 410);
      }

      // 3. Check max claims
      if (coupon.current_claims >= coupon.max_claims) {
        return jsonResponse({ error: "COUPON_EXHAUSTED" }, 410);
      }

      // 4. Check if device already used this coupon
      const { data: existingClaim } = await supabase
        .from("coupon_claims")
        .select("id")
        .eq("coupon_id", coupon.id)
        .or(`device_fingerprint.eq.${device_fingerprint},user_id.eq.${user_id}`)
        .limit(1);

      if (existingClaim && existingClaim.length > 0) {
        return jsonResponse({ error: "ALREADY_CLAIMED" }, 409);
      }

      // 5. Create claim
      const expiresAt = computeExpiresAt(coupon.duration_type);

      const { error: insertErr } = await supabase
        .from("coupon_claims")
        .insert({
          coupon_id: coupon.id,
          user_id,
          device_fingerprint,
          expires_at: expiresAt,
        });

      if (insertErr) {
        console.error("Insert claim error:", insertErr);
        return jsonResponse({ error: "CLAIM_FAILED" }, 500);
      }

      // 6. Increment current_claims
      await supabase
        .from("coupons")
        .update({ current_claims: coupon.current_claims + 1 })
        .eq("id", coupon.id);

      return jsonResponse({
        success: true,
        coupon_id: coupon.id,
        code: coupon.code,
        duration_type: coupon.duration_type,
        expires_at: expiresAt,
        bonus_points: coupon.bonus_points ?? 60,
      });
    }

    return jsonResponse({ error: "INVALID_ACTION" }, 400);
  } catch (err) {
    console.error("redeem-coupon error:", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});
