import { useTranslation } from "react-i18next";
import { Heart, Baby, Activity, Brain, Shield, Clock } from "lucide-react";

export function SEOContent() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const seoKeywords: Record<string, string[]> = {
    ar: [
      "حاسبة الحمل", "حاسبة موعد الولادة", "عداد حركة الجنين", "متابعة الحمل",
      "نمو الجنين", "أعراض الحمل", "تغذية الحامل", "تمارين الحامل",
      "نصائح الحمل", "مراحل الحمل", "الحمل أسبوع بأسبوع", "حقيبة الولادة",
      "علامات الولادة", "الطلق", "الرضاعة الطبيعية", "ما بعد الولادة",
      "التبويض", "الخصوبة", "حاسبة التبويض", "الدورة الشهرية",
      "صحة الحامل", "فحوصات الحمل", "سكري الحمل", "ضغط الحمل"
    ],
    en: [
      "pregnancy calculator", "due date calculator", "kick counter", "pregnancy tracker",
      "baby growth", "pregnancy symptoms", "prenatal nutrition", "pregnancy exercises",
      "pregnancy tips", "pregnancy stages", "week by week pregnancy", "hospital bag",
      "labor signs", "contractions", "breastfeeding", "postpartum care",
      "ovulation", "fertility", "ovulation calculator", "menstrual cycle",
      "maternal health", "prenatal tests", "gestational diabetes", "preeclampsia"
    ],
    de: [
      "Schwangerschaftsrechner", "Geburtsterminrechner", "Kindsbewegungen zählen", "Schwangerschafts-Tracker",
      "Babywachstum", "Schwangerschaftssymptome", "Ernährung in der Schwangerschaft", "Schwangerschaftsübungen",
      "Schwangerschaftstipps", "Schwangerschaftsphasen", "Schwangerschaft Woche für Woche", "Kliniktasche",
      "Wehenzeichen", "Wehen", "Stillen", "Wochenbett",
      "Eisprung", "Fruchtbarkeit", "Eisprungrechner", "Menstruationszyklus",
      "Muttergesundheit", "Vorsorgeuntersuchungen", "Schwangerschaftsdiabetes", "Präeklampsie"
    ],
    fr: [
      "calculatrice de grossesse", "calculateur de date d'accouchement", "compteur de coups de pied", "suivi de grossesse",
      "croissance du bébé", "symptômes de grossesse", "nutrition prénatale", "exercices de grossesse",
      "conseils de grossesse", "étapes de la grossesse", "grossesse semaine par semaine", "valise de maternité",
      "signes du travail", "contractions", "allaitement", "soins post-partum",
      "ovulation", "fertilité", "calculateur d'ovulation", "cycle menstruel",
      "santé maternelle", "examens prénataux", "diabète gestationnel", "prééclampsie"
    ],
    es: [
      "calculadora de embarazo", "calculadora de fecha de parto", "contador de patadas", "seguimiento de embarazo",
      "crecimiento del bebé", "síntomas de embarazo", "nutrición prenatal", "ejercicios de embarazo",
      "consejos de embarazo", "etapas del embarazo", "embarazo semana a semana", "bolsa de hospital",
      "señales de parto", "contracciones", "lactancia materna", "cuidado posparto",
      "ovulación", "fertilidad", "calculadora de ovulación", "ciclo menstrual",
      "salud materna", "pruebas prenatales", "diabetes gestacional", "preeclampsia"
    ],
    tr: [
      "gebelik hesaplayıcı", "doğum tarihi hesaplayıcı", "bebek tekme sayacı", "hamilelik takibi",
      "bebek büyümesi", "hamilelik belirtileri", "doğum öncesi beslenme", "hamilelik egzersizleri",
      "hamilelik ipuçları", "hamilelik aşamaları", "hafta hafta hamilelik", "hastane çantası",
      "doğum belirtileri", "kasılmalar", "emzirme", "doğum sonrası bakım",
      "yumurtlama", "doğurganlık", "yumurtlama hesaplayıcı", "adet döngüsü",
      "anne sağlığı", "doğum öncesi testler", "gebelik şekeri", "preeklampsi"
    ],
    pt: [
      "calculadora de gravidez", "calculadora de data de parto", "contador de chutes", "acompanhamento de gravidez",
      "crescimento do bebê", "sintomas de gravidez", "nutrição pré-natal", "exercícios na gravidez",
      "dicas de gravidez", "fases da gravidez", "gravidez semana a semana", "mala de maternidade",
      "sinais de trabalho de parto", "contrações", "amamentação", "cuidados pós-parto",
      "ovulação", "fertilidade", "calculadora de ovulação", "ciclo menstrual",
      "saúde materna", "exames pré-natais", "diabetes gestacional", "pré-eclâmpsia"
    ]
  };

  const currentKeywords = seoKeywords[i18n.language] || seoKeywords.en;

  const features = [
    {
      icon: Baby,
      titleAr: "متابعة نمو الجنين",
      titleEn: "Baby Growth Tracking",
      descAr: "تتبعي تطور طفلك أسبوعياً مع مقارنات حجم الفاكهة والمعالم التنموية",
      descEn: "Track your baby's weekly development with fruit size comparisons and milestones"
    },
    {
      icon: Activity,
      titleAr: "عداد حركة الجنين",
      titleEn: "Kick Counter",
      descAr: "سجلي حركات طفلك وتابعي أنماط النشاط للاطمئنان على صحته",
      descEn: "Record baby movements and monitor activity patterns for peace of mind"
    },
    {
      icon: Brain,
      titleAr: "مساعد الحمل بالذكاء الاصطناعي",
      titleEn: "AI Pregnancy Assistant",
      descAr: "احصلي على إجابات فورية لأسئلتك من مساعد ذكي متخصص في الحمل",
      descEn: "Get instant answers to your questions from an AI specialized in pregnancy"
    },
    {
      icon: Heart,
      titleAr: "صحة الأم والجنين",
      titleEn: "Maternal & Fetal Health",
      descAr: "نصائح يومية مخصصة للتغذية والتمارين والعناية بصحتك وصحة طفلك",
      descEn: "Personalized daily tips for nutrition, exercise, and caring for you and your baby"
    },
    {
      icon: Clock,
      titleAr: "مؤقت الطلق",
      titleEn: "Contraction Timer",
      descAr: "قياس دقيق لوقت ومدة الانقباضات لمعرفة الوقت المناسب للذهاب للمستشفى",
      descEn: "Accurately measure contraction timing to know when to go to the hospital"
    },
    {
      icon: Shield,
      titleAr: "خصوصية وأمان",
      titleEn: "Privacy & Security",
      descAr: "بياناتك مشفرة ومحمية - خصوصيتك أولويتنا القصوى",
      descEn: "Your data is encrypted and protected - your privacy is our top priority"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* SEO Rich Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isRTL ? "أفضل تطبيق لمتابعة الحمل" : "Best Pregnancy Tracking App"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            {isRTL 
              ? "تطبيق الحمل الشامل مع 42+ أداة ذكية لكل مرحلة من رحلة الأمومة - من التخطيط للحمل حتى ما بعد الولادة. مجاني 100% ومتوفر بـ 7 لغات."
              : "Complete pregnancy app with 42+ AI-powered tools for every stage of motherhood - from planning to postpartum. 100% free and available in 7 languages."
            }
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRTL ? feature.descAr : feature.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* SEO Keywords Cloud - Hidden but crawlable */}
        <div className="sr-only" aria-hidden="false">
          <h3>
            {isRTL ? "كلمات مفتاحية للبحث" : "Search Keywords"}
          </h3>
          <ul>
            {currentKeywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>

        {/* Visible Keywords Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {currentKeywords.slice(0, 12).map((keyword, index) => (
            <span 
              key={index}
              className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
