// AI Service for pregnancy tools
// Uses environment variable for API key

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

export const AIService = {
  async ask(prompt: string, context: string = 'pregnancy-assistant'): Promise<AIResponse> {
    if (!OPENROUTER_API_KEY) {
      // Return a helpful fallback response
      return {
        content: 'عذراً، خدمة AI غير متوفرة حالياً. يرجى إضافة VITE_OPENROUTER_API_KEY في إعدادات المشروع.',
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
        throw new Error('AI request failed');
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'لم أتمكن من الإجابة',
        model: data.model
      };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        content: 'عذراً، حدث خطأ في الاتصال بخدمة AI. يرجى المحاولة لاحقاً.',
        model: 'error'
      };
    }
  },

  async analyzeNutrition(foods: string[], week: number): Promise<AIResponse> {
    const prompt = `أنا في الأسبوع ${week} من الحمل وتناولت اليوم: ${foods.join('، ')}.

حللي تغذيتي وأجيبي على:
1. هل هذه الوجبات مناسبة لأسبوع حملي؟
2. ما العناصر الغذائية التي حصلت عليها؟
3. ما الذي ينقصني؟
4. اقتراحات لوجبات مكملة`;

    return this.ask(prompt, 'nutrition-advisor');
  },

  async analyzeKickPatterns(sessions: any[], week: number): Promise<AIResponse> {
    const summary = sessions.slice(0, 5).map(s => 
      `${s.total_kicks} حركة في ${s.duration_minutes} دقيقة`
    ).join('، ');

    const prompt = `أنا في الأسبوع ${week} من الحمل.
آخر جلسات تتبع حركة الجنين: ${summary}

حللي هذه الأنماط وأخبريني:
1. هل معدل الحركة طبيعي؟
2. ما الأوقات المثالية لتتبع الحركة؟
3. متى يجب أن أقلق؟`;

    return this.ask(prompt, 'kick-analyzer');
  },

  async analyzeBumpProgress(currentWeek: number, previousWeek?: number): Promise<AIResponse> {
    const prompt = previousWeek 
      ? `أنا في الأسبوع ${currentWeek} من الحمل (كانت آخر صورة في الأسبوع ${previousWeek}).

أخبريني عن:
1. التغيرات المتوقعة بين الأسبوعين
2. تطور حجم الجنين
3. نصائح للعناية بالبشرة والجسم
4. تمارين مناسبة لهذه المرحلة`
      : `أنا في الأسبوع ${currentWeek} من الحمل وهذه أول صورة لي.

أخبريني عن:
1. حجم الجنين المتوقع
2. التغيرات الطبيعية في جسمي
3. نصائح للعناية
4. ما يجب توقعه في الأسابيع القادمة`;

    return this.ask(prompt, 'bump-progress');
  }
};
