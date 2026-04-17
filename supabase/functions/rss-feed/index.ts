// Per-language RSS feed generator
// URL: /functions/v1/rss-feed?lang=ar
// Returns localized RSS 2.0 feed for the language with all tool pages.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://pregnancytoolkits.lovable.app";

const FEED_META: Record<string, { title: string; description: string; brand: string }> = {
  en: {
    title: "Pregnancy Toolkits — Free Pregnancy Tracker & Tools",
    description: "Free pregnancy tracker with 33+ smart tools: due date calculator, kick counter, contraction timer, baby growth tracker, AI meal planner & more.",
    brand: "Pregnancy Toolkits",
  },
  ar: {
    title: "أدوات الحمل — متابعة الحمل المجانية",
    description: "تطبيق متابعة الحمل المجاني مع أكثر من 33 أداة ذكية: حاسبة موعد الولادة، عداد الركلات، مؤقت الانقباضات، متابعة نمو الجنين، خطة وجبات بالذكاء الاصطناعي.",
    brand: "أدوات الحمل",
  },
  fr: {
    title: "Pregnancy Toolkits — Suivi de Grossesse Gratuit",
    description: "Application gratuite de suivi de grossesse avec 33+ outils intelligents : calculateur de date d'accouchement, compteur de coups, minuteur de contractions, planificateur de repas IA.",
    brand: "Pregnancy Toolkits",
  },
  es: {
    title: "Pregnancy Toolkits — Seguimiento Gratuito del Embarazo",
    description: "Aplicación gratuita de seguimiento del embarazo con 33+ herramientas inteligentes: calculadora de fecha de parto, contador de patadas, cronómetro de contracciones, planificador de comidas con IA.",
    brand: "Pregnancy Toolkits",
  },
  de: {
    title: "Pregnancy Toolkits — Kostenloser Schwangerschaftstracker",
    description: "Kostenlose Schwangerschafts-App mit über 33 intelligenten Tools: Geburtstermin-Rechner, Kick-Zähler, Wehen-Timer, Baby-Wachstumstracker, KI-Mahlzeitenplaner.",
    brand: "Pregnancy Toolkits",
  },
  pt: {
    title: "Pregnancy Toolkits — Rastreador de Gravidez Gratuito",
    description: "Aplicativo gratuito de rastreamento de gravidez com mais de 33 ferramentas inteligentes: calculadora de data de parto, contador de chutes, cronômetro de contrações.",
    brand: "Pregnancy Toolkits",
  },
  tr: {
    title: "Pregnancy Toolkits — Ücretsiz Hamilelik Takipçisi",
    description: "33+ akıllı araçla ücretsiz hamilelik takip uygulaması: doğum tarihi hesaplayıcı, tekme sayacı, kasılma zamanlayıcı, bebek büyüme takipçisi.",
    brand: "Pregnancy Toolkits",
  },
};

interface ToolItem {
  id: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
}

const TOOLS: ToolItem[] = [
  {
    id: "due-date-calculator",
    titles: {
      en: "Due Date Calculator — Estimate Your Baby's Arrival",
      ar: "حاسبة موعد الولادة — قدّري موعد قدوم طفلك",
      fr: "Calculateur de Date d'Accouchement",
      es: "Calculadora de Fecha de Parto",
      de: "Geburtstermin-Rechner",
      pt: "Calculadora de Data de Parto",
      tr: "Doğum Tarihi Hesaplayıcı",
    },
    descriptions: {
      en: "Calculate your estimated due date based on your last menstrual period or IVF transfer. Free, accurate, easy to use.",
      ar: "احسبي موعد الولادة المتوقع بناءً على آخر دورة شهرية أو موعد نقل الأجنة. مجاني، دقيق، سهل الاستخدام.",
      fr: "Calculez votre date d'accouchement prévue en fonction de vos dernières règles ou de votre transfert FIV.",
      es: "Calcule la fecha estimada de parto según su última menstruación o transferencia de FIV.",
      de: "Berechnen Sie Ihren voraussichtlichen Geburtstermin basierend auf Ihrer letzten Periode oder IVF-Transfer.",
      pt: "Calcule sua data prevista de parto com base na sua última menstruação ou transferência de FIV.",
      tr: "Son adet döneminize veya tüp bebek transferinize göre tahmini doğum tarihinizi hesaplayın.",
    },
  },
  {
    id: "kick-counter",
    titles: {
      en: "Baby Kick Counter — Track Baby Movements",
      ar: "عداد ركلات الجنين — تتبعي حركات طفلك",
      fr: "Compteur de Coups de Bébé",
      es: "Contador de Patadas del Bebé",
      de: "Baby-Kick-Zähler",
      pt: "Contador de Chutes do Bebê",
      tr: "Bebek Tekme Sayacı",
    },
    descriptions: {
      en: "Track your baby's kick patterns. Get daily counts, monitor activity, and stay connected to your baby.",
      ar: "تتبعي أنماط ركلات طفلك. احصلي على عدّ يومي، وراقبي النشاط، وابقي متصلة بطفلك.",
      fr: "Suivez les mouvements de votre bébé. Comptez quotidiennement et restez connectée.",
      es: "Siga los patrones de patadas de su bebé con conteos diarios.",
      de: "Verfolgen Sie die Trittmuster Ihres Babys mit täglichen Zählungen.",
      pt: "Acompanhe os padrões de chutes do seu bebê com contagens diárias.",
      tr: "Bebeğinizin tekme paternlerini günlük sayımlarla takip edin.",
    },
  },
  {
    id: "contraction-timer",
    titles: {
      en: "Contraction Timer — Time Your Labor Contractions",
      ar: "مؤقت الانقباضات — قيسي انقباضات المخاض",
      fr: "Minuteur de Contractions",
      es: "Cronómetro de Contracciones",
      de: "Wehen-Timer",
      pt: "Cronômetro de Contrações",
      tr: "Kasılma Zamanlayıcı",
    },
    descriptions: {
      en: "Time your contractions easily during labor with one tap. See patterns and know when to head to the hospital.",
      ar: "قيسي انقباضاتك بسهولة أثناء المخاض بضغطة واحدة. شاهدي الأنماط واعرفي متى تتوجهين للمستشفى.",
      fr: "Chronométrez facilement vos contractions pendant le travail.",
      es: "Cronometre fácilmente sus contracciones durante el trabajo de parto.",
      de: "Messen Sie einfach Ihre Wehen während der Geburt.",
      pt: "Cronometre facilmente suas contrações durante o trabalho de parto.",
      tr: "Doğum sırasında kasılmalarınızı kolayca zamanlayın.",
    },
  },
  {
    id: "baby-growth",
    titles: {
      en: "Baby Growth Tracker — Week-by-Week Development",
      ar: "متابعة نمو الجنين — التطور أسبوعاً بأسبوع",
      fr: "Suivi de Croissance du Bébé",
      es: "Seguimiento del Crecimiento del Bebé",
      de: "Baby-Wachstumstracker",
      pt: "Rastreador de Crescimento do Bebê",
      tr: "Bebek Büyüme Takipçisi",
    },
    descriptions: {
      en: "Track your baby's development week by week with size comparisons, milestones, and personalized AI insights.",
      ar: "تتبعي تطور طفلك أسبوعاً بأسبوع مع مقارنات الحجم والمعالم وتحليلات الذكاء الاصطناعي المخصصة.",
      fr: "Suivez le développement de votre bébé semaine par semaine.",
      es: "Siga el desarrollo de su bebé semana a semana.",
      de: "Verfolgen Sie die Entwicklung Ihres Babys Woche für Woche.",
      pt: "Acompanhe o desenvolvimento do seu bebê semana a semana.",
      tr: "Bebeğinizin gelişimini hafta hafta takip edin.",
    },
  },
  {
    id: "cycle-tracker",
    titles: {
      en: "Cycle & Ovulation Tracker — Plan Your Pregnancy",
      ar: "متابعة الدورة والإباضة — خططي لحملك",
      fr: "Suivi du Cycle & Ovulation",
      es: "Seguimiento del Ciclo y Ovulación",
      de: "Zyklus- & Eisprungtracker",
      pt: "Rastreador de Ciclo e Ovulação",
      tr: "Döngü ve Ovülasyon Takipçisi",
    },
    descriptions: {
      en: "Track your menstrual cycle and predict ovulation to plan or prevent pregnancy. Smart predictions powered by AI.",
      ar: "تتبعي دورتك الشهرية وتنبئي بالإباضة للتخطيط للحمل أو منعه. تنبؤات ذكية مدعومة بالذكاء الاصطناعي.",
      fr: "Suivez votre cycle menstruel et prédisez l'ovulation.",
      es: "Siga su ciclo menstrual y prediga la ovulación.",
      de: "Verfolgen Sie Ihren Menstruationszyklus und prognostizieren Sie den Eisprung.",
      pt: "Acompanhe seu ciclo menstrual e preveja a ovulação.",
      tr: "Adet döngünüzü takip edin ve ovülasyonu tahmin edin.",
    },
  },
  {
    id: "smart-pregnancy-plan",
    titles: {
      en: "Smart Pregnancy Plan — AI-Powered Personalized Plan",
      ar: "خطة الحمل الذكية — خطة شخصية بالذكاء الاصطناعي",
      fr: "Plan de Grossesse Intelligent",
      es: "Plan de Embarazo Inteligente",
      de: "Intelligenter Schwangerschaftsplan",
      pt: "Plano Inteligente de Gravidez",
      tr: "Akıllı Hamilelik Planı",
    },
    descriptions: {
      en: "Get a personalized pregnancy plan based on your health data, week, and goals. Powered by AI.",
      ar: "احصلي على خطة حمل مخصصة بناءً على بياناتك الصحية والأسبوع والأهداف. مدعومة بالذكاء الاصطناعي.",
      fr: "Obtenez un plan de grossesse personnalisé basé sur vos données.",
      es: "Obtenga un plan de embarazo personalizado basado en sus datos.",
      de: "Erhalten Sie einen personalisierten Schwangerschaftsplan.",
      pt: "Obtenha um plano de gravidez personalizado.",
      tr: "Kişiselleştirilmiş bir hamilelik planı alın.",
    },
  },
  {
    id: "ai-meal-suggestion",
    titles: {
      en: "AI Pregnancy Meal Planner — Safe & Nutritious Recipes",
      ar: "خطة وجبات الحامل بالذكاء الاصطناعي — وصفات آمنة ومغذية",
      fr: "Planificateur de Repas IA",
      es: "Planificador de Comidas con IA",
      de: "KI-Mahlzeitenplaner",
      pt: "Planejador de Refeições com IA",
      tr: "AI Yemek Planlayıcı",
    },
    descriptions: {
      en: "Get personalized meal suggestions safe for pregnancy. AI considers your trimester, allergies, and preferences.",
      ar: "احصلي على اقتراحات وجبات شخصية آمنة أثناء الحمل. يأخذ الذكاء الاصطناعي في الاعتبار الثلث والحساسيات والتفضيلات.",
      fr: "Obtenez des suggestions de repas personnalisées et sûres.",
      es: "Obtenga sugerencias de comidas personalizadas y seguras.",
      de: "Erhalten Sie personalisierte und sichere Mahlzeitenvorschläge.",
      pt: "Obtenha sugestões de refeições personalizadas e seguras.",
      tr: "Kişiselleştirilmiş ve güvenli yemek önerileri alın.",
    },
  },
  {
    id: "ai-hospital-bag",
    titles: {
      en: "Hospital Bag Checklist — AI-Generated for You",
      ar: "قائمة حقيبة الولادة — مولّدة لكِ بالذكاء الاصطناعي",
      fr: "Liste de Sac d'Hôpital",
      es: "Lista de Bolsa para el Hospital",
      de: "Krankenhaustasche-Checkliste",
      pt: "Lista da Mala de Maternidade",
      tr: "Hastane Çantası Kontrol Listesi",
    },
    descriptions: {
      en: "Get a personalized hospital bag checklist for mom, baby, and partner. Never forget anything important.",
      ar: "احصلي على قائمة حقيبة ولادة شخصية للأم والطفل والشريك. لا تنسي أي شيء مهم.",
      fr: "Obtenez une liste personnalisée pour la maternité.",
      es: "Obtenga una lista personalizada para el hospital.",
      de: "Erhalten Sie eine personalisierte Krankenhausliste.",
      pt: "Obtenha uma lista personalizada para o hospital.",
      tr: "Kişiselleştirilmiş bir hastane listesi alın.",
    },
  },
  {
    id: "vitamin-tracker",
    titles: {
      en: "Pregnancy Vitamin Tracker — Never Miss a Dose",
      ar: "متابعة فيتامينات الحمل — لا تفوّتي جرعة",
      fr: "Suivi des Vitamines de Grossesse",
      es: "Seguimiento de Vitaminas",
      de: "Schwangerschafts-Vitamintracker",
      pt: "Rastreador de Vitaminas",
      tr: "Hamilelik Vitamin Takipçisi",
    },
    descriptions: {
      en: "Track your prenatal vitamins with smart reminders, streaks, and time-of-day tracking.",
      ar: "تتبعي فيتامينات الحمل مع تذكيرات ذكية وسلاسل ومتابعة وقت اليوم.",
      fr: "Suivez vos vitamines prénatales avec des rappels intelligents.",
      es: "Siga sus vitaminas prenatales con recordatorios inteligentes.",
      de: "Verfolgen Sie Ihre Schwangerschaftsvitamine mit intelligenten Erinnerungen.",
      pt: "Acompanhe suas vitaminas pré-natais com lembretes inteligentes.",
      tr: "Doğum öncesi vitaminlerinizi akıllı hatırlatıcılarla takip edin.",
    },
  },
  {
    id: "weekly-summary",
    titles: {
      en: "Weekly Pregnancy Summary — Your Week-by-Week Guide",
      ar: "ملخص الحمل الأسبوعي — دليلكِ أسبوعاً بأسبوع",
      fr: "Résumé Hebdomadaire de Grossesse",
      es: "Resumen Semanal del Embarazo",
      de: "Wöchentliche Schwangerschaftszusammenfassung",
      pt: "Resumo Semanal da Gravidez",
      tr: "Haftalık Hamilelik Özeti",
    },
    descriptions: {
      en: "Get AI-powered insights for every week of your pregnancy: baby development, body changes, nutrition tips.",
      ar: "احصلي على تحليلات بالذكاء الاصطناعي لكل أسبوع من حملك: تطور الجنين، تغيرات الجسم، نصائح التغذية.",
      fr: "Obtenez des informations IA pour chaque semaine de votre grossesse.",
      es: "Obtenga información con IA para cada semana de su embarazo.",
      de: "Erhalten Sie KI-gestützte Einblicke für jede Woche Ihrer Schwangerschaft.",
      pt: "Obtenha insights com IA para cada semana de sua gravidez.",
      tr: "Hamileliğinizin her haftası için yapay zeka destekli bilgiler alın.",
    },
  },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const lang = (url.searchParams.get("lang") || "en").toLowerCase();
  const meta = FEED_META[lang] || FEED_META.en;

  const buildDate = new Date().toUTCString();

  const items = TOOLS.map((tool) => {
    const title = tool.titles[lang] || tool.titles.en;
    const desc = tool.descriptions[lang] || tool.descriptions.en;
    const link = `${BASE_URL}/tools/${tool.id}?lang=${lang}`;
    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>${escapeXml(desc)}</description>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${buildDate}</pubDate>
      <dc:creator>${escapeXml(meta.brand)}</dc:creator>
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${BASE_URL}/${lang}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/functions/v1/rss-feed?lang=${lang}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icons/icon-512x512.png</url>
      <title>${escapeXml(meta.brand)}</title>
      <link>${BASE_URL}/${lang}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
});
