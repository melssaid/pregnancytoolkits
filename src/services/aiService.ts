// AI Service for pregnancy tools
// Uses OpenRouter API with fallback responses

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIResponse {
  content: string;
  model: string;
}

const systemPrompts: Record<string, string> = {
  'pregnancy-assistant': `أنتِ مساعدة حمل ذكية ومتعاطفة. تقدمين نصائح طبية عامة للحوامل باللغة العربية.
- كوني داعمة ومشجعة
- قدمي معلومات دقيقة ومفيدة
- ذكّري دائماً باستشارة الطبيب للحالات الطارئة
- استخدمي إيموجي مناسبة لجعل الردود ودية`,
  
  'nutrition-advisor': `أنتِ خبيرة تغذية متخصصة في تغذية الحوامل.
- حللي الوجبات من حيث القيمة الغذائية
- اقترحي بدائل صحية
- راعي احتياجات كل أسبوع من الحمل
- حذري من الأطعمة الممنوعة للحوامل`,
  
  'kick-analyzer': `أنتِ متخصصة في تحليل حركات الجنين.
- حللي أنماط الحركة
- طمئني الأم مع تقديم معلومات مفيدة
- نبهي للحالات التي تستدعي استشارة الطبيب`,
  
  'bump-progress': `أنتِ متخصصة في متابعة تطور الحمل.
- صفي التطورات الطبيعية لكل أسبوع
- قدمي نصائح للعناية بالجسم
- اقترحي تمارين مناسبة`
};

// Fallback responses when API is not available
const fallbackResponses: Record<string, string> = {
  'nutrition': `🥗 **نصائح تغذية عامة للحامل:**

✅ تناولي وجبات متوازنة تحتوي على بروتين وخضروات
✅ اشربي 8-10 أكواب ماء يومياً
✅ تناولي فيتامينات الحمل يومياً
✅ تجنبي الأطعمة النيئة وغير المبسترة

⚠️ استشيري طبيبك للحصول على نصائح مخصصة.`,
  
  'kicks': `👶 **معلومات عن حركة الجنين:**

✅ الطبيعي: 10 حركات في ساعتين
✅ الجنين ينشط بعد الأكل وفي المساء
✅ كل جنين له نمطه الخاص

⚠️ راجعي الطبيب إذا لاحظتِ انخفاضاً ملحوظاً في الحركة.`,
  
  'bump': `🤰 **معلومات عن تطور الحمل:**

✅ البطن ينمو تدريجياً كل أسبوع
✅ استخدمي مرطبات لتجنب التشققات
✅ مارسي تمارين خفيفة بانتظام

⚠️ تابعي مع طبيبك بانتظام.`,
  
  'default': `💜 **نصيحة عامة:**

استمتعي برحلة حملك وتذكري أن كل حمل فريد. استشيري طبيبك للأسئلة المحددة.`
};

export const AIService = {
  async ask(prompt: string, context: string = 'pregnancy-assistant'): Promise<AIResponse> {
    // If no API key, return helpful fallback
    if (!OPENROUTER_API_KEY) {
      const fallbackKey = prompt.toLowerCase().includes('تغذية') || prompt.toLowerCase().includes('أكل') ? 'nutrition' :
                         prompt.toLowerCase().includes('حرك') || prompt.toLowerCase().includes('ركل') ? 'kicks' :
                         prompt.toLowerCase().includes('بطن') || prompt.toLowerCase().includes('صور') ? 'bump' : 'default';
      return {
        content: fallbackResponses[fallbackKey],
        model: 'fallback'
      };
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Pregnancy Tools'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: systemPrompts[context] || systemPrompts['pregnancy-assistant'] },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || fallbackResponses['default'],
        model: data.model || 'unknown'
      };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        content: fallbackResponses['default'],
        model: 'fallback'
      };
    }
  },

  async analyzeNutrition(foods: string[], week: number): Promise<AIResponse> {
    const prompt = `أنا في الأسبوع ${week} من الحمل وتناولت اليوم: ${foods.join('، ')}.

حللي تغذيتي وأجيبي باختصار:
1. هل هذه الوجبات مناسبة؟
2. ما الذي ينقصني؟
3. اقتراح واحد للتحسين`;

    return this.ask(prompt, 'nutrition-advisor');
  },

  async analyzeKickPatterns(sessions: any[], week: number): Promise<AIResponse> {
    const summary = sessions.slice(0, 5).map(s => 
      `${s.total_kicks} حركة في ${s.duration_minutes} دقيقة`
    ).join('، ');

    const prompt = `أنا في الأسبوع ${week} من الحمل.
آخر جلسات تتبع حركة الجنين: ${summary}

حللي باختصار: هل هذا طبيعي؟ وما نصيحتك؟`;

    return this.ask(prompt, 'kick-analyzer');
  },

  async analyzeBumpProgress(currentWeek: number, previousWeek?: number): Promise<AIResponse> {
    const prompt = previousWeek 
      ? `أنا في الأسبوع ${currentWeek} من الحمل (آخر صورة كانت بالأسبوع ${previousWeek}). أخبريني باختصار عن التغيرات المتوقعة ونصائح العناية.`
      : `أنا في الأسبوع ${currentWeek} من الحمل. أخبريني باختصار عن حجم الجنين ونصائح العناية.`;

    return this.ask(prompt, 'bump-progress');
  }
};
