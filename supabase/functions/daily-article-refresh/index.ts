import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ARTICLE_SEED_REGISTRY = [
  { slug: "fertility-window-guide", section: "planning", type: "article", tags: ["fertility", "timing", "cycle-awareness"], titles: { ar: "نافذة الخصوبة بوضوح", en: "Understanding your fertility window", de: "Das Fruchtbarkeitsfenster verstehen", fr: "Comprendre la fenêtre de fertilité", es: "Entender la ventana fértil", tr: "Doğurganlık dönemini anlamak", pt: "Entender a janela fértil" } },
  { slug: "cycle-quality-signals", section: "planning", type: "research", tags: ["cycle-awareness", "patterns", "tracking"], titles: { ar: "إشارات جودة الدورة", en: "Cycle quality signals", de: "Signale der Zyklusqualität", fr: "Signaux de qualité du cycle", es: "Señales de calidad del ciclo", tr: "Döngü kalitesi sinyalleri", pt: "Sinais de qualidade do ciclo" } },
  { slug: "preconception-nutrition-readiness", section: "planning", type: "article", tags: ["nutrition", "readiness", "vitamins"], titles: { ar: "الاستعداد الغذائي قبل الحمل", en: "Nutrition readiness before pregnancy", de: "Ernährungsstart vor der Schwangerschaft", fr: "Préparer la nutrition avant la grossesse", es: "Preparación nutricional antes del embarazo", tr: "Hamilelik öncesi beslenme hazırlığı", pt: "Preparação nutricional antes da gravidez" } },
  { slug: "sleep-and-fertility", section: "planning", type: "research", tags: ["sleep", "fertility", "routine"], titles: { ar: "النوم ودوره في الخصوبة", en: "Sleep and fertility balance", de: "Schlaf und Fruchtbarkeit im Gleichgewicht", fr: "Sommeil et équilibre de fertilité", es: "Sueño y equilibrio de la fertilidad", tr: "Uyku ve doğurganlık dengesi", pt: "Sono e equilíbrio da fertilidade" } },
  { slug: "when-to-use-cycle-tracking", section: "planning", type: "article", tags: ["tracking", "cycle-awareness", "planning"], titles: { ar: "متى يفيد تتبع الدورة فعلاً؟", en: "When cycle tracking helps most", de: "Wann Zyklustracking am meisten hilft", fr: "Quand le suivi du cycle aide le plus", es: "Cuándo ayuda más seguir el ciclo", tr: "Döngü takibi en çok ne zaman fayda sağlar", pt: "Quando o acompanhamento do ciclo ajuda mais" } },
  { slug: "ovulation-practical-guide", section: "planning", type: "article", tags: ["ovulation", "timing", "planning"], titles: { ar: "فهم الإباضة بشكل عملي", en: "A practical guide to ovulation", de: "Ovulation praktisch verstehen", fr: "Comprendre l’ovulation de façon pratique", es: "Entender la ovulación de forma práctica", tr: "Yumurtlamayı pratik şekilde anlamak", pt: "Entender a ovulação de forma prática" } },
  { slug: "emotional-planning-before-pregnancy", section: "planning", type: "article", tags: ["mindset", "planning", "support"], titles: { ar: "الاستعداد النفسي قبل الحمل", en: "Emotional planning before pregnancy", de: "Mentale Vorbereitung vor der Schwangerschaft", fr: "Préparation émotionnelle avant la grossesse", es: "Preparación emocional antes del embarazo", tr: "Hamilelik öncesi duygusal hazırlık", pt: "Planejamento emocional antes da gravidez" } },
  { slug: "common-trying-to-conceive-mistakes", section: "planning", type: "article", tags: ["mistakes", "planning", "fertility"], titles: { ar: "أخطاء شائعة عند محاولة الحمل", en: "Common mistakes while trying to conceive", de: "Häufige Fehler beim Kinderwunsch", fr: "Erreurs fréquentes quand on essaie de concevoir", es: "Errores comunes al intentar concebir", tr: "Hamile kalmaya çalışırken yapılan yaygın hatalar", pt: "Erros comuns ao tentar engravidar" } },
  { slug: "daily-routine-discovery", section: "planning", type: "discovery", tags: ["routine", "sleep", "readiness"], titles: { ar: "اكتشاف: الروتين اليومي يصنع فرقاً", en: "Discovery: daily routine matters more", de: "Entdeckung: Die tägliche Routine zählt", fr: "Découverte : la routine quotidienne compte", es: "Descubrimiento: la rutina diaria sí importa", tr: "Keşif: günlük rutin gerçekten etkili", pt: "Descoberta: a rotina diária faz diferença" } },
  { slug: "micronutrients-for-conception", section: "planning", type: "research", tags: ["nutrition", "vitamins", "research"], titles: { ar: "بحث مبسط: المغذيات الدقيقة", en: "Research brief: micronutrients for conception", de: "Kurz erklärt: Mikronährstoffe bei Kinderwunsch", fr: "Recherche simple : micronutriments et conception", es: "Investigación simple: micronutrientes y concepción", tr: "Kısa araştırma: gebe kalma için mikro besinler", pt: "Pesquisa simples: micronutrientes para concepção" } },
  { slug: "decision-from-tracking-to-plan", section: "planning", type: "article", tags: ["decision-making", "tracking", "planning"], titles: { ar: "من التتبع إلى الخطة", en: "From tracking to a clear plan", de: "Vom Tracking zum klaren Plan", fr: "Du suivi à un plan clair", es: "Del seguimiento a un plan claro", tr: "Takipten net bir plana", pt: "Do acompanhamento para um plano claro" } },
] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_LANGS = ["ar", "en", "de", "fr", "es", "tr", "pt"] as const;

const buildPrompt = (seed: (typeof ARTICLE_SEED_REGISTRY)[number], lang: string) => {
  const title = seed.titles[lang as keyof typeof seed.titles] || seed.titles.en;
  return `Write a rich, practical, medically careful article in ${lang} for the topic "${title}".

Requirements:
- Audience: women using a pregnancy and fertility wellness app
- Length: 700-1000 words
- Tone: practical, clear, warm, non-diagnostic
- Structure:
  1) short compelling intro
  2) 4 to 6 markdown sections with ## headings
  3) concise practical closing
- Must stay tightly focused on the exact topic
- Avoid filler, generic intros, and repeated template phrases
- Include actionable insights tied to daily decisions
- Return valid JSON with keys: title_override, excerpt_override, intro_override, markdown_body, seo_description, reading_minutes`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey || !lovableApiKey) {
    return new Response(JSON.stringify({ error: "Missing backend configuration" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const body = await req.json().catch(() => ({}));
  const slugs = Array.isArray(body.slugs) && body.slugs.length ? new Set(body.slugs as string[]) : null;
  const languages = Array.isArray(body.languages) && body.languages.length ? (body.languages as string[]) : [...SUPPORTED_LANGS];
  const effectiveDate = typeof body.effectiveDate === "string" ? body.effectiveDate : new Date().toISOString().slice(0, 10);

  const runInsert = await admin.from("article_refresh_runs").insert({
    run_date: effectiveDate,
    status: "started",
    source_model: "google/gemini-2.5-pro",
    languages,
  }).select("id").single();

  const runId = runInsert.data?.id;
  let processedCount = 0;

  try {
    const targets = ARTICLE_SEED_REGISTRY.filter((seed) => !slugs || slugs.has(seed.slug));

    for (const seed of targets) {
      for (const lang of languages) {
        const prompt = buildPrompt(seed, lang);
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            temperature: 0.3,
            max_tokens: 2200,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: "You are a multilingual health editorial writer. Respond only with JSON." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!aiRes.ok) throw new Error(`AI generation failed for ${seed.slug}/${lang}`);
        const aiData = await aiRes.json();
        const raw = aiData.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw);

        await admin.from("article_daily_content").upsert({
          slug: seed.slug,
          language: lang,
          title_override: parsed.title_override ?? null,
          excerpt_override: parsed.excerpt_override ?? null,
          intro_override: parsed.intro_override ?? null,
          markdown_body: parsed.markdown_body,
          seo_description: parsed.seo_description ?? null,
          reading_minutes: parsed.reading_minutes ?? null,
          effective_date: effectiveDate,
          is_published: true,
        }, { onConflict: "slug,language,effective_date" });

        processedCount += 1;
      }
    }

    if (runId) {
      await admin.from("article_refresh_runs").update({
        status: "completed",
        processed_count: processedCount,
        finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ ok: true, processedCount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    if (runId) {
      await admin.from("article_refresh_runs").update({
        status: "failed",
        processed_count: processedCount,
        error_message: error instanceof Error ? error.message : String(error),
        finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});