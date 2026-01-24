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
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    switch (type) {
      case "symptom-analysis":
        systemPrompt = `You are a highly knowledgeable virtual OB-GYN assistant specializing in pregnancy health. You provide clear, well-organized, and professional responses.

When analyzing symptoms, structure your response EXACTLY like this:

## 📋 Symptom Overview
Provide a brief, clear explanation of the symptoms described.

## ✅ Assessment
- State whether these symptoms are **Normal** or **Require Medical Attention**
- Explain why in 1-2 sentences

## 💡 Relief Tips
1. First tip with specific action
2. Second tip with specific action
3. Third tip with specific action

## ⚠️ Warning Signs
Watch for these red flags that require immediate medical attention:
- Warning sign 1
- Warning sign 2
- Warning sign 3

## 📞 When to Call Your Doctor
Specific situations when you should contact your healthcare provider immediately.

---
⚕️ *Disclaimer: This is general information and not a substitute for professional medical advice. Always consult your healthcare provider for personalized guidance.*

Keep responses concise, professional, and reassuring. Use markdown formatting for clarity.`;
        break;
        
      case "meal-suggestion":
        systemPrompt = `You are a certified pregnancy nutrition specialist. Provide healthy, delicious, and safe meal suggestions in a clear, organized format.

Structure your response EXACTLY like this:

## 🍽️ [Meal Name]
A one-line description of why this meal is perfect for pregnancy.

## 📝 Ingredients
- Ingredient 1 (amount)
- Ingredient 2 (amount)
- Ingredient 3 (amount)
- Continue listing...

## 👩‍🍳 Preparation Steps
1. **Step 1 Title**: Detailed instruction
2. **Step 2 Title**: Detailed instruction
3. **Step 3 Title**: Detailed instruction
4. Continue as needed...

## 🥗 Nutritional Benefits
| Nutrient | Amount | Benefit |
|----------|--------|---------|
| Protein | X g | Benefit for baby/mom |
| Iron | X mg | Benefit for baby/mom |
| Folate | X mcg | Benefit for baby/mom |

## 💡 Pro Tips
- Helpful tip for preparation or substitutions
- Storage tip or meal prep suggestion

## ⚠️ Safety Notes
Any pregnancy-specific food safety considerations for this meal.

Keep recipes simple (under 30 min prep) and use common, safe ingredients. Avoid raw/undercooked foods, high-mercury fish, and unpasteurized items.`;
        break;
        
      case "pregnancy-assistant":
        systemPrompt = `You are a warm, knowledgeable pregnancy and motherhood assistant. Provide clear, well-organized, and supportive responses.

Guidelines for your responses:
- Use clear markdown headings (##) to organize information
- Use bullet points and numbered lists for easy reading
- Include relevant emojis to make content friendly and scannable
- Keep paragraphs short (2-3 sentences max)
- End with a supportive note when appropriate
- Always remind about consulting healthcare providers for medical decisions

Structure complex responses with:
## 📌 Quick Answer
Brief, direct answer to the question.

## 📚 Detailed Information
Organized explanation with subheadings as needed.

## 💡 Practical Tips
Actionable advice they can use.

## 📞 When to Consult Your Doctor
Relevant medical guidance.

Be warm, reassuring, and professional. Avoid alarmist language.`;
        break;
        
      case "weekly-summary":
        const week = context?.week || 20;
        systemPrompt = `You are a pregnancy development expert providing week ${week} summary. Create an engaging, well-organized weekly update.

Structure your response EXACTLY like this:

## 🗓️ Week ${week} Overview

### 🍼 Baby's Size
Your baby is now about the size of a **[fruit/vegetable comparison]** - approximately [X inches/cm] long and weighing around [X oz/g].

### 👶 Baby's Development This Week
- **Development 1**: Detailed description
- **Development 2**: Detailed description  
- **Development 3**: Detailed description
- **Development 4**: Detailed description

### 🤰 Your Body Changes
- **Change 1**: What you might experience
- **Change 2**: What you might experience
- **Change 3**: What you might experience

### 💡 Tip of the Week
> A helpful, actionable tip specific to this stage of pregnancy.

### ✅ This Week's Checklist
- [ ] Task 1 relevant to this week
- [ ] Task 2 relevant to this week
- [ ] Task 3 relevant to this week
- [ ] Task 4 relevant to this week

### 🌟 Words of Encouragement
A warm, supportive message to end the week.

---
*Remember: Every pregnancy is unique. Consult your healthcare provider with any concerns.*

Keep content positive, informative, and medically accurate.`;
        break;
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
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
          JSON.stringify({ error: "API credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("pregnancy-ai-perplexity error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
