// AI Service for pregnancy tools
// Uses OpenRouter API with fallback responses

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIResponse {
  content: string;
  model: string;
}

const systemPrompts: Record<string, string> = {
  'pregnancy-assistant': `You are a smart and empathetic pregnancy assistant. You provide general medical advice for pregnant women.
- Be supportive and encouraging
- Provide accurate and useful information
- Always remind to consult a doctor for emergencies
- Use appropriate emojis to make responses friendly`,
  
  'nutrition-advisor': `You are a nutrition expert specialized in pregnancy nutrition.
- Analyze meals for nutritional value
- Suggest healthy alternatives
- Consider the needs of each pregnancy week
- Warn about foods to avoid during pregnancy`,
  
  'kick-analyzer': `You are a specialist in fetal movement analysis.
- Analyze movement patterns
- Reassure the mother while providing useful information
- Alert about cases that require doctor consultation`,
  
  'bump-progress': `You are a specialist in pregnancy progress tracking.
- Describe normal developments for each week
- Provide body care tips
- Suggest appropriate exercises`
};

// Fallback responses when API is not available
const fallbackResponses: Record<string, string> = {
  'nutrition': `🥗 **General Nutrition Tips for Pregnancy:**

✅ Eat balanced meals with protein and vegetables
✅ Drink 8-10 glasses of water daily
✅ Take prenatal vitamins daily
✅ Avoid raw and unpasteurized foods

⚠️ Consult your doctor for personalized advice.`,
  
  'kicks': `👶 **Fetal Movement Information:**

✅ Normal: 10 movements in 2 hours
✅ Baby is active after eating and in the evening
✅ Each baby has their own pattern

⚠️ See your doctor if you notice a significant decrease in movement.`,
  
  'bump': `🤰 **Pregnancy Development Information:**

✅ The belly grows gradually each week
✅ Use moisturizers to prevent stretch marks
✅ Practice light exercises regularly

⚠️ Follow up with your doctor regularly.`,
  
  'default': `💜 **General Tip:**

Enjoy your pregnancy journey and remember that every pregnancy is unique. Consult your doctor for specific questions.`
};

export const AIService = {
  async ask(prompt: string, context: string = 'pregnancy-assistant'): Promise<AIResponse> {
    // If no API key, return helpful fallback
    if (!OPENROUTER_API_KEY) {
      const fallbackKey = prompt.toLowerCase().includes('nutrition') || prompt.toLowerCase().includes('food') || prompt.toLowerCase().includes('eat') ? 'nutrition' :
                         prompt.toLowerCase().includes('kick') || prompt.toLowerCase().includes('movement') ? 'kicks' :
                         prompt.toLowerCase().includes('bump') || prompt.toLowerCase().includes('photo') ? 'bump' : 'default';
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
    const prompt = `I am in week ${week} of pregnancy and today I ate: ${foods.join(', ')}.

Analyze my nutrition briefly:
1. Are these meals appropriate?
2. What am I missing?
3. One suggestion for improvement`;

    return this.ask(prompt, 'nutrition-advisor');
  },

  async analyzeKickPatterns(sessions: any[], week: number): Promise<AIResponse> {
    const summary = sessions.slice(0, 5).map(s => 
      `${s.total_kicks} movements in ${s.duration_minutes} minutes`
    ).join(', ');

    const prompt = `I am in week ${week} of pregnancy.
Recent kick tracking sessions: ${summary}

Analyze briefly: Is this normal? What's your advice?`;

    return this.ask(prompt, 'kick-analyzer');
  },

  async analyzeBumpProgress(currentWeek: number, previousWeek?: number): Promise<AIResponse> {
    const prompt = previousWeek 
      ? `I am in week ${currentWeek} of pregnancy (last photo was at week ${previousWeek}). Tell me briefly about expected changes and care tips.`
      : `I am in week ${currentWeek} of pregnancy. Tell me briefly about baby size and care tips.`;

    return this.ask(prompt, 'bump-progress');
  }
};
