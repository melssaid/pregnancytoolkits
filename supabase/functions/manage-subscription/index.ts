import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...payload } = await req.json();

    // ─── ACTION: get_status ──────────────────────────────────────
    if (action === 'get_status') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sub) {
        return new Response(JSON.stringify({
          status: 'none',
          has_active: false,
          is_trial: false,
          trial_remaining_days: 0,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const now = new Date();
      const trialEnd = new Date(sub.trial_end);
      const subEnd = sub.subscription_end ? new Date(sub.subscription_end) : null;
      const isTrialActive = sub.status === 'active' && sub.subscription_type === 'trial' && trialEnd > now;
      const isSubActive = sub.status === 'active' && sub.subscription_type !== 'trial' && (!subEnd || subEnd > now);
      const trialRemainingDays = isTrialActive ? Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000) : 0;

      return new Response(JSON.stringify({
        status: sub.status,
        subscription_type: sub.subscription_type,
        has_active: isTrialActive || isSubActive,
        is_trial: isTrialActive,
        trial_remaining_days: trialRemainingDays,
        subscription_end: sub.subscription_end,
        google_play_order_id: sub.google_play_order_id,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── ACTION: start_trial ─────────────────────────────────────
    if (action === 'start_trial') {
      // Check if user already had a trial
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: 'Trial already used' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 86400000); // 3 days

      const { data: sub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'trial',
          status: 'active',
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        trial_end: trialEnd.toISOString(),
        trial_remaining_days: 3,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── ACTION: activate_google_play ────────────────────────────
    // Called after a successful Google Play purchase from the Android app
    if (action === 'activate_google_play') {
      const { order_id, purchase_token, product_id } = payload;

      if (!order_id || !purchase_token) {
        return new Response(JSON.stringify({ error: 'Missing order_id or purchase_token' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Determine subscription type from product_id
      const isYearly = product_id?.includes('yearly') || product_id?.includes('annual');
      const subscriptionType = isYearly ? 'yearly' : 'monthly';
      const now = new Date();
      const subEnd = isYearly
        ? new Date(now.getTime() + 365 * 86400000)
        : new Date(now.getTime() + 30 * 86400000);

      // Upsert: update existing or create new
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing subscription
        result = await supabase
          .from('subscriptions')
          .update({
            subscription_type: subscriptionType,
            status: 'active',
            google_play_order_id: order_id,
            google_play_token: purchase_token,
            subscription_start: now.toISOString(),
            subscription_end: subEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Create new subscription
        result = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            subscription_type: subscriptionType,
            status: 'active',
            google_play_order_id: order_id,
            google_play_token: purchase_token,
            subscription_start: now.toISOString(),
            subscription_end: subEnd.toISOString(),
            trial_start: now.toISOString(),
            trial_end: now.toISOString(), // no trial
          })
          .select()
          .single();
      }

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        subscription_type: subscriptionType,
        subscription_end: subEnd.toISOString(),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── ACTION: cancel ──────────────────────────────────────────
    if (action === 'cancel') {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Subscription error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
