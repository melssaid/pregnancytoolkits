import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entries, targetLang } = await req.json();
    
    if (!entries || !targetLang) {
      return new Response(JSON.stringify({ error: "entries and targetLang required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const pairs = entries.map((e: {path: string, value: string}) => 
      `"${e.path}": "${e.value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    ).join(',\n');

    const prompt = `Translate these UI strings from English to ${targetLang}. Return ONLY a valid JSON object with the same keys and translated values. Keep {{variables}}, emojis, HTML tags, numbers, and units unchanged. Context: pregnancy/maternal health mobile app.

{
${pairs}
}`;

    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a professional translator for a pregnancy health app. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "No JSON in response", raw: content.substring(0, 300) }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const translated = JSON.parse(jsonMatch[0]);
    
    return new Response(JSON.stringify({ translations: translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
