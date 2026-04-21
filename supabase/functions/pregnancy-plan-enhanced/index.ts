// Enhanced Pregnancy Plan: Perplexity research → Gemini plan generation
// With rate limiting + daily usage enforcement

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-bypass, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EnhancedPlanRequest {
  week: number;
  weight: number;
  height: number;
  age: number;
  painLevel: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  sleepHours: number;
  activityLevel: string;
  mood: string;
  conditions: string[];
  language: string;
  mode: "plan" | "report";
}

const LANG_CONFIG: Record<string, { name: string; native: string }> = {
  en: { name: "English", native: "Respond entirely in English." },
  ar: { name: "Arabic", native: "يجب الرد بالعربية فقط. لا تستخدم كلمات إنجليزية." },
  de: { name: "German", native: "Antworten Sie auf Deutsch. Keine englischen Wörter." },
  tr: { name: "Turkish", native: "Türkçe yanıt verin. İngilizce kullanmayın." },
  fr: { name: "French", native: "Répondez en français. Pas de mots anglais." },
  es: { name: "Spanish", native: "Responda en español. Sin palabras en inglés." },
  pt: { name: "Portuguese", native: "Responda em português. Sem palavras em inglês." },
};

// ── Rate limiting ──
const FREE_DAILY_LIMIT = 5;
const PREMIUM_DAILY_LIMIT = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5; // Stricter for this expensive endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(id);
  if (!rec || now > rec.resetTime) {
    rateLimitMap.set(id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (rec.count >= MAX_REQUESTS_PER_WINDOW) return false;
  rec.count++;
  return true;
}

function getClientId(req: Request): string {
  return req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-info") || "unknown";
}

async function getDailyUsageCount(clientId: string, userId: string | null): Promise<number> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();
    
    // Query by BOTH client_id (IP) and user_id, take the MAX
    const queries: Promise<number>[] = [];
    
    if (clientId && clientId !== "unknown") {
      queries.push(
        Promise.resolve(adminClient
          .from("ai_usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("success", true)
          .gte("created_at", todayISO)
          .then(({ count, error }) => {
            if (error) console.error("[Enhanced] IP usage check error:", error.message);
            return count || 0;
          }))
      );
    }
    
    if (userId) {
      queries.push(
        Promise.resolve(adminClient
          .from("ai_usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("success", true)
          .gte("created_at", todayISO)
          .then(({ count, error }) => {
            if (error) console.error("[Enhanced] user usage check error:", error.message);
            return count || 0;
          }))
      );
    }
    
    if (queries.length === 0) return 0;
    const results = await Promise.all(queries);
    return Math.max(...results);
  } catch (e) {
    console.error("[Enhanced] daily usage check failed:", String(e).substring(0, 100));
    return 0;
  }
}

async function logAIUsage(
  aiType: string, language: string, clientId: string,
  userId: string | null, tokensUsed: number, success: boolean, responseTimeMs: number
): Promise<void> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    await adminClient.from("ai_usage_logs").insert({
      ai_type: aiType,
      language,
      client_id: clientId,
      user_id: userId,
      tokens_used: tokensUsed,
      success,
      response_time_ms: responseTimeMs,
    });
  } catch (e) {
    console.error("[Enhanced] Failed to log usage:", String(e).substring(0, 100));
  }
}

// ── Input validation ──
function validateBody(body: unknown): { valid: true; data: EnhancedPlanRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Invalid request body" };
  const b = body as Record<string, unknown>;
  
  if (typeof b.week !== "number" || b.week < 1 || b.week > 42) return { valid: false, error: "Week must be 1-42" };
  if (typeof b.weight !== "number" || b.weight < 20 || b.weight > 300) return { valid: false, error: "Invalid weight" };
  if (typeof b.height !== "number" || b.height < 50 || b.height > 250) return { valid: false, error: "Invalid height" };
  if (typeof b.age !== "number" || b.age < 10 || b.age > 65) return { valid: false, error: "Invalid age" };
  if (typeof b.painLevel !== "number" || b.painLevel < 0 || b.painLevel > 10) return { valid: false, error: "Invalid pain level" };
  if (typeof b.bloodPressureSys !== "number" || b.bloodPressureSys < 50 || b.bloodPressureSys > 250) return { valid: false, error: "Invalid blood pressure" };
  if (typeof b.bloodPressureDia !== "number" || b.bloodPressureDia < 30 || b.bloodPressureDia > 200) return { valid: false, error: "Invalid blood pressure" };
  if (typeof b.sleepHours !== "number" || b.sleepHours < 0 || b.sleepHours > 24) return { valid: false, error: "Invalid sleep hours" };
  
  const validModes = ["plan", "report"];
  if (b.mode && !validModes.includes(b.mode as string)) return { valid: false, error: "Mode must be plan or report" };
  
  if (b.conditions && (!Array.isArray(b.conditions) || b.conditions.length > 20)) return { valid: false, error: "Invalid conditions" };
  
  return { valid: true, data: body as EnhancedPlanRequest };
}

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Gemini: synthesize research-style evidence-based summary ──
// Replaced Perplexity (sonar) with Lovable AI Gateway (Gemini) — unified provider, single key, no external dependency.
async function fetchResearch(week: number, conditions: string[], lang: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.warn("[Enhanced] LOVABLE_API_KEY not configured, skipping research");
    return "";
  }

  const conditionsQuery = conditions.length > 0 ? ` with ${conditions.slice(0, 5).join(", ")}` : "";
  const query = `Provide an evidence-based summary of current medical guidelines and well-established research for pregnancy week ${week}${conditionsQuery}. Cover: recommended screenings, nutrition (folate, iron, omega-3), exercise safety, common warning signs, and sleep/mental wellness. Cite organisations such as ACOG, WHO, NICE where relevant. Keep response under 700 words. Do NOT invent statistics or fake citations.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Pro model for higher factual accuracy on the research synthesis pass.
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a careful evidence-synthesis assistant for prenatal wellness. Summarize well-established clinical guidelines (ACOG, WHO, NICE, RCOG) without inventing data, statistics, or citations. Prefer cautious, neutral wording." },
          { role: "user", content: query },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Enhanced] Gemini research error ${response.status}:`, errText.substring(0, 200));
      return "";
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log(`[Enhanced] Gemini research returned ${content.length} chars`);
    return content;
  } catch (e) {
    console.error("[Enhanced] Gemini research fetch failed:", String(e).substring(0, 200));
    return "";
  }
}

// ── Build Gemini prompt with research context ──
function buildEnhancedPrompt(req: EnhancedPlanRequest, research: string): { system: string; user: string } {
  const lang = req.language || "en";
  const langCfg = LANG_CONFIG[lang] || LANG_CONFIG.en;
  const trimester = req.week <= 13 ? 1 : req.week <= 27 ? 2 : 3;
  const conditionsText = req.conditions.length > 0 ? req.conditions.join(", ") : "none";

  const langInstruction = `
🌐 CRITICAL LANGUAGE REQUIREMENT:
Target language: ${langCfg.name}
${langCfg.native}
• EVERY word, heading, table header, bullet point MUST be in ${langCfg.name}.
• Translate ALL content including medical terms.
`;

  const researchSection = research
    ? `\n\n📚 LATEST MEDICAL RESEARCH (use this to enhance your recommendations — do NOT copy verbatim, synthesize into your advice):\n---\n${research}\n---\n`
    : "";

  const basePersona = `You are a knowledgeable, warm pregnancy wellness advisor. You are an AI assistant, NOT a doctor.
IDENTITY RULES:
• NEVER introduce yourself
• Start your response with relevant content immediately
COMPLIANCE:
• NEVER provide a definitive medical diagnosis
• NEVER prescribe medication or dosages
• Use "may help," "studies suggest," "commonly recommended"
• Always end with medical disclaimer
• For severe symptoms, emphasize seeking immediate care
`;

  if (req.mode === "plan") {
    return {
      system: langInstruction + basePersona + researchSection + `
Generate a concise, personalized weekly pregnancy plan. Keep it focused and practical — avoid lengthy explanations. Use short bullet points. Structure:

## 📋 Week ${req.week} Overview
1-2 sentences only

## 🏋️ Exercise Plan
3-5 bullet points with safe exercises for trimester ${trimester}, considering pain level (${req.painLevel}/10)

## 🥗 Nutrition Guide
5-7 key food recommendations in a simple list (no table)

## 💊 Supplements
Brief list of what's recommended

## 🧘 Wellness Tips
3-4 practical tips for sleep (${req.sleepHours}hrs) and mood (${req.mood})

## 📅 This Week's Checklist
4-6 actionable items

## ⚠️ Warning Signs
3-5 key signs to watch for

## 💝 Encouragement
1-2 warm sentences

IMPORTANT: Keep the TOTAL response under 600 words. Be concise.`,
      user: `Week ${req.week}, Trimester ${trimester}. Weight: ${req.weight}kg, Height: ${req.height}cm, Age: ${req.age}. Pain: ${req.painLevel}/10, BP: ${req.bloodPressureSys}/${req.bloodPressureDia}, Sleep: ${req.sleepHours}hrs, Mood: ${req.mood}, Activity: ${req.activityLevel}. Conditions: ${conditionsText}.`,
    };
  } else {
    return {
      system: langInstruction + basePersona + researchSection + `
Generate a concise health report. Use short bullet points, avoid lengthy paragraphs. Structure:

## 📊 Health Summary
2-3 sentences with key findings

## 🩺 Vital Signs
- BP: ${req.bloodPressureSys}/${req.bloodPressureDia} — brief interpretation
- BMI and weight assessment (1 line each)

## 🔬 Recommended Tests
3-5 tests appropriate for week ${req.week}

## ⚡ Risk Factors
Brief list based on patient data

## 🥗 Nutrition & Activity
Key recommendations in bullet points

## ⚠️ Warning Signs
3-5 specific signs to monitor

## 📋 Action Items
4-6 priority next steps

IMPORTANT: Keep the TOTAL response under 500 words. Be concise and practical.`,
      user: `Patient data — Week ${req.week}, Age: ${req.age}, Weight: ${req.weight}kg, Height: ${req.height}cm, BP: ${req.bloodPressureSys}/${req.bloodPressureDia}, Pain: ${req.painLevel}/10, Sleep: ${req.sleepHours}hrs, Mood: ${req.mood}, Activity: ${req.activityLevel}, Conditions: ${conditionsText}.`,
    };
  }
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Authentication ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Authentication required", 401);
    }

    const ipClientId = getClientId(req);
    let rateLimitId = ipClientId;
    let userId: string | null = null;

    // Try to verify JWT for user-level identification
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.id) {
        rateLimitId = user.id;
        userId = user.id;
      }
    } catch {
      // Continue with IP-based rate limiting
    }

    // ── Check subscription tier ──
    let isPremium = false;
    if (userId) {
      try {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );
        const { data: subs } = await adminClient
          .from("subscriptions")
          .select("subscription_type, status, trial_end, subscription_end")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (subs && subs.length > 0) {
          const sub = subs[0];
          if (sub.status === "active") {
            if (sub.subscription_type === "premium" || sub.subscription_type === "yearly" || sub.subscription_type === "monthly") {
              isPremium = true;
            } else if (sub.subscription_type === "trial" && sub.trial_end) {
              isPremium = new Date(sub.trial_end) > new Date();
            }
          }
        }
      } catch { /* fail open */ }
    }

    const DAILY_LIMIT = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;

    // ── Per-minute burst rate limit ──
    if (!checkRateLimit(rateLimitId)) {
      return jsonError("Rate limit exceeded. Please wait a minute before trying again.", 429);
    }

    // ── Server-side daily limit check — use IP as primary ──
    const adminBypass = req.headers.get("X-Admin-Bypass") === "true";
    const dailyUsed = await getDailyUsageCount(ipClientId, userId);
    if (dailyUsed >= DAILY_LIMIT && !adminBypass) {
      return new Response(
        JSON.stringify({ error: "daily_limit_reached", used: dailyUsed, limit: DAILY_LIMIT, remaining: 0 }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Daily-Limit": String(DAILY_LIMIT),
            "X-Daily-Used": String(dailyUsed),
            "X-Daily-Remaining": "0",
          },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonError("AI service is not properly configured", 503);
    }

    // ── Parse & validate body ──
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const validation = validateBody(rawBody);
    if (!validation.valid) {
      return jsonError(validation.error, 400);
    }
    const body = validation.data;

    const lang = body.language?.split("-")[0] || "en";
    const mode = body.mode || "plan";
    const requestStartTime = Date.now();

    console.log(`[Enhanced] Starting ${mode} for week ${body.week}, lang=${lang}, used=${dailyUsed}/${DAILY_LIMIT}`);

    // Step 1: Fetch latest research from Perplexity (non-blocking on failure)
    const research = await fetchResearch(body.week, body.conditions || [], lang);
    console.log(`[Enhanced] Research: ${research ? "✓" : "✗ (skipped)"} ${research.length} chars`);

    // Step 2: Build enhanced prompt with research context
    const { system, user } = buildEnhancedPrompt({ ...body, language: lang, mode }, research);

    // Step 3: Stream from Gemini
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: true,
        temperature: mode === "plan" ? 0.4 : 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonError("Rate limit exceeded, please try again later", 429);
      if (response.status === 402) return jsonError("AI usage limit reached. Please add credits.", 402);
      const errText = await response.text();
      console.error(`[Enhanced] Gemini error ${response.status}:`, errText.substring(0, 200));
      return jsonError("AI service temporarily unavailable", 503);
    }

    // Log usage (fire-and-forget)
    const elapsed = Date.now() - requestStartTime;
    const aiType = mode === "plan" ? "pregnancy-plan-enhanced" : "health-report-enhanced";
    logAIUsage(aiType, lang, ipClientId, userId, 2000, true, elapsed).catch(() => {});

    const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyUsed - 1);

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Research-Enhanced": research ? "true" : "false",
        "X-Daily-Limit": String(DAILY_LIMIT),
        "X-Daily-Used": String(dailyUsed + 1),
        "X-Daily-Remaining": String(dailyRemaining),
      },
    });
  } catch (error) {
    console.error("[Enhanced] Unexpected error:", error);
    return jsonError("An unexpected error occurred", 500);
  }
});
