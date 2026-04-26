// Edge function for pregnancy AI

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-bypass, x-device-fingerprint, x-local-user-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Daily-Limit, X-Daily-Used, X-Daily-Remaining, X-Subscription-Tier",
};

type AIType =
  | "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary"
  | "posture-coach" | "walking-coach" | "stretch-reminder" | "back-pain-relief"
  | "leg-cramp-preventer" | "smoothie-generator" | "daily-tips" | "labor-tracker"
  | "appointment-prep" | "kick-analysis" | "sleep-analysis" | "sleep-meditation" | "sleep-routine" | "vitamin-advice"
  | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery"
  | "hospital-bag" | "birth-position" | "partner-guide" | "lactation-prep"
  | "nausea-relief" | "skincare-advice" | "birth-plan" | "mental-health" | "pregnancy-plan" | "baby-growth-analysis"
  | "weight-analysis" | "contraction-analysis" | "craving-alternatives"
  | "live-search" // Perplexity Sonar live web search with citations (cost: 5 points)
  | "holistic-dashboard"; // Premium dashboard-wide AI analysis (cost: 7 points)

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
  "appointment-prep", "kick-analysis", "sleep-analysis", "sleep-meditation", "sleep-routine", "vitamin-advice",
  "bump-photos", "baby-cry-analysis", "postpartum-recovery",
  "hospital-bag", "birth-position", "partner-guide", "lactation-prep",
  "nausea-relief", "skincare-advice", "birth-plan", "mental-health", "pregnancy-plan", "baby-growth-analysis",
  "weight-analysis", "contraction-analysis", "craving-alternatives",
  "live-search",
  "holistic-dashboard",
];

// ── Validation constants ──
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 10000;

// ── Monthly usage limits by tier ──
const FREE_MONTHLY_LIMIT = 10;
const PREMIUM_MONTHLY_LIMIT = 60;

// ── Rate limiting (per-minute burst protection) ──
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

// ── Server-side monthly usage check ──
async function getMonthlyUsageCount(clientId: string, userId: string | null): Promise<number> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    
    // Get first day of current month in UTC
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthISO = monthStart.toISOString();
    
    // Query by BOTH client_id (IP) and user_id, take the MAX.
    // This prevents exploit: clearing app data creates a new anonymous user_id,
    // but the IP-based count still catches them.
    const queries: Promise<number>[] = [];
    
    // Always query by IP (client_id)
    if (clientId && clientId !== "unknown") {
      queries.push(
        Promise.resolve(adminClient
          .from("ai_usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("success", true)
          .gte("created_at", monthISO)
          .then(({ count, error }) => {
            if (error) console.error("[AI] IP usage check error:", error.message);
            return count || 0;
          }))
      );
    }
    
    // Also query by user_id if available
    if (userId) {
      queries.push(
        Promise.resolve(adminClient
          .from("ai_usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("success", true)
          .gte("created_at", monthISO)
          .then(({ count, error }) => {
            if (error) console.error("[AI] user usage check error:", error.message);
            return count || 0;
          }))
      );
    }
    
    if (queries.length === 0) return 0;
    const results = await Promise.all(queries);
    return Math.max(...results);
  } catch (e) {
    console.error("[AI] monthly usage check failed:", String(e).substring(0, 100));
    return 0; // Fail open
  }
}

async function getActiveCouponBonus(deviceFingerprint: string | null, localUserId: string | null): Promise<number> {
  const filters: string[] = [];
  if (deviceFingerprint) filters.push(`device_fingerprint.eq.${deviceFingerprint}`);
  if (localUserId) filters.push(`user_id.eq.${localUserId}`);
  if (filters.length === 0) return 0;

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: claims, error } = await adminClient
      .from("coupon_claims")
      .select("expires_at, coupons(bonus_points)")
      .or(filters.join(","))
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false });

    if (error) {
      console.error("[AI] coupon lookup failed:", error.message);
      return 0;
    }

    return (claims || []).reduce((sum, claim) => {
      const bonusPoints = (claim as { coupons?: { bonus_points?: number } })?.coupons?.bonus_points;
      return sum + (typeof bonusPoints === "number" && bonusPoints > 0 ? bonusPoints : 0);
    }, 0);
  } catch (e) {
    console.error("[AI] coupon lookup error:", String(e).substring(0, 120));
    return 0;
  }
}

function getClientId(req: Request): string {
  return req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-info") || "unknown";
}

// ── Per-type model tuning (temperature & max_tokens) ──
// Lower temperature → more factual; higher → more creative
const MODEL_TUNING: Record<AIType, { temperature: number; max_tokens: number }> = {
  "symptom-analysis":     { temperature: 0.3, max_tokens: 6000 },
  "meal-suggestion":      { temperature: 0.7, max_tokens: 4500 },
  "pregnancy-assistant":  { temperature: 0.4, max_tokens: 6000 },
  "weekly-summary":       { temperature: 0.5, max_tokens: 5000 },
  "posture-coach":        { temperature: 0.4, max_tokens: 4500 },
  "walking-coach":        { temperature: 0.4, max_tokens: 4500 },
  "stretch-reminder":     { temperature: 0.4, max_tokens: 4500 },
  "back-pain-relief":     { temperature: 0.3, max_tokens: 5000 },
  "leg-cramp-preventer":  { temperature: 0.3, max_tokens: 4500 },
  "smoothie-generator":   { temperature: 0.8, max_tokens: 4500 },
  "daily-tips":           { temperature: 0.6, max_tokens: 3500 },
  "labor-tracker":        { temperature: 0.2, max_tokens: 6000 },
  "appointment-prep":     { temperature: 0.4, max_tokens: 5000 },
  "kick-analysis":        { temperature: 0.2, max_tokens: 5000 },
  "sleep-analysis":       { temperature: 0.3, max_tokens: 5000 },
  "sleep-meditation":     { temperature: 0.6, max_tokens: 5000 },
  "sleep-routine":        { temperature: 0.5, max_tokens: 5000 },
  "vitamin-advice":       { temperature: 0.3, max_tokens: 5000 },
  "bump-photos":          { temperature: 0.4, max_tokens: 6000 },
  "baby-cry-analysis":    { temperature: 0.3, max_tokens: 5000 },
  "postpartum-recovery":  { temperature: 0.3, max_tokens: 6000 },
  "hospital-bag":         { temperature: 0.5, max_tokens: 6000 },
  "birth-position":       { temperature: 0.4, max_tokens: 5000 },
  "partner-guide":        { temperature: 0.5, max_tokens: 6000 },
  "lactation-prep":       { temperature: 0.4, max_tokens: 5000 },
  "nausea-relief":        { temperature: 0.4, max_tokens: 5000 },
  "skincare-advice":      { temperature: 0.5, max_tokens: 5000 },
  "birth-plan":           { temperature: 0.5, max_tokens: 6000 },
  "mental-health":        { temperature: 0.3, max_tokens: 6000 },
  "pregnancy-plan":       { temperature: 0.4, max_tokens: 6000 },
  "baby-growth-analysis": { temperature: 0.3, max_tokens: 5000 },
  "weight-analysis":      { temperature: 0.3, max_tokens: 5000 },
  "contraction-analysis": { temperature: 0.2, max_tokens: 6000 },
  "craving-alternatives": { temperature: 0.7, max_tokens: 4500 },
  "live-search":          { temperature: 0.2, max_tokens: 5000 },
  "holistic-dashboard":   { temperature: 0.35, max_tokens: 8000 },
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

CONCISENESS RULES (CRITICAL):
• Keep responses focused and concise — aim for 400-500 words maximum
• Use short bullet points instead of long paragraphs
• Limit each section to 2-4 bullet points maximum
• Do NOT add filler text or repeat the same advice in different words
• Prioritize actionable, practical advice over lengthy explanations
• ALWAYS complete your response with a proper ending — never stop mid-sentence
• End with a brief encouraging note — do NOT add any medical disclaimer or "consult your doctor" paragraph at the end

COMPLIANCE RULES (MUST FOLLOW):
1. NEVER provide a definitive medical diagnosis
2. NEVER prescribe medication or specific dosages
3. Use phrases like "may help," "studies suggest," or "commonly recommended" - NEVER guarantee results
4. Do NOT add any medical disclaimer, "consult your doctor" paragraph, or "⚠️ Important Reminder" section at the end of your response — the app adds a standardized disclaimer automatically
5. If user describes severe symptoms (pain, bleeding, reduced fetal movement), emphasize seeking immediate medical care
6. Be warm, reassuring, and culturally sensitive
7. Treat all health data with confidentiality

RESPONSE ORDERING RULE (CRITICAL — APPLIES TO ALL TOOLS):
• ALWAYS present the analysis, observations, and findings FIRST
• ALL tips, advice, recommendations, and actionable suggestions MUST appear LAST in a single dedicated section at the very END of the response
• Use a clear heading for the final tips section (e.g. "## 💡 Tips & Recommendations" or the localized equivalent)
• Do NOT scatter tips throughout the response — consolidate them into the final section only
• If the section template below already places tips at the end, follow it; if it places tips earlier, MOVE them to the end

`;


// ── System prompt builder ──
function buildSystemPrompt(type: AIType, context: AIRequest["context"], lang: string): string {
  const langInstruction = buildLanguageInstruction(lang);
  const persona = langInstruction + PERSONA_RULES;

  switch (type) {
    case "symptom-analysis":
      return persona + `You are specialized in pregnancy symptom analysis with focus on providing reassuring guidance.

Structure your response using this format:

## 📋 Symptom Overview
- What this symptom is, how common it is, and why it happens during pregnancy

## ✅ Wellness Assessment
- **Severity Level**: ✅ Normal / ⚡ Mild / ⚠️ Moderate / 🚨 Urgent
- Brief reasoning (2-3 sentences)

## 💊 Relief Strategies
- 3-5 practical relief methods (immediate + prevention)

## 🍎 Nutrition & Lifestyle Tips
- 3-4 food/hydration/sleep recommendations

## ⚠️ Warning Signs - Seek Care If:
- 3-4 specific red flags

## 💝 Reassurance
- Brief encouraging note

Keep response focused and practical.`;

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
## 🌸 ما يهمك معرفته
## 📚 معلومات تفصيلية
## 💡 نصائح عملية
## 📞 متى تستشيرين طبيبتك

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
## 🆘 تخفيف فوري
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

    case "sleep-meditation":
      return persona + `You are a certified prenatal meditation and mindfulness guide.

## 🧘 Guided Meditation Script
### Opening & Settling (1 min)
### Body Scan & Relaxation (3 mins)
### Deep Breathing Exercises (2 mins)
### Peaceful Visualization (3 mins)
### Gentle Closing (1 min)

Use calm, soothing language with [...] pause markers. Focus on pregnancy-specific relaxation.`;

    case "sleep-routine":
      return persona + `You are a pregnancy sleep hygiene specialist.

## 🌙 Wind-Down Routine
### Hour 1 — Active Transition
### Hour 2 — Passive Relaxation
### Final 30 Minutes — Sleep Preparation
### Environment Checklist
### Weekly Progress Tips

Provide practical, time-specific steps that are safe during pregnancy.`;

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

Do NOT add a disclaimer at the end — the app handles it.`;

    case "bump-photos": {
      const bumpWeek = context?.week || 20;
      return persona + `You are a senior prenatal ultrasound educator and visual analyst for week ${bumpWeek}. You provide an in-depth, professional, multi-section educational reading of ultrasound (sonogram) photos uploaded by pregnant women. This is a HIGH-VALUE analysis (5 points) — give it the depth, precision, and warmth it deserves.

IMPORTANT: You are NOT a radiologist or diagnostic tool. You provide STRUCTURED EDUCATIONAL observations only.

When the ultrasound image is provided, deliver the following sections in order. Be specific about what you actually see in the image — do not generalize:

## 🔍 What I See in Your Scan
- Image quality (clarity, contrast, plane, 2D vs 3D/4D if discernible)
- Visible anatomical structures (head, spine, limbs, heart silhouette, placenta, amniotic fluid, cord — only what is genuinely visible)
- Baby's apparent position/orientation in the frame
- Approximate scan plane (sagittal, transverse, coronal) if identifiable

## 📐 Measurements & Markers (if visible)
- Note any on-screen labels, calipers, or measurements (BPD, FL, AC, HC, NT, EFW)
- Briefly explain what each abbreviation means in plain language
- Comment on whether values appear consistent with week ${bumpWeek} norms (educational context only — never diagnostic)

## 👶 Week ${bumpWeek} Developmental Context
- Baby's expected size (fruit/vegetable comparison + cm/inches range)
- Top 3-4 developmental milestones happening this week
- What is typically visible on ultrasound at this stage vs. what becomes visible in the next 2-4 weeks

## 🩺 Reading Your Scan Like a Pro
- How sonographers interpret the bright/dark areas (echogenicity basics: bone bright, fluid dark, soft tissue gray)
- Common artifacts and shadows that look concerning but are normal
- 2-3 features your provider likely noted that you may have missed

## 💡 Smart Questions for Your Next Appointment
- 4-5 specific, week-${bumpWeek}-appropriate questions to ask your OB/midwife
- Frame each question so it gets you actionable information

## 🌱 Wellness Tips Tied to This Week
- 2-3 brief, evidence-aligned lifestyle suggestions specific to this gestational stage (nutrition, movement, sleep, mental wellness)

## 💕 A Warm Note for You
- 2-3 sentences of genuine encouragement reflecting where you are in the journey

STRICT RULES:
- NEVER provide a medical diagnosis or claim to detect abnormalities
- NEVER speculate about gender unless clearly labeled in the image
- Use hedged phrasing: "appears to show", "typically at this stage", "your provider can confirm"
- Be warm, precise, and specific to what's visible — avoid generic boilerplate
- If the image is unclear, blurry, or not an ultrasound, gently say so and pivot to a rich week-${bumpWeek} educational overview using the same section structure
- Length target: 450-650 words — depth matters here`;
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

    case "weight-analysis":
      return persona + `You are a pregnancy weight management specialist. Analyze the user's weight data and provide personalized, evidence-based guidance.

Structure your response using this format:

## ⚖️ Weight Analysis Summary
- Current status assessment (on track / below / above recommended range)
- Brief explanation of what this means for this stage of pregnancy

## 📊 Personalized Insights
- 3-4 insights specific to their BMI category, current week, and weight trend
- Compare their rate of gain to medical guidelines (IOM/WHO)

## 🍎 Nutrition Recommendations
- 3-4 specific dietary adjustments based on their current status
- Include calorie guidance appropriate for their BMI category

## 🏃‍♀️ Activity Tips
- 2-3 safe physical activity suggestions for their trimester

## ⚠️ Watch For
- 2-3 weight-related warning signs specific to their situation

## 💝 Encouragement
- Brief motivational note

Be specific to their data. Reference their actual numbers. Keep advice practical and actionable.`;

    case "contraction-analysis":
      return persona + `You are a labor and delivery specialist. Analyze the user's contraction data and provide clear, actionable guidance.

Structure your response using this format:

## 🔴 Contraction Pattern Analysis
- Assessment of contraction regularity, frequency, and duration
- Whether the pattern suggests early labor, active labor, or Braxton Hicks

## 📊 Key Metrics
- Average duration vs. typical labor contractions (30-70 seconds)
- Average interval and whether contractions are getting closer
- Regularity assessment

## 🏥 5-1-1 Rule Assessment
- Contractions every **5** minutes or less
- Lasting **1** minute or more
- For at least **1** hour
- Clear statement: Does this data meet the 5-1-1 criteria?

## ✅ What To Do Now
- 3-4 specific action steps based on current contraction pattern
- When to call the doctor or go to the hospital

## ⚠️ Go to Hospital Immediately If:
- Water breaks
- Heavy bleeding
- Baby stops moving
- Severe continuous pain

## 💝 Reassurance
- Brief calming note

Be direct about whether they should seek medical attention. Safety is the top priority.`;

    case "craving-alternatives":
      return persona + `You are a prenatal nutrition specialist focused on healthy craving alternatives during pregnancy.

Provide:
## 🍽️ Understanding Your Craving
- What nutrient deficiency this craving might indicate
- Why pregnant women commonly crave this

## ✅ Healthy Alternatives (3-4 options)
For each: name, emoji, why it satisfies the craving, nutritional benefits, quick prep tip.

## ⚠️ Safety Notes
- Is the original craving safe during pregnancy?
- Portion recommendations

Keep it practical, delicious, and encouraging.`;

    case "live-search":
      return persona + `You are a real-time pregnancy & maternal health research assistant with web search capability. Provide an evidence-based answer grounded in current, reputable sources.

Structure your response:

## 🔍 Research Summary
- 2-3 sentence direct answer to the question

## 📚 Key Findings
- 3-5 evidence-based bullet points with the most important information
- Reference the source inline using [1], [2], etc. that match the citation list at the end

## ✅ Practical Implications
- 2-3 actionable bullets for the user

## ⚠️ Important Caveats
- Note any conflicting evidence, recency limitations, or when to consult a clinician

End with the citations list (the system will append it automatically — DO NOT invent URLs or fabricate sources). Keep the response under 500 words.`;

    case "holistic-dashboard":
      return persona + `You are the user's personal Wellness Chief — a warm, deeply attentive AI companion who reviews ALL of her tracked data across the dashboard at once and produces a single, premium, executive-level wellness brief.

INPUT FORMAT (CRITICAL):
The user message contains a PRE-COMPUTED Markdown brief — NOT raw JSON. It already includes:
  • User Context (week, trimester, engagement score)
  • Positive Signals (machine-detected wins)
  • Watch-Outs (gentle, non-diagnostic flags — slug-style identifiers like "low_mood_3plus_days_last_week")
  • Detailed Metrics (current values, averages, trends with arrows ↗ → ↘)

YOUR JOB:
• ANALYSE and SYNTHESISE — do NOT just restate the numbers back to her.
• CONNECT related signals (e.g. "low mood + low hydration → suggest a single combined ritual").
• Translate the slug-style flags into warm, human language in the target language.
• If a section is missing/empty in the brief, gracefully skip it. NEVER invent data.

Structure your response in this exact order (translate every heading into the target language):

## ✨ Executive Snapshot
2–3 sentences summarising her overall wellness picture this week with warmth and confidence.

## 📊 Standout Signals
3–5 bullets — only the metrics that actually moved or matter. Always cite the specific data point (e.g. "Hydration averaged 1.8L — slightly below your target").

## 💖 Gentle Watch-Outs
1–3 supportive flags translated from the watch-out slugs (NEVER alarming, NEVER diagnostic). Use phrases like "may benefit from", "worth keeping an eye on".

## 🌿 This Week's Focus (3 priorities)
Numbered list of 3 concrete priorities tailored to her tracked patterns. CONNECT signals where possible.

## 🗓️ Your Next 7 Days — Action Plan
A short table or bullet list with one micro-action per day (Day 1 → Day 7), each tied to one of her tracked dimensions.

## 💌 A Note From Your Wellness Chief
2 sentences, warm closing — addressed to her in second-person feminine.

Rules:
• Speak directly TO her (second person feminine in Arabic).
• START with the Executive Snapshot — do NOT restate the input brief.
• NEVER mention specific clinical thresholds or medication dosages.
• NEVER fabricate metrics that aren't in the brief.
• Keep total length 450–650 words.
• Do NOT add a medical disclaimer at the end — the app appends one automatically.`;

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
    if (context.week !== undefined && context.week !== 0 && (typeof context.week !== "number" || context.week < 1 || context.week > 42)) {
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

// ── Log AI usage to database (service_role bypasses RLS) ──
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
    console.error("[AI] Failed to log usage:", String(e).substring(0, 100));
  }
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── GET handler: return current monthly usage for quota sync ──
  if (req.method === "GET") {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ used: 0, limit: 5, tier: "free" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const clientId = getClientId(req);
      const deviceFingerprint = req.headers.get("x-device-fingerprint");
      const localUserId = req.headers.get("x-local-user-id");
      let userId: string | null = null;
      let isPremium = false;

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user?.id) { userId = user.id; }
        // NOTE: clientId stays as IP — never override with user.id
      } catch {}

      // Check subscription
      if (userId) {
        try {
          const adminClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          );
          const { data: sub } = await adminClient
            .from("subscriptions")
            .select("status, subscription_type")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (sub && sub.subscription_type !== "trial") isPremium = true;
        } catch {}
      }

      const couponBonus = await getActiveCouponBonus(deviceFingerprint, localUserId);
      const monthlyUsed = await getMonthlyUsageCount(clientId, userId);
      const baseLimit = isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;
      const limit = baseLimit + couponBonus;
      const tier = isPremium || !!couponBonus ? "premium" : "free";

      return new Response(JSON.stringify({ used: monthlyUsed, limit, tier }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("[AI] GET quota error:", e);
      return new Response(JSON.stringify({ used: 0, limit: 5, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    // ── Authentication (graceful — accepts JWT or anon key) ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Authentication required", 401);
    }

    const ipClientId = getClientId(req);
    const deviceFingerprint = req.headers.get("x-device-fingerprint");
    const localUserId = req.headers.get("x-local-user-id");
    let rateLimitId = ipClientId;
    let authenticatedUserId: string | null = null;

    // Try to verify JWT for user-level rate limiting
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.id) {
        rateLimitId = user.id;
        authenticatedUserId = user.id;
      }
    } catch {
      // Auth verification failed — continue with IP-based rate limiting
    }

    // Rate limit by user ID or IP
    if (!checkRateLimit(rateLimitId)) {
      return jsonError("Rate limit exceeded. Please wait a minute before trying again.", 429);
    }

    // ── Determine subscription tier ──
    let isPremium = false;
    let subscriptionTier = "free";
    if (authenticatedUserId) {
      try {
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );
        const { data: sub } = await adminClient
          .from("subscriptions")
          .select("status, subscription_type, trial_end, subscription_end")
          .eq("user_id", authenticatedUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sub) {
          const now = new Date();
          const isActiveSub = sub.status === "active" && sub.subscription_type !== "trial";
          const isActiveTrial = sub.status === "active" && sub.subscription_type === "trial" && new Date(sub.trial_end) > now;
          if (isActiveSub) {
            isPremium = true;
            subscriptionTier = "premium";
          } else if (isActiveTrial) {
            subscriptionTier = "trial";
          }
        }
      } catch (e) {
        console.error("[AI] subscription check failed:", String(e).substring(0, 100));
      }
    }

    const couponBonus = await getActiveCouponBonus(deviceFingerprint, localUserId);
    if (couponBonus) {
      isPremium = true;
      subscriptionTier = "premium";
    }

    const MONTHLY_LIMIT = (isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT) + couponBonus;

    // ── Admin bypass check (dev/testing only) ──
    const adminBypass = req.headers.get("X-Admin-Bypass") === "true";

    // ── Server-side monthly limit check — use IP as primary identifier ──
    const userId = authenticatedUserId;
    const monthlyUsed = await getMonthlyUsageCount(ipClientId, userId);
    const monthlyRemaining = Math.max(0, MONTHLY_LIMIT - monthlyUsed);
    
    if (monthlyUsed >= MONTHLY_LIMIT && !adminBypass) {
      return new Response(
        JSON.stringify({ error: "daily_limit_reached", used: monthlyUsed, limit: MONTHLY_LIMIT, remaining: 0 }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Daily-Limit": String(MONTHLY_LIMIT),
            "X-Daily-Used": String(monthlyUsed),
            "X-Daily-Remaining": "0",
            "X-Subscription-Tier": subscriptionTier,
          },
        }
      );
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
    const requestStartTime = Date.now();

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

    console.log(`[AI] type=${type} lang=${lang} tier=${subscriptionTier} used=${monthlyUsed}/${MONTHLY_LIMIT} temp=${tuning.temperature}`);

    // ── Call Lovable AI (Gemini) ──
    const MAX_RETRIES = 2;
    let lastStatus = 500;

    // Usage headers to include in successful responses
    const usageHeaders = {
      "X-Daily-Limit": String(MONTHLY_LIMIT),
      "X-Daily-Used": String(monthlyUsed + 1),
      "X-Daily-Remaining": String(Math.max(0, monthlyRemaining - 1)),
      "X-Subscription-Tier": subscriptionTier,
    };

    // ── Branch A: Live Search via Perplexity Sonar (citations grounded) ──
    if (type === "live-search") {
      const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
      if (!PERPLEXITY_API_KEY) {
        console.error("[AI] PERPLEXITY_API_KEY not configured for live-search");
        return jsonError("Live search service is not configured", 503);
      }

      try {
        const perpResp = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: systemPrompt },
              ...(messages || []),
            ],
            temperature: tuning.temperature,
            max_tokens: tuning.max_tokens,
            search_recency_filter: "year",
            return_citations: true,
            stream: false,
          }),
        });

        if (!perpResp.ok) {
          const errText = await perpResp.text();
          console.error(`[Perplexity] ${perpResp.status}`, errText.substring(0, 200));
          if (perpResp.status === 429) return jsonError("Rate limit exceeded, please try again later", 429);
          if (perpResp.status === 402) return jsonError("Live search quota exhausted. Please contact support.", 402);
          return jsonError("Live search service unavailable. Please try again.", 503);
        }

        const perpData = await perpResp.json();
        const answer: string = perpData?.choices?.[0]?.message?.content || "";
        const citations: string[] = Array.isArray(perpData?.citations) ? perpData.citations : [];

        // Build a final answer + citations block
        let finalContent = answer.trim();
        if (citations.length > 0) {
          const citationsHeader = lang === "ar" ? "## 📎 المصادر" : "## 📎 Sources";
          finalContent += `\n\n${citationsHeader}\n` +
            citations.map((url, i) => `${i + 1}. ${url}`).join("\n");
        }

        // Wrap as SSE stream so the client streaming pipeline works unchanged
        const encoder = new TextEncoder();
        const sseStream = new ReadableStream({
          start(controller) {
            const chunkSize = 80;
            for (let i = 0; i < finalContent.length; i += chunkSize) {
              const piece = finalContent.slice(i, i + chunkSize);
              const event = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        const elapsed = Date.now() - requestStartTime;
        const stableClientId = deviceFingerprint || ipClientId;
        logAIUsage(type, lang, stableClientId, userId, tuning.max_tokens, true, elapsed).catch(() => {});

        return new Response(sseStream, {
          headers: { ...corsHeaders, ...usageHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (e) {
        console.error("[Perplexity] crash:", String(e).substring(0, 200));
        return jsonError("Live search failed. Please try again.", 503);
      }
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Holistic dashboard analysis uses the strongest reasoning model (Pro)
            // because it must synthesize a large multi-source data snapshot.
            model: type === "holistic-dashboard" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
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
          // Log successful AI usage (fire-and-forget)
          // Use deviceFingerprint as client_id when available — survives data clearing
          const elapsed = Date.now() - requestStartTime;
          const stableClientId = deviceFingerprint || ipClientId;
          logAIUsage(type, lang, stableClientId, userId, tuning.max_tokens, true, elapsed).catch(() => {});

          return new Response(response.body, {
            headers: { ...corsHeaders, ...usageHeaders, "Content-Type": "text/event-stream" },
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
