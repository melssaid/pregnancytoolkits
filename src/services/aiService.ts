import { supabase } from '@/integrations/supabase/client';

// Generate hash for input caching
const hashInput = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Get user ID
const getUserId = (): string => {
  return localStorage.getItem('pregnancy_user_id') || 'anonymous';
};

// System prompts for each tool
const SYSTEM_PROMPTS: Record<string, string> = {
  'pregnancy-assistant': `أنتِ مساعدة حمل ذكية ومتخصصة. قدمي إجابات دقيقة ومفيدة باللغة العربية.
    - استخدمي مصادر طبية موثوقة
    - قدمي نصائح عملية وآمنة للحامل
    - ذكّري دائماً بأهمية استشارة الطبيب
    - كوني داعمة وإيجابية
    - استخدمي إيموجي مناسبة`,
  
  'symptom-analyzer': `أنتِ محللة أعراض طبية متخصصة في أعراض الحمل.
    - حللي الأعراض المذكورة بعناية
    - صنفي مستوى الخطورة (عادي/يحتاج متابعة/طوارئ)
    - قدمي نصائح للتخفيف
    - حذري عند الأعراض الخطيرة
    - ذكري بأهمية استشارة الطبيب`,
  
  'nutrition-advisor': `أنتِ خبيرة تغذية متخصصة في تغذية الحوامل.
    - قدمي نصائح غذائية آمنة للحمل
    - اذكري الأطعمة المفيدة والممنوعة
    - احسبي السعرات والعناصر الغذائية
    - اقترحي بدائل صحية
    - راعي الثقافة العربية في الوجبات`,
  
  'fitness-coach': `أنتِ مدربة لياقة متخصصة في تمارين الحوامل.
    - اقترحي تمارين آمنة حسب مرحلة الحمل
    - حذري من التمارين الممنوعة
    - قدمي تعديلات للتمارين
    - راعي مستوى اللياقة
    - اذكري أوقات التوقف عن التمرين`,
  
  'baby-names': `أنتِ خبيرة في أسماء المواليد العربية والإسلامية.
    - اقترحي أسماء جميلة ومعانيها
    - راعي الأسماء المستحبة إسلامياً
    - قدمي أسماء تناسب الطلب
    - اذكري أصل الاسم ومعناه`,
  
  'birth-plan': `أنتِ مستشارة ولادة متخصصة.
    - ساعدي في إعداد خطة الولادة
    - اشرحي الخيارات المتاحة
    - ناقشي إيجابيات وسلبيات كل خيار
    - جهزي أسئلة للطبيب`,
  
  'mental-health': `أنتِ معالجة نفسية متخصصة في صحة الحوامل النفسية.
    - قدمي دعماً نفسياً
    - اقترحي تقنيات الاسترخاء
    - تعرفي على أعراض اكتئاب الحمل
    - شجعي على طلب المساعدة المهنية عند الحاجة`,
  
  'meal-planner': `أنتِ مخططة وجبات متخصصة للحوامل.
    - خططي وجبات متوازنة وصحية
    - راعي الاحتياجات الغذائية لكل مرحلة
    - قدمي وصفات سهلة وسريعة
    - اقترحي بدائل للأطعمة الممنوعة`,
  
  'default': `أنتِ مساعدة ذكية متخصصة في الحمل والأمومة. قدمي إجابات مفيدة ودقيقة باللغة العربية مع الإشارة لأهمية استشارة الطبيب.`
};

export interface AIResponse {
  content: string;
  sources: string[];
  cached: boolean;
}

export const AIService = {
  // Query with caching
  async ask(message: string, toolName: string = 'default', skipCache: boolean = false): Promise<AIResponse> {
    const userId = getUserId();
    const inputHash = hashInput(`${toolName}:${message}`);
    
    // Check cache first
    if (!skipCache) {
      try {
        const { data: cached } = await supabase
          .from('ai_analysis_cache')
          .select('*')
          .eq('user_id', userId)
          .eq('input_hash', inputHash)
          .gt('expires_at', new Date().toISOString())
          .single();
        
        if (cached) {
          return {
            content: (cached.analysis_result as any).content,
            sources: (cached.sources as string[]) || [],
            cached: true
          };
        }
      } catch (e) {
        // Cache miss, continue to API call
      }
    }
    
    // Get API key from environment
    const apiKey = (import.meta as any).env?.VITE_PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return {
        content: '⚠️ يرجى إضافة مفتاح Perplexity API في إعدادات المشروع (VITE_PERPLEXITY_API_KEY)',
        sources: [],
        cached: false
      };
    }
    
    try {
      const systemPrompt = SYSTEM_PROMPTS[toolName] || SYSTEM_PROMPTS['default'];
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          return_citations: true,
          search_domain_filter: ['mayoclinic.org', 'webmd.com', 'who.int', 'healthline.com', 'babycenter.com'],
          search_recency_filter: 'year'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      const sources = data.citations || [];
      
      // Save to cache
      try {
        await supabase.from('ai_analysis_cache').insert({
          user_id: userId,
          tool_name: toolName,
          input_hash: inputHash,
          analysis_result: { content },
          sources,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });
      } catch (e) {
        console.warn('Failed to cache AI response:', e);
      }
      
      return { content, sources, cached: false };
      
    } catch (error: any) {
      console.error('AI Service Error:', error);
      return {
        content: `عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى. (${error.message})`,
        sources: [],
        cached: false
      };
    }
  },
  
  // Analyze symptoms
  async analyzeSymptoms(symptoms: string[], week: number): Promise<AIResponse> {
    const message = `أنا في الأسبوع ${week} من الحمل. أعاني من الأعراض التالية: ${symptoms.join('، ')}. 
    هل هذه الأعراض طبيعية؟ وما النصائح للتخفيف منها؟`;
    
    return this.ask(message, 'symptom-analyzer');
  },
  
  // Analyze nutrition
  async analyzeNutrition(foods: string[], week: number): Promise<AIResponse> {
    const message = `أنا في الأسبوع ${week} من الحمل. تناولت اليوم: ${foods.join('، ')}. 
    هل هذه الوجبات مناسبة؟ وما الذي ينقصني من العناصر الغذائية؟`;
    
    return this.ask(message, 'nutrition-advisor');
  },
  
  // Suggest baby names
  async suggestBabyNames(gender: string, preferences: string): Promise<AIResponse> {
    const message = `أبحث عن أسماء ${gender === 'male' ? 'ذكور' : gender === 'female' ? 'إناث' : 'للجنسين'}. 
    تفضيلاتي: ${preferences}. اقترحي 10 أسماء مع معانيها.`;
    
    return this.ask(message, 'baby-names');
  },
  
  // Analyze bump progress
  async analyzeBumpProgress(week: number, previousWeek?: number): Promise<AIResponse> {
    const message = previousWeek
      ? `أنا الآن في الأسبوع ${week} من الحمل، وكانت صورتي السابقة في الأسبوع ${previousWeek}. 
         ما التغييرات المتوقعة في حجم البطن؟ وما نصائحك للعناية بالبشرة؟`
      : `أنا في الأسبوع ${week} من الحمل. ما الحجم المتوقع للبطن؟ وما التغييرات الطبيعية؟`;
    
    return this.ask(message, 'pregnancy-assistant');
  },
  
  // Generate birth plan
  async generateBirthPlan(preferences: any): Promise<AIResponse> {
    const message = `أريد إعداد خطة ولادة. تفضيلاتي:
    - نوع الولادة المفضل: ${preferences.birthType || 'غير محدد'}
    - تخفيف الألم: ${preferences.painRelief || 'غير محدد'}
    - المرافق: ${preferences.companion || 'غير محدد'}
    - تفضيلات أخرى: ${preferences.other || 'لا يوجد'}
    
    ساعديني في إعداد خطة ولادة شاملة.`;
    
    return this.ask(message, 'birth-plan');
  },
  
  // Get workout advice
  async getWorkoutAdvice(week: number, fitnessLevel: string): Promise<AIResponse> {
    const message = `أنا في الأسبوع ${week} من الحمل، ومستوى لياقتي ${fitnessLevel}. 
    ما التمارين الآمنة لي؟ وكم المدة الموصى بها يومياً؟`;
    
    return this.ask(message, 'fitness-coach');
  },
  
  // Mental health support
  async getMentalHealthSupport(mood: string, concerns: string): Promise<AIResponse> {
    const message = `أشعر بـ ${mood}. مخاوفي: ${concerns}. 
    كيف يمكنني التعامل مع هذه المشاعر خلال الحمل؟`;
    
    return this.ask(message, 'mental-health');
  },
  
  // Plan meals
  async planMeals(week: number, restrictions: string[], preferences: string): Promise<AIResponse> {
    const message = `أنا في الأسبوع ${week} من الحمل.
    القيود الغذائية: ${restrictions.length ? restrictions.join('، ') : 'لا يوجد'}
    التفضيلات: ${preferences || 'لا يوجد'}
    
    أريد خطة وجبات لأسبوع كامل.`;
    
    return this.ask(message, 'meal-planner');
  },
  
  // Analyze kick patterns
  async analyzeKickPatterns(sessions: any[], week: number): Promise<AIResponse> {
    const avgKicks = sessions.reduce((sum, s) => sum + s.total_kicks, 0) / sessions.length;
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length;
    
    const message = `أنا في الأسبوع ${week} من الحمل. 
    خلال آخر ${sessions.length} جلسات تتبع:
    - متوسط الركلات: ${avgKicks.toFixed(1)} ركلة
    - متوسط مدة الجلسة: ${avgDuration.toFixed(0)} دقيقة
    
    هل هذا النمط طبيعي؟ ومتى يجب أن أقلق؟`;
    
    return this.ask(message, 'pregnancy-assistant');
  },
  
  // Clear cache for a tool
  async clearCache(toolName?: string) {
    const userId = getUserId();
    
    let query = supabase
      .from('ai_analysis_cache')
      .delete()
      .eq('user_id', userId);
    
    if (toolName) {
      query = query.eq('tool_name', toolName);
    }
    
    await query;
  }
};

export default AIService;
