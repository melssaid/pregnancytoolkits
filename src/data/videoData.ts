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
    { id: "1", title: "وضعيات النوم الآمنة للحامل", description: "أفضل وضعيات النوم خلال فترة الحمل ونصائح مهمة", youtubeId: "UOWU-oCLORo", duration: "8:00", category: "نصائح" },
    { id: "2", title: "أثر النوم على الظهر والبطن للحامل", description: "مستويات الخطورة حسب شهور الحمل", youtubeId: "j1LWAgOOogU", duration: "10:00", category: "نصائح" },
    { id: "3", title: "تشنجات الساق وصعوبة النوم للحامل", description: "أسباب تشنجات الساق الليلية وكيفية التعامل معها", youtubeId: "2wDvnE4wZi4", duration: "12:00", category: "حلول" },
    { id: "4", title: "تمارين إطالة آمنة للحامل", description: "تمارين إطالة للورك والظهر تساعد على الاسترخاء", youtubeId: "uWRwBBMFXys", duration: "12:00", category: "تمارين" },
  ],
  tr: [
    { id: "1", title: "En İdeal Uyku Pozisyonu", description: "Hamilelikte en güvenli ve rahat uyku pozisyonları", youtubeId: "o9HckKtrEgQ", duration: "10:00", category: "İpuçları" },
    { id: "2", title: "Gebelikte Rahat Uyku Rehberi", description: "Son aylarda rahat uyumak için pratik öneriler", youtubeId: "V63tlQewJtA", duration: "12:00", category: "İpuçları" },
    { id: "3", title: "Hamilelikte Rahatlama Egzersizleri", description: "Uyku öncesi gevşeme ve nefes egzersizleri", youtubeId: "hmJbDNahUuA", duration: "12:00", category: "Rahatlama" },
    { id: "4", title: "Hamilelikte Germe ve Esneme", description: "Uyku kalitesini artıran esneme egzersizleri", youtubeId: "VI5GZDFK228", duration: "15:00", category: "Egzersiz" },
  ],
  de: [
    { id: "1", title: "Schlafpositionen in der Schwangerschaft", description: "Welche Schlafposition ist die sicherste für Schwangere?", youtubeId: "Eq0uJPWpQuQ", duration: "12:00", category: "Tipps" },
    { id: "2", title: "Entspannung vor dem Schlafen", description: "Yoga-Übungen für besseren Schlaf in der Schwangerschaft", youtubeId: "AzuIPejeHXA", duration: "10:00", category: "Yoga" },
    { id: "3", title: "Besser schlafen in der Schwangerschaft", description: "Tipps gegen Schlafprobleme für Schwangere", youtubeId: "W-dn0EdwOkE", duration: "12:00", category: "Tipps" },
    { id: "4", title: "Dehnübungen für die Nacht", description: "Stretching vor dem Schlafengehen für Schwangere", youtubeId: "c1PoK233RNQ", duration: "12:00", category: "Übungen" },
  ],
  fr: [
    { id: "1", title: "Mieux dormir pendant la grossesse", description: "Positions et conseils pour un sommeil réparateur", youtubeId: "jDeR6pJoJ1M", duration: "12:00", category: "Conseils" },
    { id: "2", title: "Yoga prénatal pour le sommeil", description: "Relaxation profonde avant le coucher", youtubeId: "ZhtzgI1cmTA", duration: "15:00", category: "Yoga" },
    { id: "3", title: "Positions de sommeil enceinte", description: "Les meilleures positions pour dormir enceinte", youtubeId: "ewuObczERVY", duration: "12:00", category: "Conseils" },
    { id: "4", title: "Exercices de relaxation nocturne", description: "Étirements doux avant le coucher pour futures mamans", youtubeId: "CWa-cAZuVyE", duration: "20:00", category: "Exercices" },
  ],
  es: [
    { id: "1", title: "Dormir mejor en el embarazo", description: "Consejos de matrona para un mejor descanso", youtubeId: "eeaIpg5jMnw", duration: "10:00", category: "Consejos" },
    { id: "2", title: "Yoga prenatal para dormir", description: "Yoga de relajación profunda para embarazadas", youtubeId: "gVwBXO3kqUc", duration: "20:00", category: "Yoga" },
    { id: "3", title: "Posiciones para dormir embarazada", description: "Las mejores posiciones para descansar", youtubeId: "3dZbmw7DLRE", duration: "12:00", category: "Consejos" },
    { id: "4", title: "Ejercicios de relajación", description: "Estiramientos nocturnos para embarazadas", youtubeId: "eugdUjFGnyQ", duration: "15:00", category: "Ejercicios" },
  ],
  pt: [
    { id: "1", title: "Dormir melhor na gravidez", description: "Dicas de sono para gestantes", youtubeId: "US4QH-781Kc", duration: "15:00", category: "Dicas" },
    { id: "2", title: "Yoga prenatal para relaxar", description: "Relaxamento profundo para gestantes", youtubeId: "5GNrC3ML_VM", duration: "15:00", category: "Yoga" },
    { id: "3", title: "Posições para dormir grávida", description: "Melhores posições de sono na gestação", youtubeId: "-6QpPBWsiAo", duration: "12:00", category: "Dicas" },
    { id: "4", title: "Alongamentos para relaxar", description: "Exercícios de relaxamento noturno para gestantes", youtubeId: "InieW2MYgsA", duration: "10:00", category: "Exercícios" },
  ],
  default: [
    { id: "1", title: "Best Sleep Positions During Pregnancy", description: "Safe and comfortable sleeping positions for each trimester", youtubeId: "vEcZD8Js2Ws", duration: "25:00", category: "Sleep Tips" },
    { id: "2", title: "Pregnancy Sleep Tips", description: "Expert advice for better sleep during pregnancy", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Sleep Tips" },
    { id: "3", title: "Prenatal Yoga for Better Sleep", description: "Deep relaxation yoga nidra for pregnancy", youtubeId: "UOWU-oCLORo", duration: "8:00", category: "Relaxation" },
    { id: "4", title: "Newborn Sleep Preparation", description: "Prepare for baby's sleep schedule", youtubeId: "j1LWAgOOogU", duration: "10:00", category: "Preparation" },
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
    { id: "2", title: "Doğuma Hazırlık Egzersizleri", description: "Doğumu kolaylaştıran egzersizler ve hazırlık", youtubeId: "hmJbDNahUuA", duration: "12:00", category: "Hazırlık" },
    { id: "3", title: "Normal Doğum İçin İpuçları", description: "Ağrısız doğum için önemli bilgiler", youtubeId: "RTFFwC6nvpo", duration: "12:00", category: "İpuçları" },
    { id: "4", title: "Pelvik Taban Egzersizleri", description: "Doğum öncesi pelvik taban güçlendirme egzersizleri", youtubeId: "PYCYH6M8BzU", duration: "12:00", category: "Egzersiz" },
  ],
  de: [
    { id: "1", title: "Beste Geburtspositionen", description: "3D-Animation der Geburtspositionen", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Geburt" },
    { id: "2", title: "Geburtspositionen mit Hebamme", description: "Hebamme zeigt die besten Positionen für die Geburt", youtubeId: "mqBCpcqhZd4", duration: "12:00", category: "Geburt" },
    { id: "3", title: "Geburt: Der Weg durch dein Becken", description: "Hebamme erklärt den Geburtskanal und Geburtspositionen", youtubeId: "PB90jLX50pI", duration: "14:00", category: "Geburt" },
    { id: "4", title: "Baby in Geburtsposition bringen", description: "Übungen damit das Baby tiefer ins Becken rutscht", youtubeId: "JabamlKbpKc", duration: "12:00", category: "Vorbereitung" },
  ],
  fr: [
    { id: "1", title: "Meilleures positions d'accouchement", description: "Animation 3D des positions d'accouchement", youtubeId: "ze53Ep-gwBQ", duration: "10:00", category: "Accouchement" },
    { id: "2", title: "Mouvements pour préparer l'accouchement", description: "Kinésithérapeute montre des mouvements pour faciliter le travail", youtubeId: "UAnC5Xklvsg", duration: "12:00", category: "Préparation" },
    { id: "3", title: "Comment se passe un accouchement", description: "Un docteur explique le déroulement de l'accouchement", youtubeId: "ZAv2diKYJYQ", duration: "14:00", category: "Accouchement" },
    { id: "4", title: "Accouchement sur simulateur", description: "Simulation réaliste du processus d'accouchement", youtubeId: "K-AyOw0TPcU", duration: "15:00", category: "Accouchement" },
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
    { id: "1", title: "دليل الأم للرضاعة الطبيعية", description: "كورس تأهيلي شامل عن أساسيات الرضاعة الطبيعية", youtubeId: "XzPHm2Z_aZ4", duration: "15:00", category: "رضاعة" },
    { id: "2", title: "التعامل مع الرضيع من الألف للياء", description: "دليل شامل للتعامل مع المولود الجديد", youtubeId: "917-9qGEx0E", duration: "20:00", category: "رعاية المولود" },
    { id: "3", title: "زيادة حليب الأم وإعادة الإرضاع", description: "كيفية زيادة كمية حليب الأم بشكل طبيعي", youtubeId: "MNKs1q1v5aU", duration: "12:00", category: "رضاعة" },
    { id: "4", title: "الأكل بعد الولادة ونزول اللبن", description: "متى يبدأ الأكل بعد الولادة وكيف يسرع التعافي", youtubeId: "lyFyFCOR4Ms", duration: "14:00", category: "تغذية" },
  ],
  tr: [
    { id: "1", title: "Doğru Emzirme Teknikleri", description: "Uzman ebe doğru emzirme pozisyonlarını anlatıyor", youtubeId: "YR_FuffPERY", duration: "8:00", category: "Emzirme" },
    { id: "2", title: "Emzirme Pozisyonları", description: "En iyi emzirme pozisyonları ve doğru kavrama", youtubeId: "tGq17_MJptU", duration: "12:00", category: "Emzirme" },
    { id: "3", title: "Yenidoğan Beslenmesi", description: "Bebek besleme ve emzirme programı rehberi", youtubeId: "rvjf34yF5bY", duration: "10:00", category: "Beslenme" },
    { id: "4", title: "Yenidoğan Emzirme Programı", description: "Bebeğin emzirme düzeni ve sıklığı hakkında bilgiler", youtubeId: "aksACVltV58", duration: "12:00", category: "Emzirme" },
  ],
  de: [
    { id: "1", title: "Richtig Stillen lernen", description: "Stilltechniken und Anlegetipps für Anfängerinnen", youtubeId: "2wM6smicIh8", duration: "12:00", category: "Stillen" },
    { id: "2", title: "Stillprobleme lösen", description: "Tipps gegen wunde Brustwarzen und Stillschwierigkeiten", youtubeId: "VWl92s5b_ps", duration: "10:00", category: "Stillen" },
    { id: "3", title: "Neugeborenes Baden", description: "Anleitung zum Baden des Neugeborenen", youtubeId: "Wwiokn7UX4w", duration: "8:00", category: "Babypflege" },
    { id: "4", title: "Baby Pucken Anleitung", description: "Hebamme erklärt richtiges Pucken", youtubeId: "UQjFyQBkefE", duration: "6:00", category: "Babypflege" },
  ],
  fr: [
    { id: "1", title: "Allaitement au biberon", description: "Comment nourrir bébé au biberon avec lait maternel", youtubeId: "mOlNtHGWdVM", duration: "15:00", category: "Allaitement" },
    { id: "2", title: "Sevrage de l'allaitement", description: "Comment sevrer bébé en douceur", youtubeId: "PIf8P7tV0tE", duration: "12:00", category: "Allaitement" },
    { id: "3", title: "Allaitement et règles", description: "Le retour de couche pendant l'allaitement", youtubeId: "Cq9XmyfKnlc", duration: "8:00", category: "Santé" },
    { id: "4", title: "Premiers jours avec bébé", description: "Guide complet des soins du nouveau-né", youtubeId: "Mlhv7comF9I", duration: "15:00", category: "Soins bébé" },
  ],
  es: [
    { id: "1", title: "Comenzar la lactancia materna", description: "Guía completa para iniciar la lactancia", youtubeId: "43PVtvRJ500", duration: "15:00", category: "Lactancia" },
    { id: "2", title: "Agarre correcto del pecho", description: "Técnicas para un buen agarre del bebé", youtubeId: "AJZR6N738N4", duration: "10:00", category: "Lactancia" },
    { id: "3", title: "Alimentación del recién nacido", description: "Horarios y cantidades de alimentación", youtubeId: "KTH8NOf2UBQ", duration: "12:00", category: "Alimentación" },
    { id: "4", title: "Cuidados básicos del bebé", description: "Todo lo esencial sobre el recién nacido", youtubeId: "4Z2JcCt1NZc", duration: "8:00", category: "Cuidados" },
  ],
  pt: [
    { id: "1", title: "Amamentação do recém-nascido", description: "11 dicas essenciais sobre amamentação", youtubeId: "NmxlA46jO7I", duration: "12:00", category: "Amamentação" },
    { id: "2", title: "Fases do leite materno", description: "Entenda as fases da produção do leite", youtubeId: "ds-UlJvte04", duration: "10:00", category: "Amamentação" },
    { id: "3", title: "Como fazer o bebê arrotar", description: "Técnicas para ajudar o bebê a arrotar", youtubeId: "XEwuooYNMTw", duration: "8:00", category: "Cuidados" },
    { id: "4", title: "Como acalmar o bebê", description: "Técnicas práticas para acalmar o recém-nascido", youtubeId: "K6JuBKkQDCI", duration: "6:00", category: "Cuidados" },
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
    { id: "1", title: "10 حلول للغثيان والقيء أثناء الحمل", description: "حلول عملية للتغلب على الغثيان في الحمل", youtubeId: "zj7P3wG_jFM", duration: "10:00", category: "حلول" },
    { id: "2", title: "علاج الغثيان والقيء للحامل", description: "الحل لعلاج مشكلة الغثيان في الشهور الأولى", youtubeId: "lBsnYP47U_M", duration: "8:00", category: "علاج" },
    { id: "3", title: "أدوية الغثيان الآمنة في الحمل", description: "هل أدوية علاج القيء آمنة على الجنين؟", youtubeId: "SL9FGr4zOSA", duration: "12:00", category: "نصائح طبية" },
    { id: "4", title: "أعراض الحمل الأولى ونصائح", description: "نصائح طبية للتعامل مع أعراض الثلث الأول", youtubeId: "KPA3DRZeH4A", duration: "12:00", category: "الثلث الأول" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Mide Rahatsızlıkları ve Çözümleri", description: "Reflü, gastrit ve bulantı için uzman önerileri", youtubeId: "H42j-n29Vck", duration: "12:00", category: "Çözümler" },
    { id: "2", title: "Hamilelik Bulantısı Nasıl Geçer", description: "Hamilelikte bulantıyı azaltma yolları ve pratik çözümler", youtubeId: "SE2crV20cYU", duration: "8:00", category: "İpuçları" },
    { id: "3", title: "Hamileliğin İlk Haftalarında Bulantı", description: "İlk trimesterde bulantı ve mide sorunlarıyla başa çıkma", youtubeId: "R4Jm-xNqw2k", duration: "10:00", category: "İlk Trimester" },
    { id: "4", title: "Gebelikte 6. Hafta ve Bulantı Yönetimi", description: "Erken gebelikte bulantı belirtileri ve uzman tavsiyeleri", youtubeId: "HKp_ShC-jIY", duration: "10:00", category: "Erken Gebelik" },
  ],
  de: [
    { id: "1", title: "Übelkeit in der Schwangerschaft", description: "Hausmittel und Tipps gegen Schwangerschaftsübelkeit", youtubeId: "ZkZd3xjSzXs", duration: "8:00", category: "Tipps" },
    { id: "2", title: "Morgenübelkeit bewältigen", description: "Praktische Tipps gegen Morgenübelkeit in der Schwangerschaft", youtubeId: "qIPAwjCk3N4", duration: "12:00", category: "Tipps" },
    { id: "3", title: "Erstes Trimester - Übelkeit lindern", description: "Strategien gegen Übelkeit im ersten Trimester", youtubeId: "PUjUEHtQMgw", duration: "10:00", category: "Erstes Trimester" },
    { id: "4", title: "Natürliche Mittel gegen Übelkeit", description: "Hausmittel und natürliche Hilfe bei Schwangerschaftsübelkeit", youtubeId: "-dzXS-qCuXg", duration: "10:00", category: "Hausmittel" },
  ],
  fr: [
    { id: "1", title: "Nausées de grossesse - Solutions", description: "Premier trimestre : guide complet des symptômes", youtubeId: "ONOfE08L8gI", duration: "15:00", category: "Premier trimestre" },
    { id: "2", title: "Premiers signes de grossesse", description: "Sage-femme explique les premiers symptômes", youtubeId: "h0x3mGKhjD0", duration: "10:00", category: "Symptômes" },
    { id: "3", title: "Arrêter les nausées naturellement", description: "Astuces simples pour calmer les nausées", youtubeId: "eqR57WnuUDA", duration: "8:00", category: "Remèdes" },
    { id: "4", title: "Gérer les nausées matinales", description: "Conseils pratiques contre les nausées du matin", youtubeId: "nYDMVsTRWWk", duration: "12:00", category: "Conseils" },
  ],
  es: [
    { id: "1", title: "Aliviar náuseas del embarazo", description: "Cómo aliviar las náuseas y vómitos en el embarazo", youtubeId: "eeaIpg5jMnw", duration: "10:00", category: "Remedios" },
    { id: "2", title: "Trucos contra las náuseas", description: "Trucos y consejos para combatir las náuseas", youtubeId: "3dZbmw7DLRE", duration: "12:00", category: "Consejos" },
    { id: "3", title: "Náuseas y vómitos - Causas", description: "Qué causa las náuseas y cuándo preocuparse", youtubeId: "g9cXuUhu87I", duration: "10:00", category: "Educación" },
    { id: "4", title: "Tips para las náuseas", description: "Consejos prácticos de matrona para las náuseas", youtubeId: "J89bSDvMwLU", duration: "8:00", category: "Tips" },
  ],
  pt: [
    { id: "1", title: "Enjoo na gravidez - Soluções", description: "Como aliviar os enjoos na gestação", youtubeId: "NCqlxrtxm-c", duration: "10:00", category: "Soluções" },
    { id: "2", title: "Remédios naturais para enjoo", description: "Dicas práticas contra os enjoos matinais", youtubeId: "ilvONKYF_Cs", duration: "8:00", category: "Remédios" },
    { id: "3", title: "Chás seguros na gravidez", description: "Quais chás a grávida pode tomar", youtubeId: "NR9gUpO7eao", duration: "12:00", category: "Naturais" },
    { id: "4", title: "Dor nas costas e enjoo na gravidez", description: "Como lidar com desconfortos comuns do primeiro trimestre", youtubeId: "7cgf5lmR5Vo", duration: "10:00", category: "Primeiro trimestre" },
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
    { id: "1", title: "تجهيز شنطة الولادة خطوة بخطوة", description: "قائمة شاملة بكل ما تحتاجينه في حقيبة المستشفى", youtubeId: "NBYRLg8btZw", duration: "12:00", category: "تحضير" },
    { id: "2", title: "تجهيزات حقيبة الولادة", description: "تجربة أم في تحضير شنطة الولادة بالتفصيل", youtubeId: "WYaLWsdnXC4", duration: "15:00", category: "تحضير" },
    { id: "3", title: "كيفية إعداد حقيبة ما قبل الولادة", description: "نصائح متخصصة لتجهيز الحقيبة", youtubeId: "N1vJXHrV8XI", duration: "10:00", category: "نصائح" },
    { id: "4", title: "الأكل بعد الولادة والتعافي", description: "دليل التغذية بعد الولادة لتسريع التعافي", youtubeId: "lyFyFCOR4Ms", duration: "14:00", category: "ما بعد الولادة" },
  ],
  tr: [
    { id: "1", title: "Hastane Çantası Hazırlığı", description: "Doğum çantasında bulunması gerekenler", youtubeId: "1SF5QoRZh-M", duration: "10:00", category: "Hazırlık" },
    { id: "2", title: "Doğum Çantası Hazırlığı", description: "Doğum çantasında olması gereken eşyalar listesi", youtubeId: "dmZbNaCJlqM", duration: "12:00", category: "Hazırlık" },
    { id: "3", title: "Doğum Yöntemleri", description: "Doğum sancıları ve doğum yöntemleri hakkında bilgiler", youtubeId: "gq_aKsKzftw", duration: "12:00", category: "Doğum" },
    { id: "4", title: "Doğum Günü Hazırlıkları", description: "Son trimester hazırlık rehberi", youtubeId: "RTFFwC6nvpo", duration: "15:00", category: "Hazırlık" },
  ],
  de: [
    { id: "1", title: "Kliniktasche packen", description: "Was gehört in die Kliniktasche? Checkliste für die Geburt", youtubeId: "aGQmgx_Br_o", duration: "12:00", category: "Vorbereitung" },
    { id: "2", title: "Wochenbett nach Kaiserschnitt", description: "Tipps und Tricks für das Wochenbett", youtubeId: "bu1egIWJRRA", duration: "12:00", category: "Wochenbett" },
    { id: "3", title: "Geburtsvorbereitung - Kreißsaal", description: "Was erwartet mich im Kreißsaal?", youtubeId: "2wvAkSvQT_E", duration: "10:00", category: "Vorbereitung" },
    { id: "4", title: "Baby Pucken und Pflege", description: "Anleitung zur Neugeborenen-Pflege", youtubeId: "UQjFyQBkefE", duration: "8:00", category: "Babypflege" },
  ],
  fr: [
    { id: "1", title: "Valise de maternité complète", description: "Tout ce qu'il faut mettre dans la valise de maternité", youtubeId: "96RN4rH5wqY", duration: "12:00", category: "Préparation" },
    { id: "2", title: "Ma valise maternité", description: "Prête pour l'accouchement - liste complète", youtubeId: "3aDXUP5f7cw", duration: "15:00", category: "Préparation" },
    { id: "3", title: "Préparation à la naissance", description: "Questions fréquentes sur la grossesse et la naissance", youtubeId: "Mlhv7comF9I", duration: "10:00", category: "Naissance" },
    { id: "4", title: "Accouchement et péridurale", description: "Tout savoir sur l'accouchement par voie basse", youtubeId: "YDBPVxz9IcU", duration: "14:00", category: "Accouchement" },
  ],
  es: [
    { id: "1", title: "Preparar la bolsa del hospital", description: "Lista completa de la bolsa de maternidad", youtubeId: "kmhB64DUgFE", duration: "12:00", category: "Preparación" },
    { id: "2", title: "Qué llevar al hospital", description: "Esenciales para el día del parto", youtubeId: "5oXrVRy9JOo", duration: "10:00", category: "Preparación" },
    { id: "3", title: "Preparación para el parto", description: "Consejos para prepararse para el gran día", youtubeId: "0lOCLq1Ay5A", duration: "15:00", category: "Parto" },
    { id: "4", title: "Bolsa del hospital - Consejos", description: "Experiencias de mamás preparando la bolsa", youtubeId: "s8hW_qZxL9o", duration: "8:00", category: "Consejos" },
  ],
  pt: [
    { id: "1", title: "Mala da maternidade - O que levar", description: "Lista completa da mala para a maternidade", youtubeId: "iNLWMmTBO9U", duration: "15:00", category: "Preparação" },
    { id: "2", title: "Mala do bebê para o hospital", description: "O que levar na mala do bebê para a maternidade", youtubeId: "HdAzJqkvQBc", duration: "12:00", category: "Preparação" },
    { id: "3", title: "Preparação para o parto", description: "Exercícios e preparação para o trabalho de parto", youtubeId: "-6QpPBWsiAo", duration: "12:00", category: "Parto" },
    { id: "4", title: "Cuidados pós-parto", description: "Guia completo de cuidados após o nascimento", youtubeId: "2E52kABbQg0", duration: "15:00", category: "Pós-parto" },
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
    { id: "3", title: "دليل طبيب الجلدية للعناية بالبشرة", description: "مكونات آمنة وبدائل للعناية بالبشرة أثناء الحمل", youtubeId: "9NvKchuLIUw", duration: "14:00", category: "عناية بالبشرة" },
    { id: "4", title: "الوقاية من علامات التمدد", description: "نصائح وعلاجات لتقليل علامات التمدد أثناء الحمل", youtubeId: "Zmepuxvn9ck", duration: "10:00", category: "وقاية" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Cilt Bakımı", description: "Güvenli cilt bakım rutini hamileler için", youtubeId: "izPwiih-Qcw", duration: "12:00", category: "Cilt Bakımı" },
    { id: "2", title: "Hamilelikte Çatlak Önleme", description: "Gebelikte çatlak oluşumunu azaltma yöntemleri", youtubeId: "9PTAHFoHoYk", duration: "15:00", category: "Çatlak Önleme" },
    { id: "3", title: "Gebelikte Cilt Değişimleri", description: "Hamilelikte ciltte meydana gelen değişiklikler", youtubeId: "J-Fa159A02Y", duration: "10:00", category: "Cilt Bakımı" },
    { id: "4", title: "Hamilelikte Cilt Lekesi Tedavisi", description: "Gebelik maskesi ve cilt lekelerinin tedavi yöntemleri", youtubeId: "91AZucnIgag", duration: "12:00", category: "Cilt Sorunları" },
  ],
  de: [
    { id: "1", title: "Hautpflege in der Schwangerschaft", description: "Dermatologin erklärt sichere Hautpflege", youtubeId: "LbQ1QSSRKqo", duration: "15:00", category: "Hautpflege" },
    { id: "2", title: "Tipps für schöne Haut", description: "Die besten Tipps für rosige und frische Haut", youtubeId: "SL1bJQpQT_w", duration: "12:00", category: "Hautpflege" },
    { id: "3", title: "Peelings und Säuren erklärt", description: "Sichere Hautpflegeprodukte für Schwangere", youtubeId: "zzU5jzDMxPE", duration: "10:00", category: "Produkte" },
    { id: "4", title: "Nabelpflege beim Baby", description: "Richtige Pflege des Nabels beim Neugeborenen", youtubeId: "9gbPht6Wu0w", duration: "8:00", category: "Babypflege" },
  ],
  fr: [
    { id: "1", title: "Vergetures : causes et solutions", description: "Comprendre et prévenir les vergetures de grossesse", youtubeId: "faoSNxFReaY", duration: "15:00", category: "Vergetures" },
    { id: "2", title: "Masque de grossesse (mélasma)", description: "Dermatologue explique le mélasma de grossesse", youtubeId: "Fts1GYLFqcU", duration: "12:00", category: "Soins peau" },
    { id: "3", title: "Beurre de karité contre vergetures", description: "Utiliser le beurre de karité pendant la grossesse", youtubeId: "gXSOCoDoAPs", duration: "10:00", category: "Remèdes naturels" },
    { id: "4", title: "Soins de la peau enceinte", description: "Routine complète de soins pendant la grossesse", youtubeId: "lT3llgCqryo", duration: "14:00", category: "Soins peau" },
  ],
  es: [
    { id: "1", title: "Cuidado de la piel en el embarazo", description: "Rutina de cuidado seguro para embarazadas", youtubeId: "w4n63nLF2js", duration: "12:00", category: "Cuidado piel" },
    { id: "2", title: "Estrías en el embarazo", description: "Prevención y tratamiento de estrías", youtubeId: "w5RXHvvChII", duration: "10:00", category: "Estrías" },
    { id: "3", title: "Productos seguros para embarazadas", description: "Qué productos usar y cuáles evitar", youtubeId: "4vG_s89rSxs", duration: "15:00", category: "Productos" },
    { id: "4", title: "Piel y embarazo - Guía completa", description: "Todo sobre el cuidado de la piel durante la gestación", youtubeId: "jwaWYcLVhIs", duration: "12:00", category: "Guía" },
  ],
  pt: [
    { id: "1", title: "Estrias na gravidez", description: "Como combater as estrias durante a gestação", youtubeId: "5RBt7aJcvN8", duration: "12:00", category: "Estrias" },
    { id: "2", title: "Melasma na gravidez", description: "Como resolver manchas na pele durante a gestação", youtubeId: "KcejZ9cg0jQ", duration: "10:00", category: "Manchas" },
    { id: "3", title: "Skincare para gestantes", description: "Produtos proibidos e permitidos na gravidez", youtubeId: "hwRm373qqCw", duration: "15:00", category: "Skincare" },
    { id: "4", title: "Estrias: prevenção e tratamento", description: "Dermatologista explica prevenção de estrias", youtubeId: "aqD8lXVq__E", duration: "8:00", category: "Prevenção" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.skincare.videos.v1.title'), description: t('toolsInternal.skincare.videos.v1.description'), youtubeId: "CK9K2TmLG3c", duration: "15:30", category: t('toolsInternal.skincare.videos.v1.category') },
    { id: "2", title: t('toolsInternal.skincare.videos.v2.title'), description: t('toolsInternal.skincare.videos.v2.description'), youtubeId: "OeEQy4PO8Jg", duration: "12:00", category: t('toolsInternal.skincare.videos.v2.category') },
    { id: "3", title: t('toolsInternal.skincare.videos.v3.title'), description: t('toolsInternal.skincare.videos.v3.description'), youtubeId: "9NvKchuLIUw", duration: "14:00", category: t('toolsInternal.skincare.videos.v3.category') },
    { id: "4", title: t('toolsInternal.skincare.videos.v4.title'), description: t('toolsInternal.skincare.videos.v4.description'), youtubeId: "Zmepuxvn9ck", duration: "10:00", category: t('toolsInternal.skincare.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// PARTNER GUIDE
// ════════════════════════════════════════════════════════════
export const partnerVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "دور الزوج أثناء الحمل - دعم نفسي وجسدي", description: "كيف يدعم الزوج زوجته الحامل نفسياً وجسدياً", youtubeId: "5iRsoy9xt60", duration: "15:00", category: "دعم" },
    { id: "2", title: "المطلوب من الحامل في شغل البيت", description: "نصائح طبية للزوج عن مساعدة الحامل في الأعمال المنزلية", youtubeId: "Zdt88PHD5HY", duration: "12:00", category: "نصائح" },
    { id: "3", title: "التحضير للولادة معاً", description: "رسوم متحركة ثلاثية الأبعاد لمراحل الولادة", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "تحضير" },
    { id: "4", title: "رعاية المولود للآباء", description: "دليل الأب الجديد لرعاية المولود", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "رعاية المولود" },
  ],
  tr: [
    { id: "1", title: "Hamilelikte Baba Rolü", description: "Eşinizi hamilelikte nasıl desteklersiniz", youtubeId: "6DI2CRy0tXo", duration: "12:00", category: "Destek" },
    { id: "2", title: "Babalık Sanatı ve Rolü", description: "Aile olmada babanın önemi ve iyi bir baba olma rehberi", youtubeId: "hBdwSia-0mk", duration: "15:00", category: "Babalık" },
    { id: "3", title: "Yenidoğan Bakımı - Babalar İçin", description: "Yeni babalar için bebek bakım temelleri", youtubeId: "rvjf34yF5bY", duration: "10:00", category: "Bebek Bakımı" },
    { id: "4", title: "3D Animasyonla Doğum Sürecini Anlama", description: "Doğum aşamalarını birlikte öğrenin", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Eğitim" },
  ],
  de: [
    { id: "1", title: "Ich werde Papa - Das Babyexperiment", description: "Vaterrolle in der Schwangerschaft verstehen", youtubeId: "vWQlum677sk", duration: "15:00", category: "Unterstützung" },
    { id: "2", title: "Liebe Väter, wir brauchen euch!", description: "Warum die Unterstützung des Partners so wichtig ist", youtubeId: "sOM0dzL8WuA", duration: "12:00", category: "Unterstützung" },
    { id: "3", title: "Geburtsvorbereitung - 3D Animation", description: "Den Geburtsvorgang gemeinsam verstehen", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Vorbereitung" },
    { id: "4", title: "Neugeborenen-Pflege für neue Väter", description: "Grundlagen der Babypflege für werdende Väter", youtubeId: "Wwiokn7UX4w", duration: "8:00", category: "Babypflege" },
  ],
  fr: [
    { id: "1", title: "Être père aujourd'hui", description: "Documentaire complet sur la place du père dans le couple parental", youtubeId: "DYUGQ1xTDjM", duration: "60:00", category: "Soutien" },
    { id: "2", title: "15 infos grossesse - Pour les papas aussi", description: "Suivi de grossesse essentiel pour futurs parents", youtubeId: "NoyKEfe-t2k", duration: "14:00", category: "Éducation" },
    { id: "3", title: "Préparer l'accouchement ensemble - 3D", description: "Animation 3D pour comprendre l'accouchement", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Préparation" },
    { id: "4", title: "Premiers soins du nouveau-né", description: "Guide complet des soins bébé pour nouveaux parents", youtubeId: "Mlhv7comF9I", duration: "15:00", category: "Soins bébé" },
  ],
  es: [
    { id: "1", title: "El papel del padre durante el parto", description: "Guía de matrona sobre cómo ser un papá presente", youtubeId: "gQPFr2AMC3o", duration: "12:00", category: "Apoyo" },
    { id: "2", title: "Ejercicios para embarazadas - En pareja", description: "Ejercicios seguros para hacer juntos durante el embarazo", youtubeId: "U1OA_yMDah0", duration: "15:00", category: "Ejercicios" },
    { id: "3", title: "Prepararse juntos para el parto - 3D", description: "Animación 3D para entender el parto", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Preparación" },
    { id: "4", title: "Cuidados del recién nacido", description: "Guía práctica para nuevos padres", youtubeId: "4Z2JcCt1NZc", duration: "8:00", category: "Cuidado bebé" },
  ],
  pt: [
    { id: "1", title: "Incluir o pai na rotina da gravidez", description: "A importância do pai na gestação, parto e cuidados com o bebê", youtubeId: "KZqa6G5feOw", duration: "12:00", category: "Apoio" },
    { id: "2", title: "Por que o pai deve ficar sozinho com o bebê", description: "A importância do vínculo pai-bebê", youtubeId: "NJKuMOx2Lfc", duration: "12:00", category: "Vínculo" },
    { id: "3", title: "Preparar-se juntos para o parto - 3D", description: "Animação 3D para entender o parto", youtubeId: "Szm-TxgXhGU", duration: "15:00", category: "Preparação" },
    { id: "4", title: "Cuidados com recém-nascido para pais", description: "Guia prático para novos pais", youtubeId: "XEwuooYNMTw", duration: "8:00", category: "Cuidados bebê" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.partnerGuide.videos.v1.title'), description: t('toolsInternal.partnerGuide.videos.v1.description'), youtubeId: "asxKTBCs1vk", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v1.category') },
    { id: "2", title: t('toolsInternal.partnerGuide.videos.v2.title'), description: t('toolsInternal.partnerGuide.videos.v2.description'), youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v2.category') },
    { id: "3", title: t('toolsInternal.partnerGuide.videos.v3.title'), description: t('toolsInternal.partnerGuide.videos.v3.description'), youtubeId: "Szm-TxgXhGU", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v3.category') },
    { id: "4", title: t('toolsInternal.partnerGuide.videos.v4.title'), description: t('toolsInternal.partnerGuide.videos.v4.description'), youtubeId: "_7kAW0lUVAk", duration: "12:00", category: t('toolsInternal.partnerGuide.videos.v4.category') },
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
    { id: "3", youtubeId: "RfLKz-cz2uk", title: "Hamilelikte Stres ve Duygu Değişimleri", description: "Uzman doktor hamilelikte stres ve duygu değişimlerini açıklıyor", category: "Ruh Sağlığı", duration: "12:00" },
    { id: "4", youtubeId: "ohLIZdyOKFs", title: "Rahat Bir Gebelik İçin", description: "Rahat bir hamilelik için ipuçları", category: "Ruh Sağlığı", duration: "12:00" },
    { id: "5", youtubeId: "RTFFwC6nvpo", title: "Hamilelikte Son Ay", description: "Son trimester bilgileri ve hazırlık", category: "Doğum", duration: "15:00" },
    { id: "6", youtubeId: "0QlmFqU3d1E", title: "Erken Hamilelik Belirtileri", description: "İlk trimester belirtileri ve yönetimi", category: "İlk Trimester", duration: "10:00" },
    { id: "7", youtubeId: "rvjf34yF5bY", title: "Yenidoğan Beslenmesi", description: "Bebek besleme ve emzirme programı rehberi", category: "Bebek Bakımı", duration: "10:00" },
    { id: "8", youtubeId: "YR_FuffPERY", title: "Doğru Emzirme Teknikleri", description: "Uzman ebe doğru emzirme pozisyonlarını anlatıyor", category: "Bebek Bakımı", duration: "8:00" },
    { id: "9", youtubeId: "izPwiih-Qcw", title: "Hamilelikte Cilt Bakımı", description: "Güvenli cilt bakım rutini hamileler için", category: "Cilt Bakımı", duration: "12:00" },
  ],
  de: [
    { id: "1", youtubeId: "4JfuBEJLbDc", title: "Ernährung in der Schwangerschaft", description: "Gesunde Ernährungstipps für Schwangere", category: "Ernährung", duration: "12:00" },
    { id: "2", youtubeId: "M3dMkgv2JPw", title: "Schwangerschaft - Beste Tipps", description: "Tipps für Schwangerschaft, Geburt und Mamasein", category: "Ernährung", duration: "15:00" },
    { id: "3", youtubeId: "-3IdjeGg2LM", title: "Postpartale Depression verstehen", description: "Wochenbettdepression: Symptome, Ursachen und Hilfe", category: "Psychische Gesundheit", duration: "12:00" },
    { id: "4", youtubeId: "AzuIPejeHXA", title: "Schwangerschafts-Stretching", description: "10 Min Dehnübungen für alle Trimester", category: "Übungen", duration: "10:00" },
    { id: "5", youtubeId: "c1PoK233RNQ", title: "Beckenbodentraining", description: "Beckenbodenübungen für Schwangere", category: "Übungen", duration: "12:00" },
    { id: "6", youtubeId: "Wwiokn7UX4w", title: "Neugeborenes Baden", description: "Anleitung zum Baden des Neugeborenen", category: "Babypflege", duration: "8:00" },
    { id: "7", youtubeId: "2wM6smicIh8", title: "Richtig Stillen lernen", description: "Stilltechniken und Anlegetipps für Anfängerinnen", category: "Babypflege", duration: "12:00" },
    { id: "8", youtubeId: "LbQ1QSSRKqo", title: "Hautpflege in der Schwangerschaft", description: "Dermatologin erklärt sichere Hautpflege", category: "Hautpflege", duration: "15:00" },
  ],
  fr: [
    { id: "1", youtubeId: "EswSlduwhDg", title: "Alimentation pendant la grossesse", description: "Guide nutritionnel pour femmes enceintes", category: "Nutrition", duration: "14:00" },
    { id: "2", youtubeId: "by5cM4dXfbs", title: "Aliments à éviter enceinte", description: "Ce qu'il ne faut pas manger pendant la grossesse", category: "Nutrition", duration: "10:00" },
    { id: "3", youtubeId: "lkF-lsITkNY", title: "La dépression post-partum expliquée", description: "Comprendre les symptômes et le traitement", category: "Santé mentale", duration: "12:00" },
    { id: "4", youtubeId: "ZhtzgI1cmTA", title: "Pilates prénatal", description: "Renforcement du transverse - 1er trimestre", category: "Exercices", duration: "15:00" },
    { id: "5", youtubeId: "CWa-cAZuVyE", title: "Cuisses et fessiers grossesse", description: "Renforcement bas du corps pour enceintes", category: "Exercices", duration: "20:00" },
    { id: "6", youtubeId: "Mlhv7comF9I", title: "Premiers soins du nouveau-né", description: "Guide complet des soins bébé pour nouveaux parents", category: "Soins bébé", duration: "15:00" },
    { id: "7", youtubeId: "mOlNtHGWdVM", title: "Allaitement au biberon", description: "Comment nourrir bébé au biberon avec lait maternel", category: "Soins bébé", duration: "15:00" },
    { id: "8", youtubeId: "faoSNxFReaY", title: "Vergetures : causes et solutions", description: "Comprendre et prévenir les vergetures de grossesse", category: "Soins peau", duration: "15:00" },
  ],
  es: [
    { id: "1", youtubeId: "yvsnl79qH28", title: "Alimentación en el embarazo", description: "Guía nutricional para embarazadas", category: "Nutrición", duration: "14:00" },
    { id: "2", youtubeId: "spRcfWdfqMY", title: "Alimentos prohibidos y permitidos", description: "Qué comer y evitar en el embarazo", category: "Nutrición", duration: "12:00" },
    { id: "3", youtubeId: "KLH0R1faCvo", title: "Depresión posparto: causas y tratamiento", description: "Explicación completa sobre la depresión posparto", category: "Salud mental", duration: "12:00" },
    { id: "4", youtubeId: "gVwBXO3kqUc", title: "Ejercicios para embarazadas", description: "Rutina completa y segura para el embarazo", category: "Ejercicios", duration: "20:00" },
    { id: "5", youtubeId: "eugdUjFGnyQ", title: "Ejercicios primer trimestre", description: "Ejercicio seguro en el primer trimestre", category: "Ejercicios", duration: "15:00" },
    { id: "6", youtubeId: "mLVZoZ9KDBM", title: "Ejercicios tercer trimestre", description: "Ejercicio seguro en el tercer trimestre", category: "Ejercicios", duration: "15:00" },
    { id: "7", youtubeId: "4Z2JcCt1NZc", title: "Cólicos del lactante", description: "Trucos y consejos para aliviar al recién nacido", category: "Cuidado bebé", duration: "8:00" },
    { id: "8", youtubeId: "43PVtvRJ500", title: "Comenzar la lactancia materna", description: "Guía completa para iniciar la lactancia", category: "Cuidado bebé", duration: "15:00" },
    { id: "9", youtubeId: "w4n63nLF2js", title: "Cuidado de la piel en embarazo", description: "Rutina de cuidado seguro para embarazadas", category: "Cuidado piel", duration: "12:00" },
  ],
  pt: [
    { id: "1", youtubeId: "83irOqL0DUc", title: "Alimentação na gravidez", description: "Guia nutricional para gestantes", category: "Nutrição", duration: "14:00" },
    { id: "2", youtubeId: "qFpOwKdJTwo", title: "Mitos na gravidez", description: "Verdades e mentiras sobre alimentação", category: "Nutrição", duration: "12:00" },
    { id: "3", youtubeId: "tJYCadQPvpQ", title: "Depressão pós-parto: sintomas e tratamento", description: "Explicação completa sobre a depressão pós-parto", category: "Saúde mental", duration: "12:00" },
    { id: "4", youtubeId: "-6QpPBWsiAo", title: "Exercícios para o parto", description: "Preparação do corpo para o parto normal", category: "Exercícios", duration: "12:00" },
    { id: "5", youtubeId: "2E52kABbQg0", title: "Alongamentos para gestantes", description: "Mobilidade e flexibilidade na gestação", category: "Exercícios", duration: "15:00" },
    { id: "6", youtubeId: "InieW2MYgsA", title: "Exercícios do assoalho pélvico", description: "Fortalecimento do assoalho pélvico", category: "Exercícios", duration: "10:00" },
    { id: "7", youtubeId: "XEwuooYNMTw", title: "Como fazer o bebê arrotar", description: "Técnicas para ajudar o bebê a arrotar", category: "Cuidados bebê", duration: "8:00" },
    { id: "8", youtubeId: "NmxlA46jO7I", title: "Amamentação do recém-nascido", description: "11 dicas essenciais sobre amamentação", category: "Cuidados bebê", duration: "12:00" },
    { id: "9", youtubeId: "5RBt7aJcvN8", title: "Estrias na gravidez", description: "Como combater as estrias durante a gestação", category: "Cuidados pele", duration: "12:00" },
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
    { id: "3", title: "Ciclo menstrual y días fértiles", description: "Conoce tu ciclo menstrual y días fértiles", youtubeId: "3jN8omNTKzk", duration: "9:00", category: "Salud" },
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
    { id: "3", title: "Gebelikte 25. Hafta Takibi", description: "Ultrason ölçümleri ve bebeğin gelişim takibi", youtubeId: "qFPQNibqcaw", duration: "10:00", category: "Takip" },
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

// ════════════════════════════════════════════════════════════
// WALKING COACH
// ════════════════════════════════════════════════════════════
export const walkingVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "تمارين للحامل - حمل صحي وولادة ميسرة", description: "تمارين رياضية يومية للحامل لحمل أكثر صحة", youtubeId: "jvY_KDCy7E4", duration: "10:00", category: "تمارين" },
    { id: "2", title: "تمارين رياضية مخصصة للحوامل", description: "تمارين مناسبة لمنتصف فترة الحمل", youtubeId: "qa7RY4V6ihM", duration: "10:00", category: "تمارين" },
    { id: "3", title: "تمارين رياضية منزلية للحامل", description: "تمارين رياضية تقوية يمكن أداؤها في المنزل", youtubeId: "Vy6jonW1lFg", duration: "12:00", category: "تقوية" },
    { id: "4", title: "تمارين إطالة آمنة للحامل", description: "تمارين إطالة للورك والظهر أثناء الحمل", youtubeId: "uWRwBBMFXys", duration: "12:00", category: "إطالة" },
  ],
  tr: [
    { id: "1", title: "Gebelikte Egzersiz - 5. Ay", description: "Hamilelikte güvenli egzersiz programı", youtubeId: "VI5GZDFK228", duration: "15:00", category: "Egzersiz" },
    { id: "2", title: "Hamilelikte Aktif Yürüyüş", description: "Hamileler için güvenli yürüyüş ve hareket programı", youtubeId: "PYCYH6M8BzU", duration: "12:00", category: "Yürüyüş" },
    { id: "3", title: "Hamilelikte Güvenli Yürüyüş", description: "Gebelikte yürüyüş ve hafif aerobik programı", youtubeId: "hmJbDNahUuA", duration: "12:00", category: "Yürüyüş" },
    { id: "4", title: "Hamilelikte Aktif Kalma", description: "Düşük yoğunluklu egzersizlerle aktif kalma ipuçları", youtubeId: "RTFFwC6nvpo", duration: "12:00", category: "İpuçları" },
  ],
  de: [
    { id: "1", title: "Schwangerschaft Stretching - 10 Min", description: "Sanfte Dehnübungen für alle Trimester", youtubeId: "AzuIPejeHXA", duration: "10:00", category: "Dehnen" },
    { id: "2", title: "Beckenbodentraining für Schwangere", description: "Beckenbodenübungen zur Geburtsvorbereitung", youtubeId: "c1PoK233RNQ", duration: "12:00", category: "Beckenboden" },
    { id: "3", title: "Walking Cardio ohne Springen", description: "Gelenkschonendes Cardio-Training im Stehen", youtubeId: "B8N4cY2kK8k", duration: "20:00", category: "Cardio" },
    { id: "4", title: "Schwangerschafts-Stretching", description: "Sanfte Dehnübungen für alle Trimester der Schwangerschaft", youtubeId: "AzuIPejeHXA", duration: "10:00", category: "Dehnen" },
  ],
  fr: [
    { id: "1", title: "Pilates Prénatal - 1er Trimestre", description: "15 min de renforcement du transverse pour enceintes", youtubeId: "ZhtzgI1cmTA", duration: "15:00", category: "Pilates" },
    { id: "2", title: "Fitness grossesse - Brûle cellulite", description: "13 min cardio sans sauts pour tous trimestres", youtubeId: "bnxpTMcjlnA", duration: "13:00", category: "Cardio" },
    { id: "3", title: "Cuisses et fessiers grossesse", description: "Renforcement du bas du corps pour enceintes", youtubeId: "CWa-cAZuVyE", duration: "20:00", category: "Renforcement" },
    { id: "4", title: "Entraînement total body enceinte", description: "15 min de renforcement adapté pour futures mamans", youtubeId: "UOuY3cnUCxU", duration: "15:00", category: "Total Body" },
  ],
  es: [
    { id: "1", title: "Cardio bajo impacto para embarazadas", description: "Rutina de cardio sin saltos para mantenerse activa", youtubeId: "afV6pt-hrAY", duration: "15:00", category: "Cardio" },
    { id: "2", title: "Ejercicios para embarazadas - Todos los trimestres", description: "Rutina completa y segura para el embarazo", youtubeId: "U1OA_yMDah0", duration: "20:00", category: "Ejercicios" },
    { id: "3", title: "Ejercicios tercer trimestre", description: "Preparación física para las últimas semanas", youtubeId: "mLVZoZ9KDBM", duration: "15:00", category: "Tercer trimestre" },
    { id: "4", title: "Yoga prenatal para relajarse", description: "Sesión de yoga suave para embarazadas", youtubeId: "gVwBXO3kqUc", duration: "20:00", category: "Yoga" },
  ],
  pt: [
    { id: "1", title: "Treino Aeróbico para Gestantes", description: "Exercício cardiorrespiratório seguro para grávidas", youtubeId: "NOJQwTw6pAM", duration: "20:00", category: "Aeróbico" },
    { id: "2", title: "Alongamentos e Mobilidade para Grávidas", description: "Exercícios de flexibilidade para qualquer mês da gestação", youtubeId: "2E52kABbQg0", duration: "15:00", category: "Alongamento" },
    { id: "3", title: "Exercícios para o parto normal", description: "Preparação do corpo para o trabalho de parto", youtubeId: "-6QpPBWsiAo", duration: "12:00", category: "Preparação" },
    { id: "4", title: "Exercícios do assoalho pélvico", description: "Fortalecimento do assoalho pélvico para gestantes", youtubeId: "InieW2MYgsA", duration: "10:00", category: "Fortalecimento" },
  ],
  default: [
    { id: "1", title: "30 Min Prenatal Walking Workout", description: "Low impact walking workout for pregnancy", youtubeId: "Mcic8Z-8pxY", duration: "30:00", category: "Walking" },
    { id: "2", title: "Pregnancy Safe Cardio", description: "Full body low impact cardio for all trimesters", youtubeId: "M4IoSwHGezg", duration: "30:00", category: "Cardio" },
    { id: "3", title: "Prenatal Stretching Routine", description: "Gentle stretches for pregnancy comfort", youtubeId: "gb8ZF-8i160", duration: "15:00", category: "Stretching" },
    { id: "4", title: "Pregnancy Yoga for Beginners", description: "Deep relaxation and gentle movement", youtubeId: "vEcZD8Js2Ws", duration: "25:00", category: "Yoga" },
  ],
};
