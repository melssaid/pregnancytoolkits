

## خطة تحسين النص التحفيزي في صندوق العروض

### المشكلة الحالية
النصوص الحالية عامة وضعيفة نفسياً:
- **badge**: "٣ أيام مجاناً" / "3 Days Free" — مجرد معلومة، لا تحفيز
- **cta**: "جرّبي مجاناً ٣ أيام" / "Try Free for 3 Days" — لا تخاطب العاطفة

### التغييرات المطلوبة

**1. تحديث نصوص `pricing.badge` و `pricing.cta` في جميع ملفات الترجمة السبعة**

النصوص الجديدة مبنية على مبادئ نفسية (FOMO، الانتماء، حماية الطفل):

| اللغة | badge (العنوان) | cta (النص الفرعي) |
|-------|----------------|-------------------|
| **ar** | طفلكِ يستحق الأفضل | ابدئي رحلتكِ المميزة — ٣ أيام مجاناً |
| **en** | Your Baby Deserves the Best | Start your journey free — 3 days on us |
| **de** | Dein Baby verdient das Beste | Starte deine Reise — 3 Tage gratis |
| **fr** | Votre bébé mérite le meilleur | Commencez votre parcours — 3 jours gratuits |
| **es** | Tu bebé merece lo mejor | Comienza tu camino — 3 días gratis |
| **pt** | Seu bebê merece o melhor | Comece sua jornada — 3 dias grátis |
| **tr** | Bebeğin en iyisini hak ediyor | Yolculuğuna başla — 3 gün ücretsiz |

### المبدأ النفسي
- **badge** يستهدف غريزة الأمومة: "طفلكِ يستحق" — يجعل القرار عن الطفل لا عن المال
- **cta** يجمع بين الدعوة للعمل + إزالة المخاطر (مجاناً) في جملة واحدة

**2. تعديل حجم النص في `PremiumBanner`** (ملف `src/pages/Index.tsx`)

تكبير العنوان من `text-[13px]` إلى `text-sm font-extrabold` ليكون أكثر بروزاً ووضوحاً.

