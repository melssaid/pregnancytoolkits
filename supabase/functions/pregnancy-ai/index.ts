import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid request types (allowlist)
const VALID_TYPES = [
  "symptom-analysis",
  "meal-suggestion", 
  "pregnancy-assistant",
  "weekly-summary"
] as const;

type RequestType = typeof VALID_TYPES[number];

// Security constants
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 10000; // 10KB max
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(req: Request): string {
  // Use combination of IP and user agent for client identification
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(identifier);

  // Cleanup old entries periodically
  if (rateLimitStore.size > 1000) {
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, value] of entries) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!clientData || clientData.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  clientData.count++;
  return true;
}

interface AIRequest {
  type: RequestType;
  messages?: { role: string; content: string }[];
  context?: {
    week?: number;
    trimester?: number;
    symptoms?: string[];
    preferences?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(clientId)) {
      console.warn(`Rate limit exceeded for client: ${clientId.substring(0, 20)}...`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, messages, context } = requestBody as AIRequest;

    // Validate type (allowlist check)
    if (!type || !VALID_TYPES.includes(type as RequestType)) {
      console.warn(`Invalid request type: ${type}`);
      return new Response(
        JSON.stringify({ error: "Invalid request type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate messages array
    if (messages !== undefined) {
      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Messages must be an array" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (messages.length > MAX_MESSAGES) {
        return new Response(
          JSON.stringify({ error: `Maximum ${MAX_MESSAGES} messages allowed` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate message structure and content length
      let totalLength = 0;
      for (const msg of messages) {
        if (typeof msg.role !== "string" || typeof msg.content !== "string") {
          return new Response(
            JSON.stringify({ error: "Invalid message structure" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        totalLength += msg.content.length;
      }

      if (totalLength > MAX_CONTENT_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate context
    if (context?.week !== undefined) {
      if (typeof context.week !== "number" || context.week < 1 || context.week > 42) {
        return new Response(
          JSON.stringify({ error: "Week must be a number between 1 and 42" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get API key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on type
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

    console.log(`Processing ${type} request for client ${clientId.substring(0, 20)}...`);

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
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
