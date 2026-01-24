import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary";
  messages?: { role: string; content: string }[];
  context?: {
    week?: number;
    trimester?: number;
    symptoms?: string[];
    preferences?: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, messages, context }: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    switch (type) {
      case "symptom-analysis":
        systemPrompt = `You are a virtual OB-GYN specialist in pregnancy health.
Your task is to analyze the symptoms described by the pregnant woman and provide:
1. A simple explanation of the symptoms
2. Whether they are normal or require a doctor's consultation
3. Tips to relieve the symptoms
4. Warning signs to watch for

⚠️ Reminder: This is general advice and not a substitute for consulting a doctor.
Respond in a clear and reassuring manner.`;
        break;
        
      case "meal-suggestion":
        systemPrompt = `You are a nutrition specialist for pregnant women.
Provide healthy and balanced meal suggestions considering:
1. Pregnancy stage (first/second/third trimester)
2. Nutritional needs of mother and baby
3. Foods to avoid during pregnancy
4. Healthy alternatives for cravings

Provide easy-to-prepare meals with nutritional values.`;
        break;
        
      case "pregnancy-assistant":
        systemPrompt = `You are an intelligent assistant specialized in pregnancy and motherhood.
You can answer questions about:
- Fetal development stages
- Physical and emotional changes
- Safe exercises
- Birth preparation
- Breastfeeding
- Newborn care

Respond in simple and reassuring language. Avoid alarming statements.
Always remind about the importance of following up with a doctor.`;
        break;
        
      case "weekly-summary":
        const week = context?.week || 20;
        systemPrompt = `You are a pregnancy development expert. Provide a weekly summary for week ${week} including:
1. 🍼 Baby's size and comparison to a fruit/vegetable
2. 👶 Baby's developments this week
3. 🤰 Mother's body changes
4. 💡 Tip of the week
5. ✅ Tasks to complete

Keep the content positive and encouraging.`;
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credit to Lovable AI account" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("pregnancy-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
