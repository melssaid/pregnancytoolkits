import { useTranslation } from "react-i18next";
import { Heart, Baby, Activity, Brain, Shield, Clock, Sparkles, BookOpen, Apple, Users } from "lucide-react";

export function SEOContent() {
  const { t, i18n } = useTranslation();

  const seoKeywords: Record<string, string[]> = {
    ar: [
      "دليل الحمل", "موعد الولادة المتوقع", "يوميات حركة الجنين", "متابعة الحمل",
      "نمو الجنين", "أعراض الحمل", "تغذية الحامل", "تمارين الحامل",
      "نصائح الحمل", "مراحل الحمل", "الحمل أسبوع بأسبوع", "حقيبة الولادة",
      "علامات الولادة", "الطلق", "الرضاعة الطبيعية", "ما بعد الولادة",
      "التبويض", "الخصوبة", "متابعة التبويض", "الدورة الشهرية",
      "صحة الحامل", "خطة الولادة", "تغذية المولود", "حاسبة الحمل",
      "أدوات الحمل", "تطبيق الحمل", "حاسبة موعد الولادة", "حاسبة الحمل بالأسابيع",
      "تطبيق حمل ذكي", "متابعة الحمل مجاناً", "عداد ركلات الجنين", "مؤقت الانقباضات",
      "وزن الحامل", "فيتامينات الحمل", "نصائح الحمل اليومية", "حاسبة التبويض",
      "تقلصات الولادة", "حركة الجنين", "رحلة الأمومة", "حاسبة الولادة",
      "جدول الحمل", "مراحل نمو الجنين", "تطور الجنين بالأسابيع", "أعراض الحمل المبكرة",
      "غثيان الحمل", "علاج غثيان الصباح", "حمض الفوليك", "الحمل في الشهر التاسع",
      "تحضير حقيبة الولادة", "الولادة الطبيعية", "الولادة القيصرية", "نصائح للحامل البكر",
      "تمارين كيجل للحامل", "يوغا الحمل", "نوم الحامل", "آلام الظهر للحامل",
      "سكر الحمل", "ضغط الدم للحامل", "فحوصات الحمل", "السونار",
      "تحليل الحمل المنزلي", "موعد الولادة بالهجري", "حساب الحمل بالأشهر",
      "تطبيق حامل", "أفضل تطبيق حمل", "تطبيق حمل عربي", "متابعة الحمل يومياً",
      "تغذية الحامل في رمضان", "وصفات للحامل", "مشروبات مفيدة للحامل"
    ],
    en: [
      "pregnancy guide", "due date calculator", "baby movement diary", "pregnancy tracker",
      "baby growth", "pregnancy symptoms", "prenatal nutrition", "pregnancy exercises",
      "pregnancy tips", "pregnancy stages", "week by week pregnancy", "hospital bag",
      "labor signs", "contractions", "breastfeeding", "postpartum care",
      "ovulation", "fertility", "ovulation tracker", "menstrual cycle",
      "birth plan", "pregnancy fitness", "newborn care", "pregnancy journal",
      "smart pregnancy tools", "pregnancy toolkit", "all in one pregnancy app",
      "pregnancy calculator", "pregnancy app with AI", "baby size by week",
      "pregnancy companion", "kick counter", "contraction timer",
      "pregnancy app free", "best pregnancy app 2026", "pregnancy calendar",
      "pregnancy countdown", "pregnancy planner", "pregnancy milestone tracker",
      "pregnancy health tips", "pregnancy yoga", "kegel exercises pregnancy",
      "postpartum mental health", "baby feeding tracker", "diaper tracker app",
      "morning sickness remedies", "pregnancy sleep tips", "prenatal vitamins",
      "pregnancy weight gain calculator", "baby development week by week",
      "pregnancy to-do list", "pregnancy checklist", "maternity app",
      "expecting mother app", "baby bump tracker", "pregnancy symptoms checker",
      "pregnancy nutrition plan", "first trimester guide", "second trimester tips",
      "third trimester preparation", "labor preparation", "newborn essentials",
      "pregnancy meal planner", "pregnancy workout safe", "gestational diabetes",
      "preeclampsia symptoms", "baby names generator", "pregnancy announcement ideas",
      "pregnancy app no account needed", "pregnancy tools free", "fetal development tracker",
      "baby heartbeat monitor", "pregnancy mood tracker", "prenatal care guide"
    ],
    de: [
      "Schwangerschaftsratgeber", "Geburtsterminrechner", "Baby-Bewegungstagebuch", "Schwangerschafts-Tracker",
      "Babywachstum", "Schwangerschaftssymptome", "Ernährung Schwangerschaft", "Schwangerschaftsübungen",
      "Schwangerschaftstipps", "Schwangerschaftsphasen", "Woche für Woche", "Kliniktasche",
      "Wehenzeichen", "Wehen", "Stillen", "Wochenbett",
      "Eisprung", "Fruchtbarkeit", "Geburtsplan", "Menstruationszyklus",
      "Schwangerschaftsrechner", "SSW Rechner", "Schwangerschafts-App kostenlos",
      "Schwangerschaftskalender", "Baby Entwicklung", "Wehen Timer",
      "Schwangerschaftswochen", "Geburtsvorbereitung", "Vorsorgeuntersuchungen",
      "Schwangerschaftsdiabetes", "Präeklampsie", "Kaiserschnitt", "Natürliche Geburt",
      "Schwangerschaftsübelkeit", "Folsäure Schwangerschaft", "Pränataldiagnostik",
      "Schwangerschaftsgymnastik", "Beckenbodentraining", "Yoga Schwangerschaft",
      "Schwangerschaftsmode", "Babyerstausstattung", "Geburtsplan erstellen",
      "Schwangerschafts-App", "Beste Schwangerschafts-App", "Schwangerschaft Ernährungsplan",
      "Baby Größe pro Woche", "Schwangerschaftsbeschwerden", "Rückenschmerzen Schwangerschaft",
      "Schlafposition Schwangerschaft", "Hebamme finden", "Geburtshaus",
      "Schwangerschaftstagebuch", "Mutterschutz", "Elternzeit planen",
      "Schwangerschaftsvitamine", "Kindsbewegungen zählen", "CTG Werte",
      "Nackenfaltenmessung", "Ultraschall Schwangerschaft", "Gewichtszunahme Schwangerschaft",
      "Schwangerschaftsstreifen", "Stillvorbereitung", "Babyzimmer einrichten",
      "Erstausstattung Baby", "Wochenbett Tipps", "Rückbildungsgymnastik",
      "Nachsorge Hebamme", "Babypflege Tipps", "Schwangerschafts-Tracker kostenlos",
      "SSW berechnen", "Entbindungstermin berechnen", "Schwangerschaft Trimester",
      "Schwangerschaft Checkliste", "Klinikkoffer packen", "Kreißsaal",
      "Geburtsanzeichen erkennen", "Frühgeburt Anzeichen", "Muttermilch",
      "Beikost einführen", "Schwangerschafts-Toolkit", "Schwangerschaft App deutsch"
    ],
    fr: [
      "guide de grossesse", "date d'accouchement", "mouvements bébé", "suivi de grossesse",
      "croissance bébé", "symptômes grossesse", "nutrition prénatale", "exercices grossesse",
      "conseils grossesse", "étapes grossesse", "semaine par semaine", "valise maternité",
      "signes travail", "contractions", "allaitement", "post-partum",
      "ovulation", "fertilité", "plan de naissance", "cycle menstruel",
      "calculateur grossesse", "application grossesse gratuite", "compteur contractions",
      "suivi bébé semaine par semaine", "date accouchement prévue",
      "calendrier grossesse", "préparation accouchement", "échographie grossesse",
      "diabète gestationnel", "pré-éclampsie", "césarienne", "accouchement naturel",
      "nausées grossesse", "acide folique", "diagnostic prénatal",
      "gymnastique prénatale", "yoga prénatal", "périnée grossesse",
      "trousseau maternité", "liste naissance", "plan de naissance personnalisé",
      "application grossesse", "meilleure application grossesse", "régime grossesse",
      "taille bébé par semaine", "maux de grossesse", "mal de dos grossesse",
      "position sommeil grossesse", "sage-femme", "maison de naissance",
      "journal de grossesse", "congé maternité", "congé parental",
      "vitamines grossesse", "compter mouvements bébé", "monitoring grossesse",
      "clarté nucale", "échographie 3D", "prise de poids grossesse",
      "vergetures grossesse", "préparation allaitement", "chambre bébé",
      "trousseau bébé", "rééducation périnéale", "retour de couches",
      "soins post-partum", "lait maternel", "diversification alimentaire",
      "application grossesse française", "suivi grossesse gratuit", "trimestre grossesse",
      "checklist grossesse", "sac maternité", "salle accouchement",
      "signes accouchement", "accouchement prématuré", "allaitement maternel",
      "application enceinte", "outils grossesse intelligents"
    ],
    es: [
      "guía embarazo", "fecha de parto", "movimientos bebé", "seguimiento embarazo",
      "crecimiento bebé", "síntomas embarazo", "nutrición prenatal", "ejercicios embarazo",
      "consejos embarazo", "etapas embarazo", "semana a semana", "bolsa hospital",
      "señales parto", "contracciones", "lactancia", "posparto",
      "ovulación", "fertilidad", "plan de parto", "ciclo menstrual",
      "calculadora embarazo", "aplicación embarazo gratis", "contador patadas bebé",
      "calendario embarazo", "fecha probable de parto",
      "preparación parto", "ecografía embarazo", "diabetes gestacional",
      "preeclampsia", "cesárea", "parto natural", "náuseas embarazo",
      "ácido fólico", "diagnóstico prenatal", "gimnasia prenatal",
      "yoga prenatal", "suelo pélvico embarazo", "canastilla bebé",
      "lista nacimiento", "plan parto personalizado", "app embarazo",
      "mejor app embarazo", "dieta embarazo", "tamaño bebé por semana",
      "molestias embarazo", "dolor espalda embarazo", "posición dormir embarazo",
      "matrona", "hospital maternidad", "diario embarazo",
      "baja maternidad", "permiso parental", "vitaminas embarazo",
      "contar movimientos bebé", "monitor fetal", "ecografía 3D",
      "aumento peso embarazo", "estrías embarazo", "preparar lactancia",
      "habitación bebé", "ajuar bebé", "recuperación posparto",
      "cuarentena posparto", "leche materna", "alimentación complementaria",
      "app embarazo español", "seguimiento embarazo gratis", "trimestres embarazo",
      "checklist embarazo", "maleta hospital", "sala partos",
      "señales parto prematuro", "lactancia materna", "herramientas embarazo inteligentes"
    ],
    tr: [
      "hamilelik rehberi", "doğum tarihi", "bebek hareketleri", "hamilelik takibi",
      "bebek büyümesi", "hamilelik belirtileri", "beslenme", "hamilelik egzersizleri",
      "hamilelik ipuçları", "hamilelik aşamaları", "hafta hafta", "hastane çantası",
      "doğum belirtileri", "kasılmalar", "emzirme", "doğum sonrası",
      "yumurtlama", "doğurganlık", "doğum planı", "adet döngüsü",
      "hamilelik hesaplama", "hamilelik uygulaması ücretsiz", "gebelik haftası",
      "bebek gelişimi hafta hafta", "doğum tarihi hesaplama",
      "doğum hazırlığı", "ultrason hamilelik", "gebelik diyabeti",
      "preeklampsi", "sezaryen", "normal doğum", "hamilelik bulantısı",
      "folik asit", "doğum öncesi tanı", "hamilelik jimnastiği",
      "hamilelik yogası", "pelvik taban egzersizleri", "bebek çeyizi",
      "doğum listesi", "kişisel doğum planı", "hamilelik uygulaması",
      "en iyi hamilelik uygulaması", "hamilelik diyeti", "bebek boyutu haftalık",
      "hamilelik şikayetleri", "bel ağrısı hamilelik", "uyku pozisyonu hamilelik",
      "ebe", "doğum hastanesi", "hamilelik günlüğü",
      "doğum izni", "ebeveyn izni", "hamilelik vitaminleri",
      "bebek hareketlerini sayma", "fetal monitör", "3D ultrason",
      "kilo alımı hamilelik", "çatlaklar hamilelik", "emzirme hazırlığı",
      "bebek odası", "bebek eşyaları", "doğum sonrası iyileşme",
      "lohusalık dönemi", "anne sütü", "ek gıdaya geçiş",
      "hamilelik uygulaması Türkçe", "hamilelik takibi ücretsiz", "trimester hamilelik",
      "hamilelik kontrol listesi", "hastane çantası hazırlığı", "doğumhane",
      "erken doğum belirtileri", "anne sütü faydaları", "akıllı hamilelik araçları"
    ],
    pt: [
      "guia gravidez", "data de parto", "movimentos bebê", "acompanhamento gravidez",
      "crescimento bebê", "sintomas gravidez", "nutrição pré-natal", "exercícios gravidez",
      "dicas gravidez", "fases gravidez", "semana a semana", "mala maternidade",
      "sinais parto", "contrações", "amamentação", "pós-parto",
      "ovulação", "fertilidade", "plano de parto", "ciclo menstrual",
      "calculadora gravidez", "aplicativo gravidez grátis", "contador movimentos bebê",
      "calendário gravidez", "data provável do parto",
      "preparação parto", "ultrassom gravidez", "diabetes gestacional",
      "pré-eclâmpsia", "cesárea", "parto normal", "enjoo gravidez",
      "ácido fólico", "diagnóstico pré-natal", "ginástica pré-natal",
      "yoga pré-natal", "assoalho pélvico gravidez", "enxoval bebê",
      "lista nascimento", "plano parto personalizado", "app gravidez",
      "melhor app gravidez", "dieta gravidez", "tamanho bebê por semana",
      "desconfortos gravidez", "dor nas costas gravidez", "posição dormir gravidez",
      "parteira", "maternidade hospital", "diário gravidez",
      "licença maternidade", "licença parental", "vitaminas gravidez",
      "contar movimentos bebê", "monitor fetal", "ultrassom 3D",
      "ganho peso gravidez", "estrias gravidez", "preparar amamentação",
      "quarto bebê", "enxoval completo", "recuperação pós-parto",
      "quarentena pós-parto", "leite materno", "introdução alimentar",
      "app gravidez português", "acompanhamento gravidez grátis", "trimestres gravidez",
      "checklist gravidez", "mala maternidade completa", "sala de parto",
      "sinais parto prematuro", "aleitamento materno", "ferramentas gravidez inteligentes"
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

  const articleSections = [
    { titleKey: "seoArticle.firstTrimesterTitle", contentKey: "seoArticle.firstTrimesterContent", icon: Baby },
    { titleKey: "seoArticle.secondTrimesterTitle", contentKey: "seoArticle.secondTrimesterContent", icon: Activity },
    { titleKey: "seoArticle.thirdTrimesterTitle", contentKey: "seoArticle.thirdTrimesterContent", icon: Clock },
    { titleKey: "seoArticle.fertilityTitle", contentKey: "seoArticle.fertilityContent", icon: Sparkles },
    { titleKey: "seoArticle.birthTitle", contentKey: "seoArticle.birthContent", icon: Heart },
    { titleKey: "seoArticle.postpartumTitle", contentKey: "seoArticle.postpartumContent", icon: Users },
  ];

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Features Grid */}
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

        {/* Rich SEO Article Sections */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t('seoArticle.pregnancyTitle')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('seoArticle.pregnancyIntro')}
            </p>
          </div>

          <div className="space-y-5">
            {articleSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <article key={index} className="bg-card/60 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-lg bg-primary/10">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {t(section.titleKey)}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(section.contentKey)}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Fertility Tips & Wellness */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  {i18n.language === 'ar' ? 'نصائح العافية اليومية' : t('seoArticle.wellnessTips').split(':')[0]}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('seoArticle.wellnessTips')}
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  {i18n.language === 'ar' ? 'نصائح الخصوبة' : t('seoArticle.fertilityTips').split(':')[0]}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('seoArticle.fertilityTips')}
              </p>
            </div>
          </div>

          {/* Birth Preparation */}
          <div className="mt-5 bg-card/60 border border-border/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('seoArticle.birthPreparation')}
            </p>
          </div>

          {/* App Benefits */}
          <div className="mt-5 text-center">
            <p className="text-xs text-primary font-medium leading-relaxed">
              {t('seoArticle.appBenefits')}
            </p>
          </div>
        </div>

        {/* Keywords Cloud */}
        <div className="flex flex-wrap justify-center gap-2">
          {currentKeywords.map((keyword, index) => (
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
