import { useTranslation } from "react-i18next";
import { Heart, Baby, Activity, Brain, Shield, Clock } from "lucide-react";

export function SEOContent() {
  const { t, i18n } = useTranslation();

  const seoKeywords: Record<string, string[]> = {
    ar: [
      "دليل الحمل", "موعد الولادة المتوقع", "يوميات حركة الجنين", "متابعة الحمل",
      "نمو الجنين", "أعراض الحمل", "تغذية الحامل", "تمارين الحامل",
      "نصائح الحمل", "مراحل الحمل", "الحمل أسبوع بأسبوع", "حقيبة الولادة",
      "علامات الولادة", "الطلق", "الرضاعة الطبيعية", "ما بعد الولادة",
      "التبويض", "الخصوبة", "متابعة التبويض", "الدورة الشهرية",
      "صحة الحامل", "متابعة صحة الحمل", "توعية سكري الحمل", "توعية ضغط الحمل"
    ],
    en: [
      "pregnancy guide", "due date estimator", "baby movement diary", "pregnancy tracker",
      "baby growth", "pregnancy symptoms", "prenatal nutrition", "pregnancy exercises",
      "pregnancy tips", "pregnancy stages", "week by week pregnancy", "hospital bag",
      "labor signs", "contractions", "breastfeeding", "postpartum care",
      "ovulation", "fertility", "ovulation tracker", "menstrual cycle",
      "maternal wellness", "prenatal wellness", "gestational diabetes awareness", "preeclampsia awareness"
    ],
    de: [
      "Schwangerschaftsratgeber", "Geburtstermin-Schätzer", "Baby-Bewegungstagebuch", "Schwangerschafts-Tracker",
      "Babywachstum", "Schwangerschaftssymptome", "Ernährung in der Schwangerschaft", "Schwangerschaftsübungen",
      "Schwangerschaftstipps", "Schwangerschaftsphasen", "Schwangerschaft Woche für Woche", "Kliniktasche",
      "Wehenzeichen", "Wehen", "Stillen", "Wochenbett",
      "Eisprung", "Fruchtbarkeit", "Eisprung-Tracker", "Menstruationszyklus",
      "Muttergesundheit", "Schwangerschafts-Wellness", "Schwangerschaftsdiabetes Bewusstsein", "Präeklampsie Bewusstsein"
    ],
    fr: [
      "guide de grossesse", "estimation de date d'accouchement", "journal des mouvements bébé", "suivi de grossesse",
      "croissance du bébé", "symptômes de grossesse", "nutrition prénatale", "exercices de grossesse",
      "conseils de grossesse", "étapes de la grossesse", "grossesse semaine par semaine", "valise de maternité",
      "signes du travail", "contractions", "allaitement", "soins post-partum",
      "ovulation", "fertilité", "suivi d'ovulation", "cycle menstruel",
      "bien-être maternel", "bien-être prénatal", "sensibilisation au diabète gestationnel", "sensibilisation à la prééclampsie"
    ],
    es: [
      "guía de embarazo", "estimador de fecha de parto", "diario de movimientos del bebé", "seguimiento de embarazo",
      "crecimiento del bebé", "síntomas de embarazo", "nutrición prenatal", "ejercicios de embarazo",
      "consejos de embarazo", "etapas del embarazo", "embarazo semana a semana", "bolsa de hospital",
      "señales de parto", "contracciones", "lactancia materna", "cuidado posparto",
      "ovulación", "fertilidad", "seguimiento de ovulación", "ciclo menstrual",
      "bienestar materno", "bienestar prenatal", "conciencia sobre diabetes gestacional", "conciencia sobre preeclampsia"
    ],
    tr: [
      "hamilelik rehberi", "tahmini doğum tarihi", "bebek hareket günlüğü", "hamilelik takibi",
      "bebek büyümesi", "hamilelik belirtileri", "doğum öncesi beslenme", "hamilelik egzersizleri",
      "hamilelik ipuçları", "hamilelik aşamaları", "hafta hafta hamilelik", "hastane çantası",
      "doğum belirtileri", "kasılmalar", "emzirme", "doğum sonrası bakım",
      "yumurtlama", "doğurganlık", "yumurtlama takibi", "adet döngüsü",
      "anne sağlığı", "hamilelik sağlığı", "gebelik şekeri farkındalığı", "preeklampsi farkındalığı"
    ],
    pt: [
      "guia de gravidez", "estimativa de data de parto", "diário de movimentos do bebê", "acompanhamento de gravidez",
      "crescimento do bebê", "sintomas de gravidez", "nutrição pré-natal", "exercícios na gravidez",
      "dicas de gravidez", "fases da gravidez", "gravidez semana a semana", "mala de maternidade",
      "sinais de trabalho de parto", "contrações", "amamentação", "cuidados pós-parto",
      "ovulação", "fertilidade", "acompanhamento de ovulação", "ciclo menstrual",
      "bem-estar materno", "bem-estar pré-natal", "conscientização sobre diabetes gestacional", "conscientização sobre pré-eclâmpsia"
    ]
  };

  const currentKeywords = seoKeywords[i18n.language] || seoKeywords.en;

  const features = [
    { icon: Baby, titleKey: "seo.babyGrowth", descKey: "seo.babyGrowthDesc" },
    { icon: Activity, titleKey: "seo.kickCounter", descKey: "seo.kickCounterDesc" },
    { icon: Brain, titleKey: "seo.aiAssistant", descKey: "seo.aiAssistantDesc" },
    { icon: Heart, titleKey: "seo.maternalHealth", descKey: "seo.maternalHealthDesc" },
    { icon: Clock, titleKey: "seo.contractionTimer", descKey: "seo.contractionTimerDesc" },
    { icon: Shield, titleKey: "seo.privacy", descKey: "seo.privacyDesc" },
  ];

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-base font-bold text-foreground mb-3">
            {t('seo.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            {t('seo.description')}
          </p>
        </div>

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
                    {t(feature.titleKey)}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>

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
