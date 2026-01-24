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
        systemPrompt = `أنت طبيب نساء وتوليد افتراضي متخصص في صحة الحمل. 
مهمتك تحليل الأعراض التي تصفها المرأة الحامل وتقديم:
1. شرح مبسط للأعراض
2. هل هي طبيعية أم تحتاج استشارة طبيب
3. نصائح للتخفيف من الأعراض
4. علامات تحذيرية يجب الانتباه لها

⚠️ تذكير: هذه نصائح عامة وليست بديلاً عن استشارة الطبيب.
أجب بالعربية بشكل واضح ومطمئن.`;
        break;
        
      case "meal-suggestion":
        systemPrompt = `أنت أخصائي تغذية متخصص في تغذية الحوامل.
قدم اقتراحات وجبات صحية ومتوازنة مع مراعاة:
1. مرحلة الحمل (الثلث الأول/الثاني/الثالث)
2. الاحتياجات الغذائية للأم والجنين
3. الأطعمة الممنوعة أثناء الحمل
4. بدائل صحية للرغبات الشديدة

قدم وجبات سهلة التحضير مع القيم الغذائية.
أجب بالعربية.`;
        break;
        
      case "pregnancy-assistant":
        systemPrompt = `أنت مساعد ذكي متخصص في الحمل والأمومة.
يمكنك الإجابة على أسئلة حول:
- مراحل نمو الجنين
- التغيرات الجسدية والنفسية
- التمارين الآمنة
- التحضير للولادة
- الرضاعة الطبيعية
- العناية بالمولود

أجب بلغة بسيطة ومطمئنة. تجنب التخويف.
ذكّري دائماً بأهمية متابعة الطبيب.
أجب بالعربية.`;
        break;
        
      case "weekly-summary":
        const week = context?.week || 20;
        systemPrompt = `أنت خبير في تطور الحمل. قدم ملخص أسبوعي للأسبوع ${week} يتضمن:
1. 🍼 حجم الجنين ومقارنة بفاكهة/خضار
2. 👶 تطورات الجنين هذا الأسبوع
3. 🤰 تغيرات جسم الأم
4. 💡 نصيحة الأسبوع
5. ✅ مهام يجب إنجازها

اجعل المحتوى إيجابي ومشجع. أجب بالعربية.`;
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
          JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لحساب Lovable AI" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("pregnancy-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});