import type { Video, VideosByLang } from '@/components/VideoLibrary';

/**
 * Centralized language-specific video data for all tools.
 * Each tool has curated videos in: ar, tr, de, fr, es, pt, and default (en).
 * Arabic videos are curated for modest, conservative content.
 */

// ════════════════════════════════════════════════════════════
// MEAL SUGGESTION / NUTRITION
// ════════════════════════════════════════════════════════════
export const nutritionVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "تغذية الحامل في الثلث الثاني", description: "أهم المأكولات لتغذية الحامل", youtubeId: "fYsBctNUamo", duration: "10:00", category: "تغذية" },
    { id: "2", title: "ماذا تأكل الحامل في الشهر التاسع", description: "غذاء صحي لصحة الجنين في الأشهر الأخيرة", youtubeId: "3ggC4hbvjkc", duration: "12:00", category: "تغذية" },
    { id: "3", title: "الأكل الممنوع للحامل في الشهور الأولى", description: "الأطعمة التي يجب تجنبها خلال فترة الحمل", youtubeId: "1xVgisdrTUY", duration: "10:00", category: "سلامة غذائية" },
    { id: "4", title: "أفضل نظام غذائي لسكري الحمل", description: "نصائح شاملة من أخصائية تغذية", youtubeId: "UqYAbM8Drl4", duration: "15:00", category: "حمية خاصة" },
    { id: "5", title: "الأكل بعد الولادة القيصرية والطبيعية", description: "متى يبدأ وكيف يسرع التعافي", youtubeId: "lyFyFCOR4Ms", duration: "12:00", category: "وصفات" },
    { id: "6", title: "أهم الأسئلة عن تغذية الحامل", description: "نصائح طبية شاملة حول التغذية أثناء الحمل", youtubeId: "lzE61vNG3Ug", duration: "14:00", category: "تغذية" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Beslenme Rehberi", description: "Gebelikte doğru beslenme ve önemli besinler", youtubeId: "0_z0oqZyHq8", duration: "15:00", category: "Beslenme" },
    { id: "2", title: "Hamilelikte Sağlıklı Beslenme", description: "Sağlıklı beslenme için gıda seçimi", youtubeId: "LhN0BxSKWN8", duration: "10:00", category: "Beslenme" },
    { id: "3", title: "Hamilelikte Sağlıklı Tarifler", description: "Kolay ve besleyici hamilelik tarifleri", youtubeId: "ohLIZdyOKFs", duration: "10:00", category: "Tarifler" },
    { id: "4", title: "Gebelik Diyabetinde Beslenme", description: "Gestasyonel diyabette doğru beslenme planı", youtubeId: "9yx64E6BZ6g", duration: "14:00", category: "Özel Diyet" },
  ],
  de: [
    { id: "1", title: "Gewichtszunahme in der Schwangerschaft", description: "Wie viel Gewicht ist normal? Hebamme erklärt", youtubeId: "4JfuBEJLbDc", duration: "12:00", category: "Ernährung" },
    { id: "2", title: "Worauf Schwangere bei der Ernährung achten sollten", description: "Ärztliche Empfehlungen zur Ernährung", youtubeId: "M3dMkgv2JPw", duration: "15:00", category: "Ernährung" },
    { id: "3", title: "Verbotene Lebensmittel", description: "Was Sie in der Schwangerschaft meiden sollten", youtubeId: "VxFhaplv7dc", duration: "10:00", category: "Sicherheit" },
    { id: "4", title: "Schwangerschaftsdiabetes Ernährung", description: "Richtige Ernährung bei Gestationsdiabetes", youtubeId: "96zbdupk5xo", duration: "11:00", category: "Spezialdiät" },
  ],
  fr: [
    { id: "1", title: "15 infos pour les femmes enceintes", description: "Suivi de grossesse: alimentation, vaccins, vitamines", youtubeId: "NoyKEfe-t2k", duration: "14:00", category: "Nutrition" },
    { id: "2", title: "Vitamines et grossesse", description: "Complémentation en acide folique et vitamines essentielles", youtubeId: "LFP2b6Hdgeo", duration: "10:00", category: "Nutrition" },
    { id: "3", title: "Régime lors de Diabète gestationnel", description: "Conseils alimentaires pour le diabète de grossesse", youtubeId: "jG_GaN_VREI", duration: "12:00", category: "Régime spécial" },
    { id: "4", title: "Alimentation pendant la grossesse", description: "Guide nutritionnel complet pour femmes enceintes", youtubeId: "EswSlduwhDg", duration: "14:00", category: "Nutrition" },
  ],
  es: [
    { id: "1", title: "Alimentos recomendables en el embarazo", description: "Qué alimentos son los más recomendables", youtubeId: "8EhS6tIljiY", duration: "14:00", category: "Nutrición" },
    { id: "2", title: "Alimentos prohibidos y permitidos", description: "Qué comer y qué evitar durante el embarazo", youtubeId: "spRcfWdfqMY", duration: "12:00", category: "Seguridad" },
    { id: "3", title: "10 alimentos que toda embarazada debe comer", description: "Alimentos esenciales durante la gestación", youtubeId: "7Mr1uIWJ2CE", duration: "10:00", category: "Nutrición" },
    { id: "4", title: "Frutas para embarazadas", description: "Las 6 frutas que toda embarazada debería comer", youtubeId: "ViLkH2FN0m8", duration: "8:00", category: "Nutrición" },
    { id: "5", title: "Diabetes gestacional - Dieta", description: "Plan alimenticio para diabetes en el embarazo", youtubeId: "0qrlkS0AU7U", duration: "11:00", category: "Dieta especial" },
  ],
  pt: [
    { id: "1", title: "Alimentos proibidos na gravidez", description: "O que não pode comer na gestação", youtubeId: "qHIkg_bqU4A", duration: "12:00", category: "Segurança" },
    { id: "2", title: "O que comer na gravidez", description: "Alimentos essenciais para mãe e bebê", youtubeId: "qFpOwKdJTwo", duration: "12:00", category: "Nutrição" },
    { id: "3", title: "Alimentação na gravidez", description: "Guia nutricional completo para gestantes", youtubeId: "83irOqL0DUc", duration: "14:00", category: "Nutrição" },
    { id: "4", title: "Introdução alimentar do bebê", description: "Alimentação equilibrada para bebê de 6 meses", youtubeId: "yoA_k8Vx0N8", duration: "15:00", category: "Pós-parto" },
  ],
  default: [
    { id: "1", title: "Healthy Pregnancy Meal Plan", description: "Step-by-step guide to healthy eating during pregnancy", youtubeId: "vNZ2GsJOsZc", duration: "18:42", category: "Nutrition" },
    { id: "2", title: "What A Nutritionist Eats Pregnant", description: "Daily meals and tips from a certified nutritionist", youtubeId: "xZs3gCHcjhY", duration: "14:23", category: "Nutrition" },
    { id: "3", title: "Top 10 Foods For Pregnancy", description: "Best foods to eat during pregnancy with free meal plan", youtubeId: "3GTK6MLPJ9g", duration: "12:15", category: "Nutrition" },
    { id: "4", title: "10 Foods I Eat Every Day Pregnant", description: "Daily pregnancy superfoods for you and baby", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Nutrition" },
    { id: "5", title: "Diet by Trimester - Dietitian Guide", description: "What to eat in each trimester - expert advice", youtubeId: "dq7ovxsAfX8", duration: "15:45", category: "Trimester Guide" },
    { id: "6", title: "First & Second Trimester Diet", description: "Pregnancy diet chart for healthy baby development", youtubeId: "Y0FdMnvyTC4", duration: "13:20", category: "Trimester Guide" },
    { id: "7", title: "5 Weeks Pregnant - Diet Tips", description: "Early pregnancy dietary and lifestyle changes", youtubeId: "cq4LJM5Vh2o", duration: "10:15", category: "Trimester Guide" },
    { id: "8", title: "Simple Pregnancy Meals", description: "5 quick and nutritious meal ideas for busy moms", youtubeId: "0QZWIuJGVZY", duration: "12:30", category: "Recipes" },
    { id: "9", title: "What I Eat 8 Months Pregnant", description: "Real meals in third trimester - honest and practical", youtubeId: "tAaoN09CHGM", duration: "16:45", category: "Recipes" },
    { id: "10", title: "15 Foods For Healthy Pregnancy", description: "Weekly foods for optimal pregnancy nutrition", youtubeId: "FprOVxmwzR8", duration: "14:20", category: "Recipes" },
    { id: "11", title: "Foods to Avoid While Pregnant", description: "UC Davis dietitian explains pregnancy food safety", youtubeId: "pozcaggYIWk", duration: "11:55", category: "Safety" },
    { id: "12", title: "Gestational Diabetes Diet", description: "Healthy eating with gestational diabetes - nutrition tips", youtubeId: "68NMhivpmWQ", duration: "9:30", category: "Special Diets" },
    { id: "13", title: "Gestational Diabetes Meal Plan", description: "What to eat with gestational diabetes - EatingWell", youtubeId: "DevakSgDEpU", duration: "8:45", category: "Special Diets" },
    { id: "14", title: "Gestational Diabetes Story", description: "Real experience and tips from Diabetes UK", youtubeId: "8xz4VCgx-uE", duration: "6:20", category: "Special Diets" },
    { id: "15", title: "Morning Sickness Smoothie", description: "Nausea-fighting smoothie with ginger and pineapple", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Special Diets" },
  ],
};

// ════════════════════════════════════════════════════════════
// SLEEP OPTIMIZER
// ════════════════════════════════════════════════════════════
export const sleepVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "تأمل استرخاء للحامل", description: "تأمل مهدئ لنوم أفضل أثناء الحمل", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "تأمل" },
    { id: "2", title: "نصائح لنوم أفضل أثناء الحمل", description: "كيف تحصلين على نوم مريح في الحمل", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "تأمل" },
    { id: "3", title: "تمارين إطالة آمنة للحامل", description: "تمارين إطالة للورك والظهر للحامل", youtubeId: "uWRwBBMFXys", duration: "12:00", category: "تمارين" },
    { id: "4", title: "أوضاع النوم الصحيحة للحامل", description: "أفضل وضعيات النوم أثناء الحمل", youtubeId: "qa7RY4V6ihM", duration: "10:00", category: "نصائح" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Uyku Meditasyonu", description: "Rahatlatıcı uyku meditasyonu hamileler için", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Meditasyon" },
    { id: "2", title: "Hamilelikte Rahat Uyku İpuçları", description: "Gebelikte daha iyi uyumak için öneriler", youtubeId: "ohLIZdyOKFs", duration: "12:00", category: "İpuçları" },
    { id: "3", title: "Prenatal Yoga ve Rahatlama", description: "Uyku öncesi derin rahatlama yogası", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Yoga" },
    { id: "4", title: "Yenidoğan Uyku Hazırlığı", description: "Bebek uyku düzenine hazırlık", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Hazırlık" },
  ],
  de: [
    { id: "1", title: "Schlafmeditation für Schwangere", description: "Beruhigende Meditation für besseren Schlaf", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Meditation" },
    { id: "2", title: "Besser schlafen in der Schwangerschaft", description: "Tipps für erholsamen Schlaf", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Tipps" },
    { id: "3", title: "Prenatal Yoga Entspannung", description: "Tiefenentspannung Yoga für Schwangere", youtubeId: "AzuIPejeHXA", duration: "10:00", category: "Yoga" },
    { id: "4", title: "Neugeborenen-Schlaf vorbereiten", description: "Baby Schlafrhythmus planen", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Vorbereitung" },
  ],
  fr: [
    { id: "1", title: "Méditation de sommeil pour enceintes", description: "Méditation apaisante pour mieux dormir", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Méditation" },
    { id: "2", title: "Mieux dormir pendant la grossesse", description: "Conseils pour un sommeil réparateur", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Conseils" },
    { id: "3", title: "Yoga prénatal relaxation", description: "Relaxation profonde pour futures mamans", youtubeId: "ZhtzgI1cmTA", duration: "15:00", category: "Yoga" },
    { id: "4", title: "Préparer le sommeil de bébé", description: "Organiser le rythme de sommeil du nouveau-né", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Préparation" },
  ],
  es: [
    { id: "1", title: "Meditación para dormir - Embarazadas", description: "Meditación relajante para un mejor sueño", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Meditación" },
    { id: "2", title: "Dormir mejor en el embarazo", description: "Consejos para un sueño reparador", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Consejos" },
    { id: "3", title: "Yoga prenatal - Relajación", description: "Yoga de relajación profunda para embarazadas", youtubeId: "gVwBXO3kqUc", duration: "20:00", category: "Yoga" },
    { id: "4", title: "Preparar el sueño del bebé", description: "Cómo organizar el horario de sueño del recién nacido", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Preparación" },
  ],
  pt: [
    { id: "1", title: "Meditação para dormir - Gestantes", description: "Meditação relaxante para melhor sono", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Meditação" },
    { id: "2", title: "Dormir melhor na gravidez", description: "Dicas para um sono reparador durante a gestação", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Dicas" },
    { id: "3", title: "Yoga prenatal - Relaxamento", description: "Relaxamento profundo para gestantes", youtubeId: "5GNrC3ML_VM", duration: "15:00", category: "Yoga" },
    { id: "4", title: "Preparar o sono do bebê", description: "Como organizar a rotina de sono do recém-nascido", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Preparação" },
  ],
  default: [
    { id: "1", title: "Pregnancy Relaxation Meditation", description: "Calming meditation for better sleep during pregnancy", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Meditation" },
    { id: "2", title: "Prenatal Sleep Meditation", description: "Cozy sleep meditation for expecting mothers", youtubeId: "FdeqyQTavzI", duration: "25:00", category: "Meditation" },
    { id: "3", title: "Prenatal Yoga for Relaxation", description: "Deep relaxation yoga nidra for pregnancy", youtubeId: "vEcZD8Js2Ws", duration: "25:00", category: "Sleep Tips" },
    { id: "4", title: "Newborn Sleep Preparation", description: "Prepare for baby's sleep schedule", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Preparation" },
  ],
};

// ════════════════════════════════════════════════════════════
// BIRTH POSITIONS
// ════════════════════════════════════════════════════════════
export const birthPositionVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "أوضاع الولادة الطبيعية", description: "رسوم متحركة ثلاثية الأبعاد لمراحل الولادة", youtubeId: "r4R8j8kiCHw", duration: "8:00", category: "ولادة" },
    { id: "2", title: "تحضير الجسم للولادة", description: "تمارين تحضيرية للولادة الطبيعية", youtubeId: "Vy6jonW1lFg", duration: "12:00", category: "تحضير" },
    { id: "3", title: "تمارين تسهيل الولادة", description: "تمارين رياضية تساعد على الولادة الطبيعية", youtubeId: "Ajx6Sum6uPU", duration: "15:00", category: "تمارين" },
    { id: "4", title: "تمارين إطالة للحامل", description: "تمارين إطالة آمنة للورك والظهر أثناء الحمل", youtubeId: "uWRwBBMFXys", duration: "12:00", category: "تمارين" },
  ],
  tr: [
    { id: "1", title: "Doğumda En İyi Pozisyonlar", description: "3D animasyonla doğum pozisyonları", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Doğum" },
    { id: "2", title: "Doğuma Hazırlık Egzersizleri", description: "Doğumu kolaylaştıran egzersizler", youtubeId: "0_z0oqZyHq8", duration: "15:00", category: "Hazırlık" },
    { id: "3", title: "Normal Doğum İçin İpuçları", description: "Ağrısız doğum için önemli bilgiler", youtubeId: "RTFFwC6nvpo", duration: "12:00", category: "İpuçları" },
    { id: "4", title: "Pelvik Taban Egzersizleri", description: "Doğum öncesi pelvik egzersizler", youtubeId: "ohLIZdyOKFs", duration: "10:00", category: "Egzersiz" },
  ],
  de: [
    { id: "1", title: "Beste Geburtspositionen", description: "3D-Animation der Geburtspositionen", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Geburt" },
    { id: "2", title: "Geburtsvorbereitung Übungen", description: "Übungen zur Geburtsvorbereitung", youtubeId: "AzuIPejeHXA", duration: "10:00", category: "Vorbereitung" },
    { id: "3", title: "Tipps für natürliche Geburt", description: "Wichtige Tipps für eine leichtere Geburt", youtubeId: "M3dMkgv2JPw", duration: "15:00", category: "Tipps" },
    { id: "4", title: "Beckenboden Training", description: "Beckenbodenübungen vor der Geburt", youtubeId: "c1PoK233RNQ", duration: "12:00", category: "Übungen" },
  ],
  fr: [
    { id: "1", title: "Meilleures positions d'accouchement", description: "Animation 3D des positions d'accouchement", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Accouchement" },
    { id: "2", title: "Préparation à l'accouchement", description: "Exercices pour faciliter l'accouchement", youtubeId: "ZhtzgI1cmTA", duration: "15:00", category: "Préparation" },
    { id: "3", title: "Exercices du périnée", description: "Renforcement du plancher pelvien", youtubeId: "CWa-cAZuVyE", duration: "12:00", category: "Exercices" },
    { id: "4", title: "Accouchement naturel - Conseils", description: "Conseils pour un accouchement sans douleur", youtubeId: "qE99koyxv_w", duration: "14:00", category: "Conseils" },
  ],
  es: [
    { id: "1", title: "Mejores posiciones de parto", description: "Animación 3D de posiciones de parto", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Parto" },
    { id: "2", title: "Ejercicios de preparación al parto", description: "Ejercicios para facilitar el parto", youtubeId: "mLVZoZ9KDBM", duration: "15:00", category: "Preparación" },
    { id: "3", title: "Ejercicios de suelo pélvico", description: "Fortalecimiento del suelo pélvico", youtubeId: "eugdUjFGnyQ", duration: "12:00", category: "Ejercicios" },
    { id: "4", title: "Parto natural - Consejos", description: "Consejos importantes para un parto más fácil", youtubeId: "dtwlqVWThMY", duration: "14:00", category: "Consejos" },
  ],
  pt: [
    { id: "1", title: "Melhores posições de parto", description: "Animação 3D das posições de parto", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Parto" },
    { id: "2", title: "Exercícios para preparar o parto", description: "Exercícios para facilitar o trabalho de parto", youtubeId: "-6QpPBWsiAo", duration: "12:00", category: "Preparação" },
    { id: "3", title: "Exercícios de assoalho pélvico", description: "Fortalecimento do assoalho pélvico para gestantes", youtubeId: "InieW2MYgsA", duration: "10:00", category: "Exercícios" },
    { id: "4", title: "Dicas para parto normal", description: "Dicas importantes para um parto mais tranquilo", youtubeId: "2E52kABbQg0", duration: "15:00", category: "Dicas" },
  ],
  default: [
    { id: "1", title: "Childbirth Stations - 3D Animation", description: "3D medical animation showing baby's progress through birth canal", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Pushing" },
    { id: "2", title: "Labor and Delivery - 3D Animation", description: "Stage-by-stage 3D animated guide to childbirth", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Labor Positions" },
    { id: "3", title: "Patient Education: Labor & Birth", description: "Animated patient education about labor and vaginal birth", youtubeId: "ZDP_ewMDxCo", duration: "12:00", category: "Pushing" },
    { id: "4", title: "Mechanism of Labour - OSCE Guide", description: "Medical educational guide to fetal positions during labor", youtubeId: "ruIa1bC4tsw", duration: "14:00", category: "Labor Positions" },
  ],
};

// ════════════════════════════════════════════════════════════
// LACTATION PREP
// ════════════════════════════════════════════════════════════
export const lactationVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "الرضاعة الطبيعية للمبتدئات", description: "رسوم متحركة ثلاثية الأبعاد عن الرضاعة الطبيعية", youtubeId: "bYBil33k27I", duration: "20:00", category: "بداية" },
    { id: "2", title: "رعاية المولود الجديد", description: "كل ما تحتاجين معرفته عن رعاية المولود", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "رعاية المولود" },
    { id: "3", title: "تغذية المولود والرضاعة", description: "نصائح عملية للرضاعة والتغذية", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "رعاية المولود" },
    { id: "4", title: "دليل رعاية الطفل الرضيع", description: "التعامل مع الرضيع والتغذية والنوم", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "بداية" },
  ],
  tr: [
    { id: "1", title: "Emzirme Rehberi", description: "3D animasyonla emzirme teknikleri", youtubeId: "bYBil33k27I", duration: "20:00", category: "Başlangıç" },
    { id: "2", title: "Yenidoğan Bakımı", description: "İlk hafta bebek bakım rehberi", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Bebek Bakımı" },
    { id: "3", title: "Bebek Beslenmesi", description: "Emzirme ve beslenme programı", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Bebek Bakımı" },
    { id: "4", title: "Bebek Bakım Rehberi", description: "Besleme, uyku ve temel bakım bilgileri", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Başlangıç" },
  ],
  de: [
    { id: "1", title: "Stillen - 3D Animation", description: "3D-Animation zum Thema Stillen", youtubeId: "bYBil33k27I", duration: "20:00", category: "Anfang" },
    { id: "2", title: "Neugeborenen-Pflege", description: "Pflegeratgeber für die erste Woche", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Babypflege" },
    { id: "3", title: "Baby Ernährung", description: "Fütterungspläne und Stillhinweise", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Babypflege" },
    { id: "4", title: "Baby Pflege Grundlagen", description: "Handling, Füttern und Schlafen", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Anfang" },
  ],
  fr: [
    { id: "1", title: "Guide d'allaitement - Animation 3D", description: "Animation 3D sur l'allaitement maternel", youtubeId: "bYBil33k27I", duration: "20:00", category: "Début" },
    { id: "2", title: "Soins du nouveau-né", description: "Guide de soins pour la première semaine", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Soins bébé" },
    { id: "3", title: "Alimentation du bébé", description: "Programmes d'alimentation et conseils", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Soins bébé" },
    { id: "4", title: "Guide soins bébé", description: "Manipulation, alimentation et sommeil", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Début" },
  ],
  es: [
    { id: "1", title: "Guía de lactancia - Animación 3D", description: "Animación 3D sobre lactancia materna", youtubeId: "bYBil33k27I", duration: "20:00", category: "Inicio" },
    { id: "2", title: "Cuidados del recién nacido", description: "Guía de cuidados para la primera semana", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Cuidado bebé" },
    { id: "3", title: "Alimentación del bebé", description: "Programas de alimentación y lactancia", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Cuidado bebé" },
    { id: "4", title: "Guía de cuidado del bebé", description: "Manejo, alimentación y sueño del recién nacido", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Inicio" },
  ],
  pt: [
    { id: "1", title: "Guia de amamentação - Animação 3D", description: "Animação 3D sobre amamentação", youtubeId: "bYBil33k27I", duration: "20:00", category: "Início" },
    { id: "2", title: "Cuidados com o recém-nascido", description: "Guia de cuidados para a primeira semana", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Cuidados bebê" },
    { id: "3", title: "Alimentação do bebê", description: "Programas de alimentação e amamentação", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Cuidados bebê" },
    { id: "4", title: "Guia de cuidados do bebê", description: "Manuseio, alimentação e sono do recém-nascido", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Início" },
  ],
  default: [
    { id: "1", title: "Breastfeeding - 3D Animation", description: "3D animated guide to breastfeeding and lactation", youtubeId: "bYBil33k27I", duration: "20:00", category: "Getting Started" },
    { id: "2", title: "Newborn Care Week 1", description: "Pediatrician guide including feeding basics", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Newborn Care" },
    { id: "3", title: "Caring For Your Newborn", description: "Comprehensive guide including feeding schedules", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Newborn Care" },
    { id: "4", title: "Newborn Baby Care Guide", description: "Handling, feeding, and sleeping basics", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "Getting Started" },
  ],
};

// ════════════════════════════════════════════════════════════
// NAUSEA RELIEF
// ════════════════════════════════════════════════════════════
export const nauseaVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "علاج غثيان الحمل", description: "نصائح طبية لتخفيف الغثيان أثناء الحمل", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "نصائح" },
    { id: "2", title: "التعامل مع غثيان الصباح", description: "استراتيجيات عملية للتغلب على الغثيان", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "نصائح" },
    { id: "3", title: "أعراض الحمل الأولى", description: "نصائح طبية للتعامل مع أعراض الثلث الأول", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "الثلث الأول" },
    { id: "4", title: "مشروبات تخفف الغثيان", description: "مشروبات طبيعية لتهدئة المعدة أثناء الحمل", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "علاجات" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Bulantı Çözümleri", description: "Sabah bulantısını hafifletmek için uzman önerileri", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "İpuçları" },
    { id: "2", title: "Sabah Bulantısıyla Başa Çıkma", description: "Gebelik bulantısını yönetmek için pratik stratejiler", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "İpuçları" },
    { id: "3", title: "İlk Trimester Belirtileri", description: "Erken gebelik belirtilerini yönetme ipuçları", youtubeId: "0QlmFqU3d1E", duration: "12:00", category: "İlk Trimester" },
    { id: "4", title: "Bulantıyı Azaltan İçecekler", description: "Hamilelikte mideyi rahatlatacak doğal içecekler", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Çözümler" },
  ],
  de: [
    { id: "1", title: "Übelkeit in der Schwangerschaft", description: "Tipps gegen Schwangerschaftsübelkeit", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "Tipps" },
    { id: "2", title: "Morgenübelkeit bewältigen", description: "Praktische Strategien gegen Übelkeit", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "Tipps" },
    { id: "3", title: "Erstes Trimester Symptome", description: "Umgang mit frühen Schwangerschaftssymptomen", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "Erstes Trimester" },
    { id: "4", title: "Getränke gegen Übelkeit", description: "Natürliche Getränke zur Linderung", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Hausmittel" },
  ],
  fr: [
    { id: "1", title: "Nausées de grossesse - Solutions", description: "Conseils d'experts contre les nausées", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "Conseils" },
    { id: "2", title: "Gérer les nausées matinales", description: "Stratégies pratiques contre les nausées", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "Conseils" },
    { id: "3", title: "Symptômes du premier trimestre", description: "Gérer les symptômes de début de grossesse", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "Premier trimestre" },
    { id: "4", title: "Boissons anti-nausées", description: "Boissons naturelles pour calmer l'estomac", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Remèdes" },
  ],
  es: [
    { id: "1", title: "Náuseas del embarazo - Soluciones", description: "Consejos de expertos contra las náuseas", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "Consejos" },
    { id: "2", title: "Manejar las náuseas matutinas", description: "Estrategias prácticas contra las náuseas", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "Consejos" },
    { id: "3", title: "Síntomas del primer trimestre", description: "Cómo manejar los síntomas del embarazo temprano", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "Primer trimestre" },
    { id: "4", title: "Bebidas contra las náuseas", description: "Bebidas naturales para calmar el estómago", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Remedios" },
  ],
  pt: [
    { id: "1", title: "Enjoo na gravidez - Soluções", description: "Dicas de especialistas contra enjoos", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "Dicas" },
    { id: "2", title: "Lidar com enjoos matinais", description: "Estratégias práticas contra os enjoos", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "Dicas" },
    { id: "3", title: "Sintomas do primeiro trimestre", description: "Como lidar com os sintomas iniciais da gestação", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "Primeiro trimestre" },
    { id: "4", title: "Bebidas contra enjoos", description: "Bebidas naturais para acalmar o estômago", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Remédios" },
  ],
  default: [
    { id: "1", title: "Top Tips for Nausea in Pregnancy", description: "Expert advice from Dr. Lora Shahine on morning sickness", youtubeId: "qTEDyHPUeYQ", duration: "8:30", category: "Relief Tips" },
    { id: "2", title: "4 Tips to Cope with Morning Sickness", description: "Practical strategies to manage pregnancy nausea", youtubeId: "C5TTWuV2Ztw", duration: "5:15", category: "Relief Tips" },
    { id: "3", title: "Managing Nausea During Pregnancy", description: "Dr. Chloe Rozon discusses effective strategies", youtubeId: "Y3-oVdPmh7U", duration: "10:00", category: "Medical Advice" },
    { id: "4", title: "First Trimester Survival Tips", description: "OB/GYN tips for early pregnancy symptoms", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "First Trimester" },
  ],
};

// ════════════════════════════════════════════════════════════
// HOSPITAL BAG
// ════════════════════════════════════════════════════════════
export const hospitalBagVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "تحضير حقيبة المستشفى", description: "قائمة كاملة بمحتويات حقيبة الولادة", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "تحضير" },
    { id: "2", title: "أغراض أساسية للمستشفى", description: "كل ما تحتاجينه يوم الولادة", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "تحضير" },
    { id: "3", title: "نصائح تحضير حقيبة الولادة", description: "تجارب أمهات في تجهيز حقيبة المستشفى", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "نصائح" },
    { id: "4", title: "رعاية المولود - الأسبوع الأول", description: "دليل شامل لرعاية الطفل بعد الولادة", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "رعاية المولود" },
  ],
  tr: [
    { id: "1", title: "Hastane Çantası Hazırlığı", description: "Doğum çantasında bulunması gerekenler", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Hazırlık" },
    { id: "2", title: "Doğum Çantası Listesi", description: "Doğum günü için gerekli eşyalar", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Hazırlık" },
    { id: "3", title: "Hastane Çantası İpuçları", description: "Annelerin çanta hazırlama deneyimleri", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "İpuçları" },
    { id: "4", title: "Yenidoğan Bakımı - İlk Hafta", description: "Doğum sonrası bebek bakım rehberi", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Bebek Bakımı" },
  ],
  de: [
    { id: "1", title: "Kliniktasche packen", description: "Vollständige Packliste für die Geburt", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Vorbereitung" },
    { id: "2", title: "Was in die Kliniktasche gehört", description: "Wichtige Dinge für den Geburtstermin", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Vorbereitung" },
    { id: "3", title: "Kliniktasche Tipps", description: "Erfahrungen von Müttern beim Packen", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "Tipps" },
    { id: "4", title: "Neugeborenen-Pflege - Erste Woche", description: "Umfassender Pflegeplan nach der Geburt", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Babypflege" },
  ],
  fr: [
    { id: "1", title: "Préparer la valise de maternité", description: "Liste complète pour la valise d'accouchement", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Préparation" },
    { id: "2", title: "Essentiels valise de maternité", description: "Tout ce qu'il faut pour le jour J", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Préparation" },
    { id: "3", title: "Conseils valise de maternité", description: "Expériences de mamans pour la valise", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "Conseils" },
    { id: "4", title: "Soins nouveau-né - Première semaine", description: "Guide complet des soins après la naissance", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Soins bébé" },
  ],
  es: [
    { id: "1", title: "Preparar la bolsa del hospital", description: "Lista completa de la bolsa de maternidad", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Preparación" },
    { id: "2", title: "Esenciales para el hospital", description: "Todo lo necesario para el día del parto", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Preparación" },
    { id: "3", title: "Consejos para la bolsa del hospital", description: "Experiencias de mamás preparando la bolsa", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "Consejos" },
    { id: "4", title: "Cuidados del recién nacido - Semana 1", description: "Guía completa de cuidados tras el parto", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Cuidado bebé" },
  ],
  pt: [
    { id: "1", title: "Preparar a mala da maternidade", description: "Lista completa para a mala do hospital", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Preparação" },
    { id: "2", title: "Itens essenciais para o hospital", description: "Tudo que precisa para o dia do parto", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Preparação" },
    { id: "3", title: "Dicas para a mala da maternidade", description: "Experiências de mães preparando a mala", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "Dicas" },
    { id: "4", title: "Cuidados com recém-nascido - Semana 1", description: "Guia completo de cuidados pós-parto", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Cuidados bebê" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.hospitalBag.videos.v1.title'), description: t('toolsInternal.hospitalBag.videos.v1.description'), youtubeId: "NTulfAOzbp8", duration: "8:00", category: t('toolsInternal.hospitalBag.videos.v1.category') },
    { id: "2", title: t('toolsInternal.hospitalBag.videos.v2.title'), description: t('toolsInternal.hospitalBag.videos.v2.description'), youtubeId: "oUxVPhwFuMM", duration: "12:30", category: t('toolsInternal.hospitalBag.videos.v2.category') },
    { id: "3", title: t('toolsInternal.hospitalBag.videos.v3.title'), description: t('toolsInternal.hospitalBag.videos.v3.description'), youtubeId: "6YdwII4BO0g", duration: "10:00", category: t('toolsInternal.hospitalBag.videos.v3.category') },
    { id: "4", title: t('toolsInternal.hospitalBag.videos.v4.title'), description: t('toolsInternal.hospitalBag.videos.v4.description'), youtubeId: "hpgjwK_oQe0", duration: "18:00", category: t('toolsInternal.hospitalBag.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// SKINCARE
// ════════════════════════════════════════════════════════════
export const skincareVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "العناية بالبشرة أثناء الحمل", description: "روتين بشرة آمن للحامل", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "عناية بالبشرة" },
    { id: "2", title: "منتجات آمنة للحامل", description: "ما يمكن استخدامه وما يجب تجنبه", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "عناية بالبشرة" },
    { id: "3", title: "تغذية البشرة من الداخل", description: "أطعمة مفيدة لبشرة الحامل", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "تغذية" },
    { id: "4", title: "الوقاية من علامات التمدد", description: "نصائح للحفاظ على بشرة صحية", youtubeId: "pozcaggYIWk", duration: "8:42", category: "وقاية" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Cilt Bakımı", description: "Güvenli cilt bakım rutini hamileler için", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "Cilt Bakımı" },
    { id: "2", title: "Hamilelikte Güvenli Ürünler", description: "Hangi ürünler kullanılmalı, hangilerinden kaçınılmalı", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "Cilt Bakımı" },
    { id: "3", title: "İçten Cilt Besleme", description: "Hamilelikte cildi besleyen gıdalar", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Beslenme" },
    { id: "4", title: "Çatlak Önleme İpuçları", description: "Sağlıklı cilt için koruyucu bakım", youtubeId: "pozcaggYIWk", duration: "8:42", category: "Önleme" },
  ],
  de: [
    { id: "1", title: "Hautpflege in der Schwangerschaft", description: "Sichere Hautpflegeroutine für Schwangere", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "Hautpflege" },
    { id: "2", title: "Sichere Produkte für Schwangere", description: "Welche Produkte sind sicher und welche nicht", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "Hautpflege" },
    { id: "3", title: "Hautnahrung von innen", description: "Lebensmittel für schöne Haut in der Schwangerschaft", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Ernährung" },
    { id: "4", title: "Dehnungsstreifen vorbeugen", description: "Tipps für eine gesunde Haut", youtubeId: "pozcaggYIWk", duration: "8:42", category: "Vorbeugung" },
  ],
  fr: [
    { id: "1", title: "Soins de la peau enceinte", description: "Routine de soins sûre pour la grossesse", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "Soins peau" },
    { id: "2", title: "Produits sûrs pour la grossesse", description: "Quels produits utiliser et éviter", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "Soins peau" },
    { id: "3", title: "Nourrir la peau de l'intérieur", description: "Aliments pour une belle peau enceinte", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Nutrition" },
    { id: "4", title: "Prévenir les vergetures", description: "Conseils pour une peau saine", youtubeId: "pozcaggYIWk", duration: "8:42", category: "Prévention" },
  ],
  es: [
    { id: "1", title: "Cuidado de la piel en el embarazo", description: "Rutina de cuidado seguro para embarazadas", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "Cuidado piel" },
    { id: "2", title: "Productos seguros para embarazadas", description: "Qué productos usar y cuáles evitar", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "Cuidado piel" },
    { id: "3", title: "Nutrir la piel desde dentro", description: "Alimentos para una piel sana en el embarazo", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Nutrición" },
    { id: "4", title: "Prevenir estrías", description: "Consejos para mantener la piel saludable", youtubeId: "pozcaggYIWk", duration: "8:42", category: "Prevención" },
  ],
  pt: [
    { id: "1", title: "Cuidados com a pele na gravidez", description: "Rotina de cuidados segura para gestantes", youtubeId: "CK9K2TmLG3c", duration: "15:30", category: "Cuidados pele" },
    { id: "2", title: "Produtos seguros para gestantes", description: "Quais produtos usar e quais evitar", youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: "Cuidados pele" },
    { id: "3", title: "Nutrir a pele por dentro", description: "Alimentos para uma pele saudável na gestação", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Nutrição" },
    { id: "4", title: "Prevenir estrias", description: "Dicas para manter a pele saudável", youtubeId: "pozcaggYIWk", duration: "8:42", category: "Prevenção" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.skincare.videos.v1.title'), description: t('toolsInternal.skincare.videos.v1.description'), youtubeId: "CK9K2TmLG3c", duration: "15:30", category: t('toolsInternal.skincare.videos.v1.category') },
    { id: "2", title: t('toolsInternal.skincare.videos.v2.title'), description: t('toolsInternal.skincare.videos.v2.description'), youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: t('toolsInternal.skincare.videos.v2.category') },
    { id: "3", title: t('toolsInternal.skincare.videos.v3.title'), description: t('toolsInternal.skincare.videos.v3.description'), youtubeId: "2kNGY3gyrEc", duration: "11:30", category: t('toolsInternal.skincare.videos.v3.category') },
    { id: "4", title: t('toolsInternal.skincare.videos.v4.title'), description: t('toolsInternal.skincare.videos.v4.description'), youtubeId: "pozcaggYIWk", duration: "8:42", category: t('toolsInternal.skincare.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// PARTNER GUIDE
// ════════════════════════════════════════════════════════════
export const partnerVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "دور الأب أثناء الحمل", description: "كيف يدعم الزوج زوجته الحامل", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "دعم" },
    { id: "2", title: "رعاية المولود للآباء", description: "دليل الأب الجديد لرعاية المولود", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "رعاية المولود" },
    { id: "3", title: "التحضير للولادة معاً", description: "رسوم متحركة ثلاثية الأبعاد لمراحل الولادة", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "تحضير" },
    { id: "4", title: "نصائح للأزواج الجدد", description: "إرشادات مهمة للآباء لأول مرة", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "نصائح" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Baba Rolü", description: "Eşinizi hamilelikte nasıl desteklersiniz", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Destek" },
    { id: "2", title: "Yeni Babalar İçin Bebek Bakımı", description: "Yeni baba rehberi - bebek bakım temelleri", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Bebek Bakımı" },
    { id: "3", title: "Birlikte Doğuma Hazırlık", description: "3D animasyonla doğum sürecini anlama", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Hazırlık" },
    { id: "4", title: "Yeni Ebeveynler İçin İpuçları", description: "İlk kez baba olacaklar için önemli bilgiler", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "İpuçları" },
  ],
  de: [
    { id: "1", title: "Vaterrolle in der Schwangerschaft", description: "Wie Sie Ihre Partnerin unterstützen können", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Unterstützung" },
    { id: "2", title: "Babypflege für neue Väter", description: "Ratgeber für werdende Väter", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Babypflege" },
    { id: "3", title: "Gemeinsam Geburtsvorbereitung", description: "3D-Animation des Geburtsvorgangs verstehen", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Vorbereitung" },
    { id: "4", title: "Tipps für neue Eltern", description: "Wichtige Hinweise für Erstväter", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Tipps" },
  ],
  fr: [
    { id: "1", title: "Rôle du père pendant la grossesse", description: "Comment soutenir votre partenaire enceinte", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Soutien" },
    { id: "2", title: "Soins bébé pour nouveaux papas", description: "Guide du nouveau père pour les soins bébé", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Soins bébé" },
    { id: "3", title: "Préparer l'accouchement ensemble", description: "Animation 3D pour comprendre l'accouchement", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Préparation" },
    { id: "4", title: "Conseils pour nouveaux parents", description: "Informations essentielles pour futurs papas", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Conseils" },
  ],
  es: [
    { id: "1", title: "El rol del padre en el embarazo", description: "Cómo apoyar a tu pareja embarazada", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Apoyo" },
    { id: "2", title: "Cuidado del bebé para nuevos papás", description: "Guía del nuevo padre para cuidar al bebé", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Cuidado bebé" },
    { id: "3", title: "Prepararse juntos para el parto", description: "Animación 3D para entender el parto", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Preparación" },
    { id: "4", title: "Consejos para nuevos padres", description: "Información esencial para papás primerizos", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Consejos" },
  ],
  pt: [
    { id: "1", title: "O papel do pai na gravidez", description: "Como apoiar sua parceira grávida", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Apoio" },
    { id: "2", title: "Cuidados do bebê para novos pais", description: "Guia do novo pai para cuidar do bebê", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "Cuidados bebê" },
    { id: "3", title: "Preparar-se juntos para o parto", description: "Animação 3D para entender o parto", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Preparação" },
    { id: "4", title: "Dicas para novos pais", description: "Informações essenciais para pais de primeira viagem", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Dicas" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.partnerGuide.videos.v1.title'), description: t('toolsInternal.partnerGuide.videos.v1.description'), youtubeId: "hpgjwK_oQe0", duration: "18:00", category: t('toolsInternal.partnerGuide.videos.v1.category') },
    { id: "2", title: t('toolsInternal.partnerGuide.videos.v2.title'), description: t('toolsInternal.partnerGuide.videos.v2.description'), youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v2.category') },
    { id: "3", title: t('toolsInternal.partnerGuide.videos.v3.title'), description: t('toolsInternal.partnerGuide.videos.v3.description'), youtubeId: "Szm-TxgXhGU", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v3.category') },
    { id: "4", title: t('toolsInternal.partnerGuide.videos.v4.title'), description: t('toolsInternal.partnerGuide.videos.v4.description'), youtubeId: "NTulfAOzbp8", duration: "8:00", category: t('toolsInternal.partnerGuide.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// MENTAL HEALTH
// ════════════════════════════════════════════════════════════
export const mentalHealthVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "اكتئاب ما بعد الولادة - الأعراض والعلاج", description: "شرح طبي شامل لأعراض وأسباب وعلاج اكتئاب ما بعد الولادة", youtubeId: "ZUX5EvY-Z0k", duration: "12:00", category: "صحة نفسية" },
    { id: "2", title: "الحالة النفسية للأم الحامل وتأثيرها على الجنين", description: "أخصائية نسائية تشرح تأثير نفسية الأم على صحة الجنين", youtubeId: "ok45m94bdTw", duration: "10:00", category: "حمل ونفسية" },
    { id: "3", title: "اكتئاب ما بعد الولادة بالعربية", description: "فيديو توعوي عن اكتئاب ما بعد الولادة باللغة العربية", youtubeId: "vhPzHtUOjnc", duration: "8:00", category: "توعية" },
    { id: "4", title: "تأثير الحزن والفزع على صحة الجنين", description: "ما يفعله التوتر والقلق في صحة الجنين أثناء الحمل", youtubeId: "xGv9uYPEPkU", duration: "9:00", category: "قلق وتوتر" },
    { id: "5", title: "مخاطر تأخر علاج اكتئاب ما بعد الولادة", description: "استشاري يوضح المخاطر وأهمية العلاج المبكر", youtubeId: "Iw2adJ7dHiY", duration: "11:00", category: "علاج" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Stres ve Duygu Değişimleri", description: "Uzman doktor hamilelikte stres ve duygu değişimlerini açıklıyor", youtubeId: "RfLKz-cz2uk", duration: "12:00", category: "Ruh Sağlığı" },
    { id: "2", title: "Doğum Sonrası Depresyon Belirtileri", description: "Doğum sonrası depresyonun belirtileri ve tedavi yöntemleri", youtubeId: "AEHdQM5diYo", duration: "10:00", category: "Depresyon" },
    { id: "3", title: "Gebelik ve Emzirme Döneminde Antidepresan", description: "Gebelik döneminde ilaç kullanımı hakkında uzman görüşü", youtubeId: "akI4jUXTO1o", duration: "8:00", category: "Tedavi" },
    { id: "4", title: "Depresyonla Başa Çıkmak İçin Tavsiyeler", description: "Uzman psikolog depresyonla başa çıkma yollarını anlatıyor", youtubeId: "w-wew_NW528", duration: "14:00", category: "Başa Çıkma" },
  ],
  de: [
    { id: "1", title: "Postpartale Depression verstehen", description: "Wochenbettdepression: Symptome, Ursachen und Hilfe", youtubeId: "-3IdjeGg2LM", duration: "12:00", category: "Psychische Gesundheit" },
    { id: "2", title: "Wochenbettdepression - Erfahrungen und Hilfe", description: "Betroffene und Experten berichten über Wochenbettdepression", youtubeId: "y_Th0bRevP8", duration: "10:00", category: "Erfahrungen" },
    { id: "3", title: "Postnatale Depression erkennen", description: "Wie man postnatale Depression frühzeitig erkennt", youtubeId: "XlmJEZLV97Q", duration: "9:00", category: "Erkennung" },
    { id: "4", title: "Depressionen verstehen und überwinden", description: "Alles über Depression: Prävention und Behandlung", youtubeId: "Y6dGQ86EPgI", duration: "15:00", category: "Behandlung" },
  ],
  fr: [
    { id: "1", title: "La dépression post-partum expliquée", description: "Comprendre les symptômes et le traitement de la dépression post-partum", youtubeId: "lkF-lsITkNY", duration: "12:00", category: "Santé mentale" },
    { id: "2", title: "Baby blues et dépression post-partum", description: "Différences entre baby blues et dépression post-partum", youtubeId: "KRQw_wDuYBo", duration: "10:00", category: "Éducation" },
    { id: "3", title: "Dépression post-partum - Tout comprendre", description: "Explication complète de la dépression post-partum par des professionnels", youtubeId: "lkF-lsITkNY", duration: "15:00", category: "Compréhension" },
    { id: "4", title: "Dépression post-partum - Témoignage et aide", description: "Témoignages et ressources pour les mamans en difficulté", youtubeId: "Th-Gk4pQ30M", duration: "8:00", category: "Témoignage" },
  ],
  es: [
    { id: "1", title: "Depresión posparto: causas, síntomas y tratamiento", description: "Explicación completa sobre la depresión posparto", youtubeId: "KLH0R1faCvo", duration: "12:00", category: "Salud mental" },
    { id: "2", title: "Síntomas de la depresión posparto", description: "Reconoce los síntomas de la depresión después del parto", youtubeId: "ungZcwOyufA", duration: "10:00", category: "Síntomas" },
    { id: "3", title: "Depresión postparto - Guía completa", description: "Todo lo que necesitas saber sobre la depresión postparto", youtubeId: "YCZyKqMSPPQ", duration: "14:00", category: "Guía" },
    { id: "4", title: "Ansiedad y depresión en el embarazo", description: "Cómo manejar la ansiedad durante el embarazo y posparto", youtubeId: "wSvvDolSYSs", duration: "9:00", category: "Ansiedad" },
  ],
  pt: [
    { id: "1", title: "Depressão pós-parto: sintomas e tratamento", description: "Explicação completa sobre a depressão pós-parto", youtubeId: "tJYCadQPvpQ", duration: "12:00", category: "Saúde mental" },
    { id: "2", title: "Escala de Depressão Pós-Parto de Edimburgo", description: "Como usar a EPDS para identificar a depressão pós-parto", youtubeId: "vRbRIfuaPhc", duration: "15:00", category: "Avaliação" },
    { id: "3", title: "Depressão pós-parto - Sintomas e cuidados", description: "Orientações profissionais sobre depressão pós-parto", youtubeId: "phww36QwAxk", duration: "10:00", category: "Cuidados" },
    { id: "4", title: "Depressão: como prevenir e tratar", description: "Estratégias de prevenção e tratamento da depressão", youtubeId: "6G-rIvtF9bg", duration: "14:00", category: "Prevenção" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.mentalHealthCoach.videos.v1.title'), description: t('toolsInternal.mentalHealthCoach.videos.v1.description'), youtubeId: "PTRyrBH38XU", duration: "10:00", category: t('toolsInternal.mentalHealthCoach.videos.v1.category') },
    { id: "2", title: t('toolsInternal.mentalHealthCoach.videos.v2.title'), description: t('toolsInternal.mentalHealthCoach.videos.v2.description'), youtubeId: "1k4ftBpo8OQ", duration: "12:00", category: t('toolsInternal.mentalHealthCoach.videos.v2.category') },
    { id: "3", title: t('toolsInternal.mentalHealthCoach.videos.v3.title'), description: t('toolsInternal.mentalHealthCoach.videos.v3.description'), youtubeId: "lraaZa-K-FM", duration: "15:00", category: t('toolsInternal.mentalHealthCoach.videos.v3.category') },
    { id: "4", title: t('toolsInternal.mentalHealthCoach.videos.v4.title'), description: t('toolsInternal.mentalHealthCoach.videos.v4.description'), youtubeId: "0WCwC-3nTdg", duration: "8:00", category: t('toolsInternal.mentalHealthCoach.videos.v4.category') },
    { id: "5", title: t('toolsInternal.mentalHealthCoach.videos.v5.title'), description: t('toolsInternal.mentalHealthCoach.videos.v5.description'), youtubeId: "DeZ5CuWfW3k", duration: "11:00", category: t('toolsInternal.mentalHealthCoach.videos.v5.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// VIDEO LIBRARY PAGE (General)
// ════════════════════════════════════════════════════════════
export const generalVideosByLang: VideosByLang = {
  ar: [
    { id: "1", youtubeId: "fYsBctNUamo", title: "تغذية الحامل في الثلث الثاني", description: "أهم المأكولات لتغذية الحامل", category: "تغذية", duration: "10:00" },
    { id: "2", youtubeId: "1xVgisdrTUY", title: "الأكل الممنوع للحامل", description: "الأطعمة التي يجب تجنبها", category: "تغذية", duration: "10:00" },
    { id: "3", youtubeId: "UqYAbM8Drl4", title: "نظام غذائي لسكري الحمل", description: "نصائح من أخصائية تغذية", category: "تغذية", duration: "15:00" },
    { id: "4", youtubeId: "pCSjhbVOdYQ", title: "تأمل استرخاء الحمل", description: "تأمل مهدئ للأمهات الحوامل", category: "صحة نفسية", duration: "60:00" },
    { id: "5", youtubeId: "uWRwBBMFXys", title: "تمارين إطالة للحامل", description: "تمارين إطالة آمنة للورك والظهر", category: "تمارين", duration: "12:00" },
    { id: "6", youtubeId: "qa7RY4V6ihM", title: "تمرين كامل للحامل", description: "تمرين لطيف لكامل الجسم", category: "تمارين", duration: "10:00" },
    { id: "7", youtubeId: "Vy6jonW1lFg", title: "تمارين تقوية للحامل", description: "تمارين تقوية آمنة أثناء الحمل", category: "تمارين", duration: "12:00" },
    { id: "8", youtubeId: "r4R8j8kiCHw", title: "تحضير للولادة", description: "رسوم متحركة ثلاثية الأبعاد للولادة الطبيعية", category: "ولادة", duration: "8:00" },
    { id: "9", youtubeId: "NTulfAOzbp8", title: "حقيبة المستشفى", description: "قائمة تجهيز حقيبة الولادة", category: "تحضير", duration: "8:00" },
    { id: "10", youtubeId: "hpgjwK_oQe0", title: "رعاية المولود - الأسبوع الأول", description: "دليل الأسبوع الأول مع المولود", category: "رعاية المولود", duration: "18:00" },
    { id: "11", youtubeId: "bYBil33k27I", title: "الرضاعة الطبيعية", description: "رسوم متحركة ثلاثية الأبعاد عن الرضاعة", category: "رعاية المولود", duration: "20:00" },
    { id: "12", youtubeId: "CK9K2TmLG3c", title: "العناية بالبشرة للحامل", description: "روتين بشرة آمن أثناء الحمل", category: "عناية بالبشرة", duration: "15:30" },
  ],
  tr: [
    { id: "1", youtubeId: "0_z0oqZyHq8", title: "Gebelikte Beslenme Rehberi", description: "Hamilelikte doğru beslenme", category: "Beslenme", duration: "15:00" },
    { id: "2", youtubeId: "MxFf7P-DK6c", title: "Hamilelik Planlaması", description: "Gebelik öncesi bilinmesi gerekenler", category: "Beslenme", duration: "12:00" },
    { id: "3", youtubeId: "pCSjhbVOdYQ", title: "Hamilelik Meditasyonu", description: "Rahatlatıcı meditasyon hamileler için", category: "Ruh Sağlığı", duration: "60:00" },
    { id: "4", youtubeId: "ohLIZdyOKFs", title: "Rahat Bir Gebelik İçin", description: "Rahat bir hamilelik için ipuçları", category: "Ruh Sağlığı", duration: "12:00" },
    { id: "5", youtubeId: "RTFFwC6nvpo", title: "Hamilelikte Son Ay", description: "Son trimester bilgileri ve hazırlık", category: "Doğum", duration: "15:00" },
    { id: "6", youtubeId: "0QlmFqU3d1E", title: "Erken Hamilelik Belirtileri", description: "İlk trimester belirtileri ve yönetimi", category: "İlk Trimester", duration: "10:00" },
    { id: "7", youtubeId: "hpgjwK_oQe0", title: "Yenidoğan Bakım Rehberi", description: "İlk hafta bebek bakımı", category: "Bebek Bakımı", duration: "18:00" },
    { id: "8", youtubeId: "bYBil33k27I", title: "Emzirme Rehberi", description: "3D animasyonla emzirme", category: "Bebek Bakımı", duration: "20:00" },
    { id: "9", youtubeId: "CK9K2TmLG3c", title: "Hamilelikte Cilt Bakımı", description: "Güvenli cilt bakım rutini", category: "Cilt Bakımı", duration: "15:30" },
  ],
  de: [
    { id: "1", youtubeId: "4JfuBEJLbDc", title: "Ernährung in der Schwangerschaft", description: "Gesunde Ernährungstipps für Schwangere", category: "Ernährung", duration: "12:00" },
    { id: "2", youtubeId: "M3dMkgv2JPw", title: "Schwangerschaft - Beste Tipps", description: "Tipps für Schwangerschaft, Geburt und Mamasein", category: "Ernährung", duration: "15:00" },
    { id: "3", youtubeId: "pCSjhbVOdYQ", title: "Schwangerschaftsmeditation", description: "Beruhigende Meditation für Schwangere", category: "Psychische Gesundheit", duration: "60:00" },
    { id: "4", youtubeId: "AzuIPejeHXA", title: "Schwangerschafts-Stretching", description: "10 Min Dehnübungen für alle Trimester", category: "Übungen", duration: "10:00" },
    { id: "5", youtubeId: "c1PoK233RNQ", title: "Beckenbodentraining", description: "Beckenbodenübungen für Schwangere", category: "Übungen", duration: "12:00" },
    { id: "6", youtubeId: "hpgjwK_oQe0", title: "Neugeborenen-Pflege", description: "Erste Woche mit dem Baby", category: "Babypflege", duration: "18:00" },
    { id: "7", youtubeId: "bYBil33k27I", title: "Stillen - 3D Animation", description: "3D-Animation zum Thema Stillen", category: "Babypflege", duration: "20:00" },
    { id: "8", youtubeId: "CK9K2TmLG3c", title: "Hautpflege in der Schwangerschaft", description: "Sichere Hautpflege für Schwangere", category: "Hautpflege", duration: "15:30" },
  ],
  fr: [
    { id: "1", youtubeId: "EswSlduwhDg", title: "Alimentation pendant la grossesse", description: "Guide nutritionnel pour femmes enceintes", category: "Nutrition", duration: "14:00" },
    { id: "2", youtubeId: "by5cM4dXfbs", title: "Aliments à éviter enceinte", description: "Ce qu'il ne faut pas manger pendant la grossesse", category: "Nutrition", duration: "10:00" },
    { id: "3", youtubeId: "pCSjhbVOdYQ", title: "Méditation de grossesse", description: "Méditation apaisante pour futures mamans", category: "Santé mentale", duration: "60:00" },
    { id: "4", youtubeId: "ZhtzgI1cmTA", title: "Pilates prénatal", description: "Renforcement du transverse - 1er trimestre", category: "Exercices", duration: "15:00" },
    { id: "5", youtubeId: "CWa-cAZuVyE", title: "Cuisses et fessiers grossesse", description: "Renforcement bas du corps pour enceintes", category: "Exercices", duration: "20:00" },
    { id: "6", youtubeId: "hpgjwK_oQe0", title: "Soins du nouveau-né", description: "Première semaine avec bébé", category: "Soins bébé", duration: "18:00" },
    { id: "7", youtubeId: "bYBil33k27I", title: "Guide d'allaitement 3D", description: "Animation 3D sur l'allaitement", category: "Soins bébé", duration: "20:00" },
    { id: "8", youtubeId: "CK9K2TmLG3c", title: "Soins de la peau enceinte", description: "Routine de soins sûre pour la grossesse", category: "Soins peau", duration: "15:30" },
  ],
  es: [
    { id: "1", youtubeId: "yvsnl79qH28", title: "Alimentación en el embarazo", description: "Guía nutricional para embarazadas", category: "Nutrición", duration: "14:00" },
    { id: "2", youtubeId: "spRcfWdfqMY", title: "Alimentos prohibidos y permitidos", description: "Qué comer y evitar en el embarazo", category: "Nutrición", duration: "12:00" },
    { id: "3", youtubeId: "pCSjhbVOdYQ", title: "Meditación para embarazadas", description: "Meditación relajante para futuras mamás", category: "Salud mental", duration: "60:00" },
    { id: "4", youtubeId: "gVwBXO3kqUc", title: "Ejercicios para embarazadas", description: "Rutina completa y segura para el embarazo", category: "Ejercicios", duration: "20:00" },
    { id: "5", youtubeId: "eugdUjFGnyQ", title: "Ejercicios primer trimestre", description: "Ejercicio seguro en el primer trimestre", category: "Ejercicios", duration: "15:00" },
    { id: "6", youtubeId: "mLVZoZ9KDBM", title: "Ejercicios tercer trimestre", description: "Ejercicio seguro en el tercer trimestre", category: "Ejercicios", duration: "15:00" },
    { id: "7", youtubeId: "hpgjwK_oQe0", title: "Cuidados del recién nacido", description: "Primera semana con el bebé", category: "Cuidado bebé", duration: "18:00" },
    { id: "8", youtubeId: "bYBil33k27I", title: "Guía de lactancia 3D", description: "Animación 3D sobre lactancia", category: "Cuidado bebé", duration: "20:00" },
    { id: "9", youtubeId: "CK9K2TmLG3c", title: "Cuidado de la piel en embarazo", description: "Rutina de cuidado seguro", category: "Cuidado piel", duration: "15:30" },
  ],
  pt: [
    { id: "1", youtubeId: "83irOqL0DUc", title: "Alimentação na gravidez", description: "Guia nutricional para gestantes", category: "Nutrição", duration: "14:00" },
    { id: "2", youtubeId: "qFpOwKdJTwo", title: "Mitos na gravidez", description: "Verdades e mentiras sobre alimentação", category: "Nutrição", duration: "12:00" },
    { id: "3", youtubeId: "pCSjhbVOdYQ", title: "Meditação para gestantes", description: "Meditação relaxante para futuras mães", category: "Saúde mental", duration: "60:00" },
    { id: "4", youtubeId: "-6QpPBWsiAo", title: "Exercícios para o parto", description: "Preparação do corpo para o parto normal", category: "Exercícios", duration: "12:00" },
    { id: "5", youtubeId: "2E52kABbQg0", title: "Alongamentos para gestantes", description: "Mobilidade e flexibilidade na gestação", category: "Exercícios", duration: "15:00" },
    { id: "6", youtubeId: "InieW2MYgsA", title: "Exercícios do assoalho pélvico", description: "Fortalecimento do assoalho pélvico", category: "Exercícios", duration: "10:00" },
    { id: "7", youtubeId: "hpgjwK_oQe0", title: "Cuidados com recém-nascido", description: "Primeira semana com o bebê", category: "Cuidados bebê", duration: "18:00" },
    { id: "8", youtubeId: "bYBil33k27I", title: "Guia de amamentação 3D", description: "Animação 3D sobre amamentação", category: "Cuidados bebê", duration: "20:00" },
    { id: "9", youtubeId: "CK9K2TmLG3c", title: "Cuidados com a pele na gravidez", description: "Rotina segura de cuidados", category: "Cuidados pele", duration: "15:30" },
  ],
  default: [
    { id: "1", youtubeId: "2kNGY3gyrEc", title: "10 Foods I Eat Every Day Pregnant", description: "Daily pregnancy superfoods for you and baby", category: "Nutrition", duration: "11:30" },
    { id: "2", youtubeId: "pozcaggYIWk", title: "Pregnancy Diet Guide", description: "What to eat and what to avoid while pregnant", category: "Nutrition", duration: "8:42" },
    { id: "3", youtubeId: "YwuUDE-QSOg", title: "Pregnancy Preparation Tips", description: "5 things to do to prepare for pregnancy from a dietitian", category: "Nutrition", duration: "12:00" },
    { id: "4", youtubeId: "qTEDyHPUeYQ", title: "Top Tips for Nausea in Pregnancy", description: "Expert advice from Dr. Lora Shahine", category: "First Trimester", duration: "8:30" },
    { id: "5", youtubeId: "Y3-oVdPmh7U", title: "Managing Nausea During Pregnancy", description: "Effective strategies for morning sickness", category: "First Trimester", duration: "10:00" },
    { id: "6", youtubeId: "KPA3DRZeH4A", title: "First Trimester Survival Tips", description: "OB/GYN tips for early pregnancy", category: "First Trimester", duration: "12:00" },
    { id: "7", youtubeId: "pCSjhbVOdYQ", title: "Pregnancy Relaxation Meditation", description: "1 hour calming meditation for better sleep", category: "Mental Health", duration: "60:00" },
    { id: "8", youtubeId: "FdeqyQTavzI", title: "Prenatal Sleep Meditation", description: "Cozy sleep meditation for expecting mothers", category: "Mental Health", duration: "25:00" },
    { id: "9", youtubeId: "vEcZD8Js2Ws", title: "Prenatal Yoga Nidra", description: "Deep relaxation meditation for pregnancy", category: "Mental Health", duration: "25:00" },
    { id: "10", youtubeId: "6kV2_L3uSS0", title: "What is Postpartum Depression?", description: "Mental health professionals explain PPD", category: "Mental Health", duration: "8:30" },
    { id: "11", youtubeId: "Aj1Vk3q-4tg", title: "Postpartum Depression Explained", description: "Symptoms, risk factors, and treatment", category: "Mental Health", duration: "10:15" },
    { id: "12", youtubeId: "ze53Ep-gwBQ", title: "Childbirth Stations - 3D Animation", description: "3D medical animation of baby's progress through birth canal", category: "Labor & Birth", duration: "10:00" },
    { id: "13", youtubeId: "Szm-TxgXhGU", title: "Labor & Delivery - 3D Animation", description: "Stage-by-stage 3D animated childbirth guide", category: "Labor & Birth", duration: "15:00" },
    { id: "14", youtubeId: "ZDP_ewMDxCo", title: "Patient Education: Labor & Birth", description: "Animated patient education about labor", category: "Labor & Birth", duration: "12:00" },
    { id: "15", youtubeId: "NTulfAOzbp8", title: "Hospital Bag Checklist", description: "Midwife advice on what to pack", category: "Preparation", duration: "8:00" },
    { id: "16", youtubeId: "oUxVPhwFuMM", title: "Essential Hospital Bag Items", description: "Must-have items for labor and delivery", category: "Preparation", duration: "12:30" },
    { id: "17", youtubeId: "hpgjwK_oQe0", title: "Newborn Care Week 1", description: "Pediatrician guide to first week", category: "Newborn Care", duration: "18:00" },
    { id: "18", youtubeId: "-CWJYxIvoFQ", title: "Caring For Your Newborn", description: "Comprehensive newborn care guide", category: "Newborn Care", duration: "15:00" },
    { id: "19", youtubeId: "CXWzqbe1i9c", title: "Newborn Baby Care Guide", description: "Handling, feeding, and sleeping basics", category: "Newborn Care", duration: "6:00" },
    { id: "20", youtubeId: "bYBil33k27I", title: "Breastfeeding - 3D Animation", description: "3D animated guide to breastfeeding", category: "Newborn Care", duration: "20:00" },
    { id: "21", youtubeId: "CK9K2TmLG3c", title: "Pregnancy Safe Skincare Routine", description: "Dermatologist's safe skincare guide", category: "Skincare", duration: "15:30" },
  { id: "22", youtubeId: "OeEQy4PO8Jg", title: "Safe Skincare During Pregnancy", description: "What products to use and avoid", category: "Skincare", duration: "12:00" },
  ],
};

// ════════════════════════════════════════════════════════════
// OVULATION CALCULATOR
// ════════════════════════════════════════════════════════════
export const ovulationVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "فهم الإباضة وأيام الخصوبة", description: "شرح طبي لعملية الإباضة وكيفية تتبعها", youtubeId: "mvZhvIwEAyw", duration: "10:00", category: "تعليمي" },
    { id: "2", title: "علامات التبويض الأكيدة", description: "أعراض الإباضة وكيف تعرفينها", youtubeId: "sz5jvatde_M", duration: "8:00", category: "أعراض" },
    { id: "3", title: "نصائح لزيادة فرص الحمل", description: "نصائح طبية لتعزيز الخصوبة وزيادة فرص الإنجاب", youtubeId: "KEbLo7IR31M", duration: "12:00", category: "خصوبة" },
    { id: "4", title: "حاسبة أيام التبويض", description: "كيفية حساب أيام الإباضة بدقة", youtubeId: "DO2Tr49fTQw", duration: "7:00", category: "تعليمي" },
  ],
  tr: [
    { id: "1", title: "Yumurtlama Nedir? Nasıl Takip Edilir?", description: "Ovülasyonun bilimsel açıklaması ve takip yöntemleri", youtubeId: "GriRydmtnG0", duration: "10:00", category: "Eğitim" },
    { id: "2", title: "Hamile Kalmak İçin En Verimli Günler", description: "Doğurganlık penceresi ve zamanlama ipuçları", youtubeId: "dt0-7Z8sMWQ", duration: "12:00", category: "Doğurganlık" },
    { id: "3", title: "Yumurtlama Belirtileri", description: "Ovülasyon işaretleri ve ne zaman beklemeli", youtubeId: "8foCUjjoc9Y", duration: "8:00", category: "Belirtiler" },
  ],
  de: [
    { id: "1", title: "Eisprung verstehen", description: "Medizinische Erklärung des Eisprungs", youtubeId: "EiUHX0gYDFk", duration: "10:00", category: "Bildung" },
    { id: "2", title: "Fruchtbare Tage berechnen", description: "Wie Sie Ihre fruchtbaren Tage bestimmen", youtubeId: "_2NDMvpQ96E", duration: "12:00", category: "Fruchtbarkeit" },
    { id: "3", title: "Eisprung-Symptome erkennen", description: "Anzeichen und Symptome des Eisprungs", youtubeId: "FuLsYi4aE2U", duration: "8:00", category: "Symptome" },
  ],
  fr: [
    { id: "1", title: "Comprendre l'ovulation", description: "Explication médicale du cycle d'ovulation", youtubeId: "jT20PeCSXk0", duration: "10:00", category: "Éducation" },
    { id: "2", title: "Calculer ses jours fertiles", description: "Comment déterminer votre fenêtre de fertilité", youtubeId: "k8jrTV_VjeI", duration: "12:00", category: "Fertilité" },
    { id: "3", title: "Symptômes de l'ovulation", description: "Reconnaître les signes de l'ovulation", youtubeId: "9wK8G60rDZA", duration: "8:00", category: "Symptômes" },
  ],
  es: [
    { id: "1", title: "Entender la ovulación", description: "Explicación médica del ciclo de ovulación", youtubeId: "4ZjIVIGyDd4", duration: "10:00", category: "Educación" },
    { id: "2", title: "Calcular días fértiles", description: "Cómo determinar tu ventana de fertilidad", youtubeId: "H5Jq8pzNro8", duration: "12:00", category: "Fertilidad" },
    { id: "3", title: "Síntomas de la ovulación", description: "Reconocer los signos de la ovulación", youtubeId: "7hpc_MoFKvI", duration: "8:00", category: "Síntomas" },
  ],
  pt: [
    { id: "1", title: "Entendendo a ovulação", description: "Explicação médica do ciclo de ovulação", youtubeId: "b5bvIgRDC3k", duration: "10:00", category: "Educação" },
    { id: "2", title: "Calcular dias férteis", description: "Como determinar sua janela de fertilidade", youtubeId: "lh7sGNhBVhE", duration: "12:00", category: "Fertilidade" },
    { id: "3", title: "Sintomas da ovulação", description: "Reconhecer os sinais da ovulação", youtubeId: "6L1oeXOOHt8", duration: "8:00", category: "Sintomas" },
  ],
  default: [
    { id: "1", title: "Understanding Ovulation", description: "Medical explanation of the ovulation cycle", youtubeId: "lD5OI9936DY", duration: "10:00", category: "Education" },
    { id: "2", title: "How to Track Fertile Days", description: "Methods to identify your fertility window", youtubeId: "KquoXUVHqaw", duration: "12:00", category: "Fertility" },
    { id: "3", title: "Signs of Ovulation", description: "Physical symptoms that indicate ovulation", youtubeId: "wtxQRuEmgyM", duration: "8:00", category: "Symptoms" },
    { id: "4", title: "Boosting Fertility Naturally", description: "Lifestyle tips for increasing chances of conception", youtubeId: "CwgaFwHJM4g", duration: "15:00", category: "Fertility" },
  ],
};

// ════════════════════════════════════════════════════════════
// CYCLE TRACKER
// ════════════════════════════════════════════════════════════
export const cycleTrackerVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "فهم الدورة الشهرية", description: "شرح طبي شامل لمراحل الدورة الشهرية", youtubeId: "WOi2Bwvp6hw", duration: "12:00", category: "تعليمي" },
    { id: "2", title: "تتبع الدورة الشهرية", description: "كيفية تسجيل ومتابعة دورتك الشهرية", youtubeId: "mvZhvIwEAyw", duration: "10:00", category: "تتبع" },
    { id: "3", title: "اضطرابات الدورة الشهرية", description: "متى يجب استشارة الطبيب", youtubeId: "sz5jvatde_M", duration: "9:00", category: "صحة" },
  ],
  tr: [
    { id: "1", title: "Adet Döngüsünü Anlamak", description: "Menstrüel döngünün bilimsel açıklaması", youtubeId: "8foCUjjoc9Y", duration: "12:00", category: "Eğitim" },
    { id: "2", title: "Düzensiz Adet ve Çözümleri", description: "Düzensiz döngü nedenleri ve tedavi yöntemleri", youtubeId: "dt0-7Z8sMWQ", duration: "10:00", category: "Sağlık" },
    { id: "3", title: "Adet Döngüsü Takibi", description: "Döngünüzü nasıl takip edersiniz", youtubeId: "GriRydmtnG0", duration: "8:00", category: "Takip" },
  ],
  de: [
    { id: "1", title: "Den Menstruationszyklus verstehen", description: "Medizinische Erklärung des Menstruationszyklus", youtubeId: "EiUHX0gYDFk", duration: "12:00", category: "Bildung" },
    { id: "2", title: "Zyklusmonitoring leicht gemacht", description: "Wie Sie Ihren Zyklus richtig verfolgen", youtubeId: "_2NDMvpQ96E", duration: "10:00", category: "Tracking" },
    { id: "3", title: "Unregelmäßiger Zyklus", description: "Ursachen und wann zum Arzt", youtubeId: "FuLsYi4aE2U", duration: "9:00", category: "Gesundheit" },
  ],
  fr: [
    { id: "1", title: "Comprendre le cycle menstruel", description: "Explication médicale du cycle menstruel", youtubeId: "jT20PeCSXk0", duration: "12:00", category: "Éducation" },
    { id: "2", title: "Suivre son cycle menstruel", description: "Comment bien suivre son cycle", youtubeId: "k8jrTV_VjeI", duration: "10:00", category: "Suivi" },
    { id: "3", title: "Règles irrégulières", description: "Causes et quand consulter", youtubeId: "9wK8G60rDZA", duration: "9:00", category: "Santé" },
  ],
  es: [
    { id: "1", title: "Entender el ciclo menstrual", description: "Explicación médica del ciclo menstrual", youtubeId: "4ZjIVIGyDd4", duration: "12:00", category: "Educación" },
    { id: "2", title: "Cómo hacer seguimiento del ciclo", description: "Métodos para rastrear tu ciclo", youtubeId: "H5Jq8pzNro8", duration: "10:00", category: "Seguimiento" },
    { id: "3", title: "Ciclos irregulares", description: "Causas y cuándo consultar al médico", youtubeId: "fHV8cv_mRB8", duration: "9:00", category: "Salud" },
  ],
  pt: [
    { id: "1", title: "Entendendo o ciclo menstrual", description: "Explicação médica do ciclo menstrual", youtubeId: "b5bvIgRDC3k", duration: "12:00", category: "Educação" },
    { id: "2", title: "Como acompanhar o ciclo", description: "Métodos para rastrear seu ciclo", youtubeId: "lh7sGNhBVhE", duration: "10:00", category: "Acompanhamento" },
    { id: "3", title: "Ciclos irregulares", description: "Causas e quando procurar o médico", youtubeId: "6L1oeXOOHt8", duration: "9:00", category: "Saúde" },
  ],
  default: [
    { id: "1", title: "Understanding Your Menstrual Cycle", description: "Complete medical guide to the menstrual cycle phases", youtubeId: "lD5OI9936DY", duration: "12:00", category: "Education" },
    { id: "2", title: "How to Track Your Period", description: "Methods and tips for accurate cycle tracking", youtubeId: "KquoXUVHqaw", duration: "10:00", category: "Tracking" },
    { id: "3", title: "Irregular Periods Explained", description: "When to worry and when to see a doctor", youtubeId: "wtxQRuEmgyM", duration: "9:00", category: "Health" },
    { id: "4", title: "Menstrual Cycle Phases", description: "Detailed walkthrough of cycle phases and hormones", youtubeId: "h36poEtEbi4", duration: "14:00", category: "Health" },
  ],
};

// ════════════════════════════════════════════════════════════
// DUE DATE CALCULATOR
// ════════════════════════════════════════════════════════════
export const dueDateVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "أدق طريقة لحساب الحمل وموعد الولادة", description: "حساب فترة الحمل وموعد الولادة المتوقع من آخر دورة", youtubeId: "fNUwO-Yp-GA", duration: "8:00", category: "تعليمي" },
    { id: "2", title: "مراحل تكون الجنين أسبوع بأسبوع", description: "تطور الجنين من الأسبوع الأول حتى الولادة", youtubeId: "DSeSmz2kbc4", duration: "15:00", category: "تطور الجنين" },
    { id: "3", title: "عملية الولادة الطبيعية كاملة", description: "رسوم متحركة ثلاثية الأبعاد لمراحل الولادة", youtubeId: "r4R8j8kiCHw", duration: "12:00", category: "تحضير" },
    { id: "4", title: "كيفية حساب عمر الحمل وموعد الولادة", description: "طريقة دقيقة لحساب أسابيع الحمل", youtubeId: "s2-IMl4T1Y0", duration: "10:00", category: "تعليمي" },
  ],
  tr: [
    { id: "1", title: "Hamileliğin İlk Haftaları", description: "1 ve 2 haftalık gebelik döneminde neler oluyor?", youtubeId: "rrwH5PSWWoc", duration: "8:00", category: "Eğitim" },
    { id: "2", title: "Hamilelikte Son Ay", description: "Doğuma yaklaşırken neler beklenmeli", youtubeId: "RTFFwC6nvpo", duration: "12:00", category: "Hazırlık" },
    { id: "3", title: "Doğuma Hazırlık Egzersizleri", description: "Doğum için pelvik taban güçlendirme", youtubeId: "c1PoK233RNQ", duration: "15:00", category: "Hazırlık" },
  ],
  de: [
    { id: "1", title: "Vorsorge in der Schwangerschaft", description: "Untersuchungen und Termine in der Schwangerschaft", youtubeId: "apspJxV3ZNg", duration: "10:00", category: "Bildung" },
    { id: "2", title: "Ultraschall in der 21. Woche", description: "Feindiagnostik und Entwicklung des Babys", youtubeId: "PHK3_Fe3RFQ", duration: "8:00", category: "Entwicklung" },
    { id: "3", title: "Geburtsvorbereitung", description: "Beckenboden stärken und Atmung für die Geburt", youtubeId: "c1PoK233RNQ", duration: "12:00", category: "Vorbereitung" },
  ],
  fr: [
    { id: "1", title: "Calculer l'âge de sa grossesse", description: "Comment calculer précisément les semaines de grossesse", youtubeId: "XJFredZ6vIM", duration: "8:00", category: "Éducation" },
    { id: "2", title: "Bien calculer son terme de grossesse", description: "Semaines d'aménorrhée et date prévue d'accouchement", youtubeId: "l0ipP17bI88", duration: "10:00", category: "Éducation" },
    { id: "3", title: "Comment calculer le terme", description: "Conseils de sage-femme pour calculer la date de naissance", youtubeId: "7Ij1lBfbNk0", duration: "12:00", category: "Préparation" },
  ],
  es: [
    { id: "1", title: "Cómo calcular semanas y fecha de parto", description: "Calcula las semanas de embarazo y la fecha probable de parto", youtubeId: "mTmvmQAy2Kw", duration: "10:00", category: "Educación" },
    { id: "2", title: "Fecha probable de parto", description: "Cómo calcular cuándo nacerá tu bebé", youtubeId: "6TTqni15PPc", duration: "8:00", category: "Educación" },
    { id: "3", title: "Ejercicios para el tercer trimestre", description: "Preparación física para las últimas semanas del embarazo", youtubeId: "mLVZoZ9KDBM", duration: "12:00", category: "Preparación" },
  ],
  pt: [
    { id: "1", title: "Como calcular as semanas de gestação", description: "Por que a gravidez é contada em semanas e como calcular", youtubeId: "l_3No2wF5UA", duration: "10:00", category: "Educação" },
    { id: "2", title: "Converter semanas em meses de gravidez", description: "Tabela prática para acompanhar sua gestação", youtubeId: "UB9s1EGTnxw", duration: "8:00", category: "Educação" },
    { id: "3", title: "Exercícios para o parto normal", description: "Preparação física para o parto", youtubeId: "-6QpPBWsiAo", duration: "12:00", category: "Preparação" },
  ],
  default: [
    { id: "1", title: "How to Calculate Your Due Date", description: "Medical methods for calculating expected delivery date", youtubeId: "aiUtc_MyzW8", duration: "8:00", category: "Education" },
    { id: "2", title: "Due Date Calculator from LMP", description: "How to calculate your baby's due date step by step", youtubeId: "W-ikq54sx-o", duration: "15:00", category: "Education" },
    { id: "3", title: "How to Calculate Pregnancy Due Date", description: "Easy methods for estimating your delivery date", youtubeId: "RYH2zpn3kMM", duration: "12:00", category: "Education" },
  ],
};
