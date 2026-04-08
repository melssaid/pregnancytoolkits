/**
 * Localized SEO data for tool landing pages.
 * Each tool has H1, description, and FAQs in all supported languages.
 * Falls back to English if a language is not available.
 */

export interface ToolSEOLocale {
  h1: string;
  desc: string;
  faqs: { q: string; a: string }[];
}

type LocaleMap = Record<string, ToolSEOLocale>;

// ═══════════════════════════════════════════════════════════
// ARABIC
// ═══════════════════════════════════════════════════════════
const ar: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "حاسبة موعد الولادة المجانية — احسبي موعد وصول طفلك",
    desc: "احسبي موعد الولادة المتوقع بناءً على آخر دورة شهرية أو تاريخ نقل الأجنة. مجانية ودقيقة.",
    faqs: [
      { q: "ما مدى دقة حاسبة موعد الولادة؟", a: "تستخدم الحاسبة قاعدة نيغيل لتقدير موعد الولادة ضمن نطاق أسبوعين. حوالي 5% فقط من الأطفال يولدون في الموعد المحدد بالضبط." },
      { q: "هل يمكنني حساب الموعد من تاريخ نقل الأجنة؟", a: "نعم. تدعم الحاسبة الحساب من تاريخ آخر دورة ومن تاريخ نقل الأجنة (يوم 3 أو يوم 5)." },
    ],
  },
  "kick-counter": {
    h1: "عداد حركة الجنين — تابعي حركات طفلك مجاناً",
    desc: "تابعي حركات طفلك اليومية مع عداد الركلات المجاني. سجّلي الحركات واحصلي على تنبيهات عند تغير الأنماط.",
    faqs: [
      { q: "متى أبدأ بعد حركات الجنين؟", a: "ينصح معظم مقدمي الرعاية بالبدء في الأسبوع 28. استهدفي 10 حركات خلال ساعتين في نفس الوقت يومياً." },
      { q: "ماذا لو انخفضت حركات الجنين؟", a: "إذا لاحظتِ انخفاضاً ملحوظاً في الحركة، تواصلي مع مقدم الرعاية فوراً." },
    ],
  },
  "cycle-tracker": {
    h1: "متتبع الدورة الشهرية والإباضة — توقعي فترة الخصوبة",
    desc: "تابعي دورتك الشهرية، توقعي الإباضة، وحددي فترة الخصوبة. متتبع مجاني مع رؤى ذكية.",
    faqs: [
      { q: "كيف يعمل توقع الإباضة؟", a: "تحلل الخوارزمية تاريخ دورتك لتوقع الإباضة بناءً على متوسط طول المرحلة الأصفرية." },
      { q: "هل يساعد التطبيق على الحمل؟", a: "نعم. يحدد المتتبع أكثر أيامك خصوبة لمساعدتك في تحديد أفضل توقيت." },
    ],
  },
  "contraction-timer": {
    h1: "مؤقت الطلق — تابعي انقباضات المخاض",
    desc: "قيسي انقباضاتك بدقة مع مؤقت الطلق المجاني. تابعي التكرار والمدة والشدة لمعرفة متى تذهبين للمستشفى.",
    faqs: [
      { q: "متى أبدأ بقياس الانقباضات؟", a: "ابدئي عندما تشعرين بانقباضات منتظمة ومؤلمة. قيسي من بداية انقباض لبداية الذي يليه." },
      { q: "ما هي قاعدة 5-1-1؟", a: "تقترح الذهاب للمستشفى عندما تكون الانقباضات كل 5 دقائق، مدتها دقيقة واحدة، لمدة ساعة على الأقل." },
    ],
  },
  "pregnancy-assistant": {
    h1: "مساعد الحمل الذكي — إجابات فورية لأسئلتك",
    desc: "اسألي أي سؤال عن الحمل واحصلي على إجابات مبنية على الأدلة من مساعدنا الذكي. متاح 24/7 بـ 7 لغات.",
    faqs: [
      { q: "هل المساعد الذكي بديل عن الطبيب؟", a: "لا. المساعد يقدم معلومات تعليمية وليس بديلاً عن الاستشارة الطبية المتخصصة." },
    ],
  },
  "fetal-growth": {
    h1: "دليل نمو الجنين — تطور طفلك أسبوعاً بأسبوع",
    desc: "تابعي تطور طفلك أسبوعياً مع مقارنات الحجم والمعالم التنموية.",
    faqs: [
      { q: "ما حجم طفلي هذا الأسبوع؟", a: "يعرض المتتبع حجم طفلك مقارنة بالفواكه كل أسبوع. في الأسبوع 20 بحجم الموزة، وفي الأسبوع 40 بحجم البطيخة." },
    ],
  },
  "weight-gain": {
    h1: "متتبع زيادة الوزن في الحمل — إرشادات حسب مؤشر الكتلة",
    desc: "راقبي زيادة الوزن الصحية خلال الحمل مع إرشادات مبنية على مؤشر كتلة الجسم.",
    faqs: [
      { q: "كم يجب أن يزيد وزني خلال الحمل؟", a: "يعتمد على مؤشر كتلة الجسم. للوزن الطبيعي (18.5-24.9) يُنصح بـ 11-16 كجم." },
    ],
  },
  "ai-meal-suggestion": {
    h1: "مخطط وجبات الحمل الذكي — وجبات آمنة ومغذية",
    desc: "احصلي على اقتراحات وجبات مخصصة وآمنة للحمل حسب الثلث والاحتياجات الغذائية.",
    faqs: [
      { q: "ما الأطعمة التي يجب تجنبها أثناء الحمل؟", a: "تجنبي اللحوم النيئة، الألبان غير المبسترة، الأسماك عالية الزئبق، والبيض النيء. التطبيق يحذرك تلقائياً." },
    ],
  },
  "ai-fitness-coach": {
    h1: "مدرب اللياقة للحامل — تمارين آمنة حسب الثلث",
    desc: "احصلي على تمارين مخصصة وآمنة للحمل حسب الثلث ومستوى لياقتك.",
    faqs: [
      { q: "هل التمارين آمنة أثناء الحمل؟", a: "لمعظم حالات الحمل الصحية، التمارين المعتدلة آمنة ومُوصى بها. استشيري مقدم الرعاية أولاً." },
    ],
  },
  "ai-hospital-bag": {
    h1: "قائمة حقيبة المستشفى — قائمة تجهيزات ذكية",
    desc: "أنشئي قائمة حقيبة مستشفى مخصصة للولادة تشمل مستلزمات الأم والطفل والمرافق.",
    faqs: [
      { q: "متى أجهّز حقيبة المستشفى؟", a: "جهّزي الحقيبة بحلول الأسبوع 35-36. ضعيها قرب الباب لتكوني مستعدة في أي وقت." },
    ],
  },
  "baby-growth": {
    h1: "متتبع نمو الطفل — راقبي الوزن والطول والمعالم",
    desc: "تابعي نمو طفلك مع مخططات النمو المعيارية من الولادة حتى سنتين.",
    faqs: [
      { q: "ما النسبة المئوية الطبيعية للنمو؟", a: "أي نسبة من 3 إلى 97 تعتبر طبيعية. المهم أن يتبع طفلك منحنى نمو ثابت." },
    ],
  },
  "baby-sleep-tracker": {
    h1: "متتبع نوم الطفل — راقبي أنماط نوم المولود",
    desc: "تابعي جدول نوم طفلك وقيلولاته واحصلي على إرشادات النوم المناسبة لعمره.",
    faqs: [
      { q: "كم يجب أن ينام مولودي؟", a: "ينام حديثو الولادة 14-17 ساعة يومياً. بحلول 4-6 أشهر يبدأون بالنوم لفترات أطول ليلاً." },
    ],
  },
  "postpartum-mental-health": {
    h1: "مرشد الصحة النفسية بعد الولادة — متابعة المزاج والدعم",
    desc: "تابعي صحتك النفسية بعد الولادة مع تتبع المزاج واستراتيجيات التأقلم. لأغراض تعليمية فقط.",
    faqs: [
      { q: "ما الفرق بين كآبة الأمومة واكتئاب ما بعد الولادة؟", a: "كآبة الأمومة تصيب 80% من الأمهات وتزول خلال أسبوعين. اكتئاب ما بعد الولادة أشد ويستمر أكثر من أسبوعين." },
    ],
  },
  "diaper-tracker": {
    h1: "متتبع الحفاضات — راقبي تغييرات حفاضات طفلك",
    desc: "تابعي الحفاضات المبللة والمتسخة للتأكد من تغذية طفلك الكافية وترطيبه.",
    faqs: [
      { q: "كم حفاضة يجب أن يستخدمها المولود يومياً؟", a: "بعد اليوم الخامس، المولود الصحي يستخدم 6+ حفاضات مبللة و3-4 متسخة يومياً." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// GERMAN
// ═══════════════════════════════════════════════════════════
const de: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "Kostenloser Geburtsterminrechner — Berechne den Geburtstermin",
    desc: "Berechne deinen voraussichtlichen Geburtstermin basierend auf deiner letzten Periode oder dem IVF-Transferdatum. Kostenlos und genau.",
    faqs: [
      { q: "Wie genau ist ein Geburtsterminrechner?", a: "Geburtsterminrechner verwenden die Naegele-Regel zur Schätzung innerhalb von 2 Wochen. Nur etwa 5% der Babys kommen am errechneten Termin." },
    ],
  },
  "kick-counter": {
    h1: "Baby-Bewegungszähler — Kindsbewegungen kostenlos verfolgen",
    desc: "Verfolge die Tritte deines Babys mit unserem kostenlosen Bewegungszähler. Tägliche Zählungen und Musteränderungswarnungen.",
    faqs: [
      { q: "Wann sollte ich anfangen, Kindsbewegungen zu zählen?", a: "Die meisten Ärzte empfehlen ab der 28. Schwangerschaftswoche. Zähle 10 Bewegungen innerhalb von 2 Stunden." },
    ],
  },
  "cycle-tracker": {
    h1: "Perioden- & Eisprungtracker — Fruchtbare Tage berechnen",
    desc: "Verfolge deinen Zyklus, berechne den Eisprung und bestimme dein fruchtbares Fenster. Kostenloser Tracker mit KI-Einblicken.",
    faqs: [
      { q: "Wie funktioniert die Eisprungvorhersage?", a: "Der Algorithmus analysiert deinen Zyklusverlauf und berechnet den Eisprung basierend auf der durchschnittlichen Gelbkörperphase." },
    ],
  },
  "contraction-timer": {
    h1: "Wehentimer — Wehen genau verfolgen",
    desc: "Miss deine Wehen genau mit unserem kostenlosen Timer. Verfolge Häufigkeit, Dauer und Intensität.",
    faqs: [
      { q: "Was ist die 5-1-1-Regel?", a: "Fahre ins Krankenhaus, wenn die Wehen alle 5 Minuten kommen, 1 Minute dauern, seit 1 Stunde. Befolge immer den Rat deines Arztes." },
    ],
  },
  "pregnancy-assistant": {
    h1: "KI-Schwangerschaftsassistent — Sofortige Antworten",
    desc: "Stelle jede Schwangerschaftsfrage und erhalte evidenzbasierte Antworten. 24/7 in 7 Sprachen verfügbar.",
    faqs: [
      { q: "Ersetzt der KI-Assistent meinen Arzt?", a: "Nein. Der Assistent bietet Bildungsinformationen und ersetzt keine professionelle medizinische Beratung." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// FRENCH
// ═══════════════════════════════════════════════════════════
const fr: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "Calculateur de Date d'Accouchement Gratuit",
    desc: "Calculez votre date d'accouchement prévue basée sur vos dernières règles ou votre transfert FIV. Gratuit et précis.",
    faqs: [
      { q: "Quelle est la précision du calculateur?", a: "Le calculateur utilise la règle de Naegele pour estimer la date dans une fenêtre de 2 semaines. Seulement 5% des bébés naissent à la date exacte." },
    ],
  },
  "kick-counter": {
    h1: "Compteur de Mouvements Bébé — Suivi Gratuit",
    desc: "Suivez les mouvements de votre bébé avec notre compteur gratuit. Comptages quotidiens et alertes de changement.",
    faqs: [
      { q: "Quand commencer à compter les mouvements?", a: "La plupart des professionnels recommandent de commencer vers la 28e semaine. Visez 10 mouvements en 2 heures." },
    ],
  },
  "cycle-tracker": {
    h1: "Suivi de Règles et d'Ovulation — Prédisez Votre Fenêtre Fertile",
    desc: "Suivez votre cycle menstruel, prédisez l'ovulation et identifiez votre fenêtre fertile. Gratuit avec analyses IA.",
    faqs: [
      { q: "Comment fonctionne la prédiction d'ovulation?", a: "L'algorithme analyse votre historique de cycle pour prédire l'ovulation basée sur la phase lutéale moyenne." },
    ],
  },
  "contraction-timer": {
    h1: "Minuteur de Contractions — Suivez le Travail",
    desc: "Chronométrez vos contractions avec notre minuteur gratuit. Suivez la fréquence, la durée et l'intensité.",
    faqs: [
      { q: "Qu'est-ce que la règle 5-1-1?", a: "Allez à l'hôpital quand les contractions sont espacées de 5 minutes, durent 1 minute, depuis 1 heure." },
    ],
  },
  "pregnancy-assistant": {
    h1: "Assistant Grossesse IA — Réponses Instantanées",
    desc: "Posez n'importe quelle question sur la grossesse et obtenez des réponses basées sur des preuves. Disponible 24/7 en 7 langues.",
    faqs: [
      { q: "L'assistant IA remplace-t-il mon médecin?", a: "Non. L'assistant fournit des informations éducatives et ne remplace pas les conseils médicaux professionnels." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// SPANISH
// ═══════════════════════════════════════════════════════════
const es: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "Calculadora de Fecha de Parto Gratis",
    desc: "Calcula tu fecha estimada de parto basada en tu última menstruación o fecha de transferencia FIV. Gratis y precisa.",
    faqs: [
      { q: "¿Qué tan precisa es la calculadora?", a: "La calculadora usa la regla de Naegele para estimar la fecha dentro de 2 semanas. Solo el 5% de los bebés nacen en la fecha exacta." },
    ],
  },
  "kick-counter": {
    h1: "Contador de Pataditas del Bebé — Seguimiento Gratis",
    desc: "Sigue los movimientos de tu bebé con nuestro contador gratuito. Conteos diarios y alertas de cambios.",
    faqs: [
      { q: "¿Cuándo debo empezar a contar movimientos?", a: "La mayoría de profesionales recomiendan empezar en la semana 28. Apunta a 10 movimientos en 2 horas." },
    ],
  },
  "cycle-tracker": {
    h1: "Rastreador de Período y Ovulación — Predice Tu Ventana Fértil",
    desc: "Rastrea tu ciclo menstrual, predice la ovulación e identifica tu ventana fértil. Gratis con análisis IA.",
    faqs: [
      { q: "¿Cómo funciona la predicción de ovulación?", a: "El algoritmo analiza tu historial de ciclos para predecir la ovulación basándose en la fase lútea promedio." },
    ],
  },
  "contraction-timer": {
    h1: "Temporizador de Contracciones — Controla el Trabajo de Parto",
    desc: "Mide tus contracciones con nuestro temporizador gratuito. Rastrea frecuencia, duración e intensidad.",
    faqs: [
      { q: "¿Qué es la regla 5-1-1?", a: "Ve al hospital cuando las contracciones sean cada 5 minutos, duren 1 minuto, durante 1 hora." },
    ],
  },
  "pregnancy-assistant": {
    h1: "Asistente de Embarazo IA — Respuestas Instantáneas",
    desc: "Haz cualquier pregunta sobre el embarazo y obtén respuestas basadas en evidencia. Disponible 24/7 en 7 idiomas.",
    faqs: [
      { q: "¿El asistente IA reemplaza a mi médico?", a: "No. El asistente proporciona información educativa y no sustituye el consejo médico profesional." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// TURKISH
// ═══════════════════════════════════════════════════════════
const tr: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "Ücretsiz Doğum Tarihi Hesaplama",
    desc: "Son adet tarihinize veya IVF transfer tarihine göre tahmini doğum tarihinizi hesaplayın. Ücretsiz ve doğru.",
    faqs: [
      { q: "Doğum tarihi hesaplama ne kadar doğru?", a: "Hesaplama Naegele kuralını kullanarak 2 haftalık bir pencere içinde tahmin yapar. Bebeklerin sadece %5'i tam tarihte doğar." },
    ],
  },
  "kick-counter": {
    h1: "Bebek Hareket Sayacı — Ücretsiz Takip",
    desc: "Bebeğinizin hareketlerini ücretsiz sayacımızla takip edin. Günlük sayımlar ve değişiklik uyarıları.",
    faqs: [
      { q: "Bebek hareketlerini saymaya ne zaman başlamalıyım?", a: "Çoğu uzman 28. haftadan itibaren başlamayı önerir. 2 saat içinde 10 hareketi hedefleyin." },
    ],
  },
  "cycle-tracker": {
    h1: "Adet ve Yumurtlama Takipçisi — Doğurganlık Pencerenizi Tahmin Edin",
    desc: "Adet döngünüzü takip edin, yumurtlamayı tahmin edin ve doğurganlık pencerenizi belirleyin.",
    faqs: [
      { q: "Yumurtlama tahmini nasıl çalışır?", a: "Algoritma döngü geçmişinizi analiz ederek ortalama luteal faz süresine göre yumurtlamayı tahmin eder." },
    ],
  },
  "pregnancy-assistant": {
    h1: "Yapay Zeka Hamilelik Asistanı — Anında Yanıtlar",
    desc: "Hamilelik hakkında herhangi bir soru sorun ve kanıta dayalı yanıtlar alın. 7 dilde 7/24 mevcuttur.",
    faqs: [
      { q: "Yapay zeka asistanı doktorumun yerini alır mı?", a: "Hayır. Asistan eğitim amaçlı bilgi sağlar ve profesyonel tıbbi tavsiyenin yerini almaz." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// PORTUGUESE
// ═══════════════════════════════════════════════════════════
const pt: Record<string, ToolSEOLocale> = {
  "due-date-calculator": {
    h1: "Calculadora de Data de Parto Grátis",
    desc: "Calcule sua data prevista de parto com base na última menstruação ou data de transferência FIV. Grátis e precisa.",
    faqs: [
      { q: "Qual a precisão da calculadora?", a: "A calculadora usa a regra de Naegele para estimar a data dentro de 2 semanas. Apenas 5% dos bebês nascem na data exata." },
    ],
  },
  "kick-counter": {
    h1: "Contador de Movimentos do Bebê — Acompanhamento Grátis",
    desc: "Acompanhe os movimentos do seu bebê com nosso contador gratuito. Contagens diárias e alertas de mudanças.",
    faqs: [
      { q: "Quando devo começar a contar movimentos?", a: "A maioria dos profissionais recomenda começar na semana 28. Busque 10 movimentos em 2 horas." },
    ],
  },
  "cycle-tracker": {
    h1: "Rastreador de Período e Ovulação — Preveja Sua Janela Fértil",
    desc: "Acompanhe seu ciclo menstrual, preveja a ovulação e identifique sua janela fértil. Grátis com análises IA.",
    faqs: [
      { q: "Como funciona a previsão de ovulação?", a: "O algoritmo analisa seu histórico de ciclos para prever a ovulação com base na fase lútea média." },
    ],
  },
  "pregnancy-assistant": {
    h1: "Assistente de Gravidez IA — Respostas Instantâneas",
    desc: "Faça qualquer pergunta sobre gravidez e obtenha respostas baseadas em evidências. Disponível 24/7 em 7 idiomas.",
    faqs: [
      { q: "O assistente IA substitui meu médico?", a: "Não. O assistente fornece informações educacionais e não substitui aconselhamento médico profissional." },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
export const toolSeoLocales: Record<string, Record<string, ToolSEOLocale>> = {
  ar, de, fr, es, tr, pt,
};

/**
 * Get localized SEO data for a tool. Falls back to undefined if not available
 * (caller should fall back to English toolSEO).
 */
export function getLocalizedToolSEO(lang: string, toolId: string): ToolSEOLocale | undefined {
  return toolSeoLocales[lang]?.[toolId];
}
