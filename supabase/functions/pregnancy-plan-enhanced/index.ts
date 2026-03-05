// Enhanced Pregnancy Plan: Perplexity research → Gemini plan generation

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Perplexity: fetch latest medical research ──
async function fetchResearch(week: number, conditions: string[], lang: string): Promise<string> {
  const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
  if (!PERPLEXITY_API_KEY) {
    console.warn("[Enhanced] PERPLEXITY_API_KEY not configured, skipping research");
    return "";
  }

  const conditionsQuery = conditions.length > 0 ? ` with ${conditions.join(", ")}` : "";
  const query = `Latest evidence-based medical guidelines and research for pregnancy week ${week}${conditionsQuery}. Include: recommended tests, nutrition, exercise safety, warning signs, and new studies from 2025-2026. Focus on peer-reviewed sources.`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a medical research assistant. Provide concise, evidence-based summaries of the latest pregnancy research. Include citations where possible. Keep response under 800 words." },
          { role: "user", content: query },
        ],
        search_recency_filter: "year",
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Enhanced] Perplexity error ${response.status}:`, errText.substring(0, 200));
      return "";
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations?.map((c: string, i: number) => `[${i + 1}] ${c}`).join("\n") || "";

    console.log(`[Enhanced] Perplexity returned ${content.length} chars, ${data.citations?.length || 0} citations`);
    return citations ? `${content}\n\nSources:\n${citations}` : content;
  } catch (e) {
    console.error("[Enhanced] Perplexity fetch failed:", String(e).substring(0, 200));
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Authentication required", 401);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonError("AI service is not properly configured", 503);
    }

    let body: EnhancedPlanRequest;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    if (!body.week || body.week < 1 || body.week > 42) {
      return jsonError("Week must be 1-42", 400);
    }

    const lang = body.language?.split("-")[0] || "en";
    const mode = body.mode || "plan";

    console.log(`[Enhanced] Starting ${mode} for week ${body.week}, lang=${lang}`);

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

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Research-Enhanced": research ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("[Enhanced] Unexpected error:", error);
    return jsonError("An unexpected error occurred", 500);
  }
});
