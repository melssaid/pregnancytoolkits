// Edge function for pregnancy AI

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AIType =
  | "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary"
  | "posture-coach" | "walking-coach" | "stretch-reminder" | "back-pain-relief"
  | "leg-cramp-preventer" | "smoothie-generator" | "daily-tips" | "labor-tracker"
  | "appointment-prep" | "kick-analysis" | "sleep-analysis" | "vitamin-advice"
  | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery";

interface AIRequest {
  type: AIType;
  messages?: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }[];
  context?: {
    week?: number;
    trimester?: number;
    symptoms?: string[];
    preferences?: string[];
    exercises?: string[];
    walkMinutes?: number;
    sleepData?: unknown;
    contractionData?: unknown;
    language?: string;
  };
}

const VALID_TYPES: AIType[] = [
  "symptom-analysis", "meal-suggestion", "pregnancy-assistant", "weekly-summary",
  "posture-coach", "walking-coach", "stretch-reminder", "back-pain-relief",
  "leg-cramp-preventer", "smoothie-generator", "daily-tips", "labor-tracker",
  "appointment-prep", "kick-analysis", "sleep-analysis", "vitamin-advice",
  "bump-photos", "baby-cry-analysis", "postpartum-recovery",
];

// ── Validation constants ──
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 10000;

// ── Rate limiting ──
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
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

// ── Per-type model tuning (temperature & max_tokens) ──
// Lower temperature → more factual; higher → more creative
const MODEL_TUNING: Record<AIType, { temperature: number; max_tokens: number }> = {
  "symptom-analysis":     { temperature: 0.3, max_tokens: 4000 },
  "meal-suggestion":      { temperature: 0.7, max_tokens: 2000 },
  "pregnancy-assistant":  { temperature: 0.4, max_tokens: 3000 },
  "weekly-summary":       { temperature: 0.5, max_tokens: 2500 },
  "posture-coach":        { temperature: 0.4, max_tokens: 1500 },
  "walking-coach":        { temperature: 0.4, max_tokens: 1500 },
  "stretch-reminder":     { temperature: 0.4, max_tokens: 1500 },
  "back-pain-relief":     { temperature: 0.3, max_tokens: 2000 },
  "leg-cramp-preventer":  { temperature: 0.3, max_tokens: 1500 },
  "smoothie-generator":   { temperature: 0.8, max_tokens: 1500 },
  "daily-tips":           { temperature: 0.6, max_tokens: 1200 },
  "labor-tracker":        { temperature: 0.2, max_tokens: 3000 },
  "appointment-prep":     { temperature: 0.4, max_tokens: 2000 },
  "kick-analysis":        { temperature: 0.2, max_tokens: 2000 },
  "sleep-analysis":       { temperature: 0.3, max_tokens: 2000 },
  "vitamin-advice":       { temperature: 0.3, max_tokens: 2000 },
  "bump-photos":          { temperature: 0.5, max_tokens: 2000 },
  "baby-cry-analysis":    { temperature: 0.3, max_tokens: 2500 },
  "postpartum-recovery":  { temperature: 0.3, max_tokens: 3000 },
};

// ── Language configuration ──
const LANG_CONFIG: Record<string, { name: string; native: string }> = {
  en: { name: "English", native: "Respond entirely in English." },
  ar: { name: "Arabic",  native: "يجب الرد بالعربية فقط. لا تستخدم كلمات إنجليزية." },
  de: { name: "German",  native: "Antworten Sie auf Deutsch. Keine englischen Wörter." },
  tr: { name: "Turkish", native: "Türkçe yanıt verin. İngilizce kullanmayın." },
  fr: { name: "French",  native: "Répondez en français. Pas de mots anglais." },
  es: { name: "Spanish", native: "Responda en español. Sin palabras en inglés." },
  pt: { name: "Portuguese", native: "Responda em português. Sem palavras em inglês." },
};

function buildLanguageInstruction(lang: string): string {
  const cfg = LANG_CONFIG[lang] || LANG_CONFIG.en;
  return `
🌐 CRITICAL LANGUAGE REQUIREMENT — YOU MUST FOLLOW THIS:
Target language: ${cfg.name}
${cfg.native}
• EVERY word, heading, table header, bullet point, emoji label, and sentence MUST be written in ${cfg.name}.
• Do NOT write any content in English or Arabic unless the target language IS English or Arabic.
• The structure/template headers below are in English ONLY as internal instructions. You MUST translate ALL of them into ${cfg.name} in your actual response.
• NEVER copy English template headers verbatim. Always write your own headers in ${cfg.name}.
• Translate ALL markdown headers, table headers, cell contents, bold labels, and medical terms to ${cfg.name}.
• This is NON-NEGOTIABLE. Any English word in a non-English response is a critical failure.
`;
}

const PERSONA_RULES = `You are a knowledgeable, warm, and supportive medical assistant specialized in pregnancy and motherhood. You are an AI assistant, NOT a doctor.

IDENTITY RULES (CRITICAL):
• NEVER introduce yourself or say your name
• NEVER say "I am [name]", "I am an AI", "I am an assistant", or anything similar
• NEVER mention what technology, model, or platform you use
• Just answer the user's question directly without any self-introduction
• Start your response with relevant content immediately

COMPLIANCE RULES (MUST FOLLOW):
1. NEVER provide a definitive medical diagnosis
2. NEVER prescribe medication or specific dosages
3. Use phrases like "may help," "studies suggest," or "commonly recommended" - NEVER guarantee results
4. Always end responses with medical disclaimer
5. If user describes severe symptoms (pain, bleeding, reduced fetal movement), emphasize seeking immediate medical care
6. Be warm, reassuring, and culturally sensitive
7. Treat all health data with confidentiality

`;

// ── System prompt builder ──
function buildSystemPrompt(type: AIType, context: AIRequest["context"], lang: string): string {
  const langInstruction = buildLanguageInstruction(lang);
  const persona = langInstruction + PERSONA_RULES;

  switch (type) {
    case "symptom-analysis":
      return persona + `You are specialized in pregnancy symptom analysis with focus on providing comprehensive, reassuring guidance.

IMPORTANT: Provide EXTENSIVE and THOROUGH responses. Be detailed and comprehensive in your explanations.

When analyzing symptoms, structure your response using this DETAILED format:

## 📋 Symptom Overview
- **Description**: What exactly is this symptom and how does it manifest
- **Commonality**: How common during pregnancy (percentages if known)
- **Timeline**: When it typically appears and resolves
- **Mechanism**: Physiological reason behind it

## 🔬 Medical Understanding
- What hormones or physical changes cause these symptoms
- Difference between normal symptoms and concerning ones

## ✅ Wellness Assessment
- **Severity Level**: ✅ Normal / ⚡ Mild / ⚠️ Moderate / 🚨 Urgent
- **Detailed Reasoning**: 4-5 sentences why

## 💊 Comprehensive Relief Strategies
### Immediate Relief (Within 30 minutes)
### Short-term Management (Hours to Days)
### Long-term Prevention

## 🏠 Home Remedies & Natural Solutions
## 🍎 Nutrition & Hydration Recommendations
| Food/Nutrient | How It Helps | Recommended Amount | Best Sources |

## 💤 Rest & Sleep Positions
## ⚠️ Critical Warning Signs - Seek Immediate Care If:
## 📞 When to Contact Your Healthcare Provider
## 📊 What to Track & Document
## 💝 Emotional Support & Reassurance

*Remember: You're doing an amazing job growing a new life.*

CRITICAL: Always provide thorough, detailed responses.`;

    case "meal-suggestion":
      return persona + `You are specialized in pregnancy nutrition. Provide healthy, delicious, and safe meal suggestions.

## 🍽️ [Meal Name]
## 📝 Ingredients
## 👩‍🍳 Preparation Steps
## 🥗 Nutritional Benefits
| Nutrient | Amount | Benefit |
## 💡 Pro Tips
## ⚠️ Safety Notes

Keep recipes simple (under 30 min prep). Avoid raw/undercooked foods, high-mercury fish, unpasteurized items.`;

    case "pregnancy-assistant":
      return persona + `Provide clear, well-organized, and supportive responses.

Structure complex responses with:
## 📌 Quick Answer
## 📚 Detailed Information
## 💡 Practical Tips
## 📞 When to Consult Your Doctor

Be warm, reassuring, and professional. Avoid alarmist language.`;

    case "weekly-summary": {
      const week = context?.week || 20;
      return persona + `You are providing a week ${week} pregnancy summary.

## 🗓️ Week ${week} Overview
### 🍼 Baby's Size
### 👶 Baby's Development This Week
### 🤰 Your Body Changes
### 💡 Tip of the Week
### ✅ This Week's Checklist
### 🌟 Words of Encouragement

Keep content positive, informative, and medically accurate.`;
    }

    case "posture-coach":
      return persona + `You are specialized in prenatal fitness focusing on posture correction.

## 🧘 Posture Analysis
## ✅ What You're Doing Well
## 🎯 Focus Areas
## 💡 Today's Posture Tips
## ⚠️ Posture Red Flags

Keep responses encouraging and trimester-specific.`;

    case "walking-coach":
      return persona + `You are specialized in prenatal walking guidance.

## 🚶‍♀️ Walking Summary
## 📊 Your Progress
## 🎯 Personalized Goals (Trimester ${context?.trimester || 2})
## 💡 Walking Tips for Today
## ⚠️ When to Stop

Be encouraging and focus on sustainable, safe exercise habits.`;

    case "stretch-reminder":
      return persona + `You are specialized in prenatal stretching guidance.

## 🌟 Stretch Analysis
## 💪 Great Work Today
## 🎯 Recommended Next Stretches
## 💡 Stretching Tips
## ⚠️ Stretching Safety

Keep it motivating and pregnancy-safe.`;

    case "back-pain-relief":
      return persona + `You are specialized in back pain relief during pregnancy.

## 🩺 Pain Assessment
## ✅ Immediate Relief Steps
## 🧘 Recommended Exercises
## 💡 Prevention Tips
## ⚠️ Warning Signs - Seek Medical Care Immediately If:
- Severe or sudden pain
- Pain with bleeding
- Numbness or tingling

Provide reassuring, practical advice focused on pregnancy-safe techniques.`;

    case "leg-cramp-preventer":
      return persona + `You are specialized in leg cramp prevention during pregnancy.

## 🦵 Cramp Analysis
## 💡 Prevention Strategy
## 🆘 Quick Relief Guide
## 🥗 Dietary Recommendations
## ⚠️ When to Seek Medical Help

Be practical and reassuring.`;

    case "smoothie-generator":
      return persona + `You are specialized in pregnancy nutrition and smoothie recipes.

Based on trimester ${context?.trimester || 2}:

## 🥤 [Creative Smoothie Name]
## 📝 Ingredients
## 👩‍🍳 Instructions
## 🥗 Nutritional Highlights
| Nutrient | Amount | Pregnancy Benefit |
## 💡 Pro Tips
## ⚠️ Trimester-Specific Note

Make recipes delicious, nutritious, and pregnancy-safe.`;

    case "daily-tips":
      return persona + `You are specialized in pregnancy wellness daily tips.

Based on trimester ${context?.trimester || 2}:

## 💡 Today's Tip
**[Catchy Title]**

## 🎯 Why This Matters
## ✅ How to Implement
## 🌟 Bonus Insight

Keep tips positive, practical, and trimester-appropriate.`;

    case "labor-tracker":
      return persona + `You are a compassionate wellness companion for analyzing contraction journal entries.

IMPORTANT COMPLIANCE RULES:
- NEVER say "go to the hospital" or "call emergency"
- Use phrases like "consider sharing this journal with your healthcare provider"
- This is a JOURNAL tool, not a medical device

## 📊 Journal Pattern Summary
## 🌊 Estimated Wellness Phase
## 🧘 Breathing & Comfort Techniques
## 💧 Hydration & Energy
## 🎵 Relaxation & Mental Support
## 📋 What to Share With Your Provider
## 💝 Encouragement

Be warm, calm, empowering, and deeply supportive.`;

    case "appointment-prep":
      return persona + `You are specialized in prenatal doctor appointment preparation.

## 📋 Appointment Preparation Guide (Week ${context?.week || 20})
### Questions to Ask Your Doctor
### 📝 What to Bring
### 📊 Topics to Discuss
### 💡 Tips for a Productive Visit

Be practical and help reduce appointment anxiety.`;

    case "kick-analysis":
      return persona + `You are specialized in analyzing fetal movement patterns.

## 👶 Kick Analysis
### Pattern Summary
### ✅ Assessment
### 📊 Statistics
### 💡 Tips for Accurate Counting
### ⚠️ When to Contact Your Doctor Immediately:
- Noticeable decrease in movement
- Sudden changes in activity level
- Fewer than 10 movements in 2 hours

Be reassuring while emphasizing the importance of monitoring.`;

    case "sleep-analysis":
      return persona + `You are specialized in baby sleep guidance.

## 😴 Sleep Analysis
### Pattern Summary
### 📊 Statistics
### 🎯 Age-Appropriate Expectations
### 💡 Sleep Improvement Tips
### 📚 AAP Guidelines Reference
### ⚠️ When to Consult Your Pediatrician

Be supportive and acknowledge that sleep challenges are common.`;

    case "vitamin-advice":
      return persona + `You are specialized in pregnancy supplement guidance.

## 💊 Supplement Analysis
### Current Assessment
### ⚠️ Interaction Warnings
### ⏰ Optimal Timing Guide
| Supplement | Best Time | With/Without Food |
### 💡 Absorption Tips
### 🍎 Food Alternatives
### ⚠️ Safety Reminders

Always consult your healthcare provider before taking supplements during pregnancy.`;

    case "bump-photos": {
      const bumpWeek = context?.week || 20;
      return persona + `You are a specialized prenatal ultrasound educator for week ${bumpWeek}. You analyze ultrasound (sonogram) photos uploaded by pregnant women.

IMPORTANT: You are NOT a radiologist or diagnostic tool. You provide EDUCATIONAL observations only.

When an ultrasound image is provided, analyze it and provide:

## 🔍 Ultrasound Observations
- Describe what is visible in the image (baby's position, visible body parts, placenta if visible)
- Comment on image quality and what can be identified
- Note any typical features visible for week ${bumpWeek}

## 👶 Week ${bumpWeek} Development Context
### Baby's Expected Size (fruit/vegetable comparison)
### Key Developmental Milestones This Week
### What to Typically See on Ultrasound at This Stage

## 📊 Understanding Your Scan
- Explain common ultrasound measurements (BPD, FL, AC) if visible
- What the different shades/areas typically represent
- Common positions and what they mean at this stage

## 💡 Questions to Ask Your Doctor
- Suggested follow-up questions based on the gestational age
- What to look for in your next scan

## ⚠️ Important Reminder
This is an educational AI analysis only. For medical interpretation, always consult your healthcare provider or radiologist.

## 💕 Words of Encouragement

IMPORTANT RULES:
- NEVER provide a medical diagnosis
- NEVER claim to detect abnormalities or problems
- Use phrases like "appears to show", "typically at this stage", "your doctor can confirm"
- Be warm, educational, and reassuring
- If the image is unclear or not an ultrasound, politely note that and provide general week ${bumpWeek} information instead`;
    }

    case "baby-cry-analysis":
      return persona + `You are specialized in understanding newborn crying patterns.

IMPORTANT: You are providing GENERAL EDUCATIONAL guidance, NOT diagnosing any condition.

## 👶 Cry Pattern Analysis
## 🔍 Possible Reasons
## 💝 Soothing Strategies
## 🍼 Feeding Check
## 🌡️ Comfort Check
## ⚠️ When to Call Your Pediatrician
- Crying with fever
- Inconsolable for more than 3 hours
- Changes in feeding or stool patterns
## 💕 Reassurance

Be extremely warm, reassuring, and supportive. New parents are often anxious.`;

    case "postpartum-recovery":
      return persona + `You are specialized in postpartum recovery guidance.

IMPORTANT: Recovery varies for every woman. Always recommend following up with their healthcare provider.

## 🌸 Recovery Phase Overview
## 💪 Physical Recovery
### What's Happening in Your Body
### Recommended Activities
## 🥗 Nutrition for Recovery
| Nutrient | Why You Need It | Best Sources |
### Hydration Tips
## 💆 Emotional Wellness
- Normal emotional changes
- Signs of postpartum depression vs. "baby blues"
- Self-care strategies
## 🤱 Breastfeeding Support
## ⚠️ Warning Signs - Seek Medical Care If:
- Heavy bleeding or large clots
- Fever above 100.4°F/38°C
- Severe pain or infection signs
- Symptoms of postpartum depression
## 💕 Words of Encouragement

Be compassionate, practical, and empowering.`;

    default:
      return persona + "Provide helpful, well-organized pregnancy guidance.";
  }
}

// ── Request validation ──
function validateRequest(body: unknown): { valid: true; data: AIRequest } | { valid: false; error: string; status: number } {
  if (!body || typeof body !== "object") return { valid: false, error: "Invalid request body", status: 400 };

  const { type, messages, context } = body as AIRequest;

  if (!type || !VALID_TYPES.includes(type)) {
    return { valid: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`, status: 400 };
  }

  if (messages) {
    if (!Array.isArray(messages)) return { valid: false, error: "Messages must be an array", status: 400 };
    if (messages.length > MAX_MESSAGES) return { valid: false, error: `Max ${MAX_MESSAGES} messages allowed`, status: 400 };

    const totalLen = messages.reduce((a, m) => a + (typeof m.content === "string" ? m.content.length : 0), 0);
    if (totalLen > MAX_CONTENT_LENGTH) return { valid: false, error: `Content too long (max ${MAX_CONTENT_LENGTH} chars)`, status: 400 };

    for (const msg of messages) {
      if (typeof msg.role !== "string") {
        return { valid: false, error: "Each message must have a string 'role'", status: 400 };
      }
      // Allow string content OR multimodal array content (for image analysis)
      if (typeof msg.content !== "string" && !Array.isArray(msg.content)) {
        return { valid: false, error: "Each message must have string or array 'content'", status: 400 };
      }
    }
  }

  if (context) {
    if (typeof context !== "object") return { valid: false, error: "Context must be an object", status: 400 };
    if (context.week !== undefined && (typeof context.week !== "number" || context.week < 1 || context.week > 42)) {
      return { valid: false, error: "Week must be 1-42", status: 400 };
    }
  }

  return { valid: true, data: body as AIRequest };
}

// ── JSON error response helper ──
function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Authentication (graceful — accepts JWT or anon key) ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Authentication required", 401);
    }

    let rateLimitId = getClientId(req);

    // Try to verify JWT for user-level rate limiting
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
      }
    } catch {
      // Auth verification failed — continue with IP-based rate limiting
    }

    // Rate limit by user ID or IP
    if (!checkRateLimit(rateLimitId)) {
      return jsonError("Rate limit exceeded. Please wait a minute before trying again.", 429);
    }

    // Parse body
    let body: unknown;
    try { body = await req.json(); } catch {
      return jsonError("Invalid JSON request body", 400);
    }

    // Validate
    const validation = validateRequest(body);
    if (!validation.valid) return jsonError(validation.error, validation.status);

    const { type, messages, context } = validation.data;

    // API key check
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonError("AI service is not properly configured", 503);
    }

    // Build prompt
    const lang = context?.language?.split("-")[0] || "en";
    const systemPrompt = buildSystemPrompt(type, context, lang);
    const tuning = MODEL_TUNING[type];

    console.log(`[AI] type=${type} lang=${lang} temp=${tuning.temperature} max_tokens=${tuning.max_tokens}`);

    // ── Call Lovable AI (Gemini) ──
    const MAX_RETRIES = 2;
    let lastStatus = 500;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              ...(messages || []),
            ],
            stream: true,
            temperature: tuning.temperature,
            max_tokens: tuning.max_tokens,
          }),
        });

        if (response.ok) {
          return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }

        lastStatus = response.status;

        // Non-retryable errors
        if (response.status === 429) return jsonError("Rate limit exceeded, please try again later", 429);
        if (response.status === 402) return jsonError("AI usage limit reached. Please add credits to continue.", 402);

        // Retryable server errors
        if ([502, 503, 504].includes(response.status) && attempt < MAX_RETRIES) {
          console.log(`[AI] ${response.status} retry ${attempt + 1}/${MAX_RETRIES}`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }

        const errText = await response.text();
        console.error(`[AI] error: ${response.status}`, errText.substring(0, 200));
        break;
      } catch (fetchError) {
        if (attempt < MAX_RETRIES) {
          console.log(`[AI] fetch error, retry ${attempt + 1}/${MAX_RETRIES}`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        console.error("[AI] failed after retries:", String(fetchError).substring(0, 200));
        break;
      }
    }

    return jsonError("AI service temporarily unavailable. Please try again in a moment.", lastStatus >= 500 ? 503 : lastStatus);
  } catch (error) {
    console.error("[AI] unexpected error:", error);
    return jsonError("An unexpected error occurred. Please try again.", 500);
  }
});
