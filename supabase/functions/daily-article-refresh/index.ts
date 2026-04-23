import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ARTICLE_SEED_REGISTRY } from "./article-seed-registry.ts";

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