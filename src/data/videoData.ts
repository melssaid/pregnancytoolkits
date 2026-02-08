import type { Video, VideosByLang } from '@/components/VideoLibrary';

/**
 * Centralized language-specific video data for all tools.
 * Arabic videos are curated for modest, conservative content.
 * Default videos serve all other languages.
 */

// ════════════════════════════════════════════════════════════
// MEAL SUGGESTION / NUTRITION
// ════════════════════════════════════════════════════════════
export const nutritionVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "تغذية الحامل - نصائح مهمة", description: "نصائح غذائية أساسية للحامل من أخصائية تغذية", youtubeId: "JYP1yTpfSLk", duration: "12:00", category: "تغذية" },
    { id: "2", title: "أطعمة مفيدة أثناء الحمل", description: "أفضل الأطعمة لصحة الأم والجنين", youtubeId: "3xN2g0tYbHo", duration: "10:00", category: "تغذية" },
    { id: "3", title: "نظام غذائي صحي للحامل", description: "خطة وجبات صحية لكل ثلث من الحمل", youtubeId: "QZpEq5JFHSQ", duration: "15:00", category: "تغذية" },
    { id: "4", title: "أطعمة ممنوعة أثناء الحمل", description: "أطعمة يجب تجنبها أثناء الحمل", youtubeId: "sJ0lDZ6qfhM", duration: "8:00", category: "سلامة غذائية" },
    { id: "5", title: "سكر الحمل - نظام غذائي", description: "التغذية المناسبة لسكري الحمل", youtubeId: "68NMhivpmWQ", duration: "9:30", category: "حمية خاصة" },
    { id: "6", title: "وجبات صحية للحامل", description: "أفكار وجبات سريعة ومغذية", youtubeId: "0QZWIuJGVZY", duration: "12:30", category: "وصفات" },
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
    { id: "3", title: "يوغا استرخاء للحامل", description: "يوغا استرخاء عميق للنوم", youtubeId: "pHzsNfr2NCQ", duration: "15:00", category: "يوغا" },
    { id: "4", title: "أوضاع النوم الصحيحة للحامل", description: "أفضل وضعيات النوم أثناء الحمل", youtubeId: "qa7RY4V6ihM", duration: "10:00", category: "نصائح" },
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
    { id: "1", title: "أوضاع الولادة الطبيعية", description: "أفضل أوضاع الدفع أثناء المخاض", youtubeId: "jvY_KDCy7E4", duration: "8:00", category: "ولادة" },
    { id: "2", title: "تحضير الجسم للولادة", description: "تمارين تحضيرية للولادة الطبيعية", youtubeId: "Vy6jonW1lFg", duration: "12:00", category: "تحضير" },
    { id: "3", title: "تمارين تسهيل الولادة", description: "تمارين لفتح الحوض وتسهيل المخاض", youtubeId: "oBY_25mR2WU", duration: "15:00", category: "تمارين" },
    { id: "4", title: "نصائح للولادة الطبيعية", description: "إرشادات مهمة للولادة بدون ألم", youtubeId: "pHzsNfr2NCQ", duration: "15:00", category: "نصائح" },
  ],
  default: [
    { id: "1", title: "Top 5 Pushing Positions for Childbirth", description: "Best positions for effective pushing during labor", youtubeId: "npGb1aHQteo", duration: "10:00", category: "Pushing" },
    { id: "2", title: "Birth Faster With Less Pain", description: "Childbirth positions for easier labor", youtubeId: "nc8IbAAotHo", duration: "15:00", category: "Labor Positions" },
    { id: "3", title: "Different Pushing Positions in Labour", description: "Various positions explained for delivery", youtubeId: "i7vcGKtyqCY", duration: "12:00", category: "Pushing" },
    { id: "4", title: "The Best Positions for Birth", description: "Expert guide to optimal birthing positions", youtubeId: "CENq9lrciN0", duration: "14:00", category: "Labor Positions" },
  ],
};

// ════════════════════════════════════════════════════════════
// LACTATION PREP
// ════════════════════════════════════════════════════════════
export const lactationVideosByLang: VideosByLang = {
  ar: [
    { id: "1", title: "الرضاعة الطبيعية للمبتدئات", description: "دليل شامل للرضاعة الطبيعية الصحيحة", youtubeId: "rNjJyTga__w", duration: "20:00", category: "بداية" },
    { id: "2", title: "رعاية المولود الجديد", description: "كل ما تحتاجين معرفته عن رعاية المولود", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "رعاية المولود" },
    { id: "3", title: "تغذية المولود والرضاعة", description: "نصائح عملية للرضاعة والتغذية", youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: "رعاية المولود" },
    { id: "4", title: "دليل رعاية الطفل الرضيع", description: "التعامل مع الرضيع والتغذية والنوم", youtubeId: "CXWzqbe1i9c", duration: "6:00", category: "بداية" },
  ],
  default: [
    { id: "1", title: "Breastfeeding a Newborn", description: "What's normal, common challenges, and tips from pediatrician IBCLC", youtubeId: "rNjJyTga__w", duration: "20:00", category: "Getting Started" },
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
    { id: "3", title: "التحضير للولادة معاً", description: "كيف يشارك الزوج في التحضير للولادة", youtubeId: "nc8IbAAotHo", duration: "15:00", category: "تحضير" },
    { id: "4", title: "نصائح للأزواج الجدد", description: "إرشادات مهمة للآباء لأول مرة", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "نصائح" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.partnerGuide.videos.v1.title'), description: t('toolsInternal.partnerGuide.videos.v1.description'), youtubeId: "hpgjwK_oQe0", duration: "18:00", category: t('toolsInternal.partnerGuide.videos.v1.category') },
    { id: "2", title: t('toolsInternal.partnerGuide.videos.v2.title'), description: t('toolsInternal.partnerGuide.videos.v2.description'), youtubeId: "-CWJYxIvoFQ", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v2.category') },
    { id: "3", title: t('toolsInternal.partnerGuide.videos.v3.title'), description: t('toolsInternal.partnerGuide.videos.v3.description'), youtubeId: "nc8IbAAotHo", duration: "15:00", category: t('toolsInternal.partnerGuide.videos.v3.category') },
    { id: "4", title: t('toolsInternal.partnerGuide.videos.v4.title'), description: t('toolsInternal.partnerGuide.videos.v4.description'), youtubeId: "NTulfAOzbp8", duration: "8:00", category: t('toolsInternal.partnerGuide.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// MENTAL HEALTH
// ════════════════════════════════════════════════════════════
export const mentalHealthVideosByLang = (t: (key: string) => string): VideosByLang => ({
  ar: [
    { id: "1", title: "الصحة النفسية بعد الولادة", description: "فهم اكتئاب ما بعد الولادة وعلاجه", youtubeId: "6kV2_L3uSS0", duration: "8:30", category: "صحة نفسية" },
    { id: "2", title: "اكتئاب ما بعد الولادة", description: "الأعراض والأسباب وطرق العلاج", youtubeId: "Aj1Vk3q-4tg", duration: "10:15", category: "صحة نفسية" },
    { id: "3", title: "تأمل استرخاء للأمهات", description: "تأمل مهدئ للأمهات الجدد", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "تأمل" },
    { id: "4", title: "رعاية المولود الجديد", description: "دليل شامل لرعاية الطفل يخفف القلق", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "رعاية" },
  ],
  default: [
    { id: "1", title: t('toolsInternal.mentalHealthCoach.videos.v1.title'), description: t('toolsInternal.mentalHealthCoach.videos.v1.description'), youtubeId: "6kV2_L3uSS0", duration: "8:30", category: t('toolsInternal.mentalHealthCoach.videos.v1.category') },
    { id: "2", title: t('toolsInternal.mentalHealthCoach.videos.v2.title'), description: t('toolsInternal.mentalHealthCoach.videos.v2.description'), youtubeId: "Aj1Vk3q-4tg", duration: "10:15", category: t('toolsInternal.mentalHealthCoach.videos.v2.category') },
    { id: "3", title: t('toolsInternal.mentalHealthCoach.videos.v3.title'), description: t('toolsInternal.mentalHealthCoach.videos.v3.description'), youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: t('toolsInternal.mentalHealthCoach.videos.v3.category') },
    { id: "4", title: t('toolsInternal.mentalHealthCoach.videos.v4.title'), description: t('toolsInternal.mentalHealthCoach.videos.v4.description'), youtubeId: "hpgjwK_oQe0", duration: "18:00", category: t('toolsInternal.mentalHealthCoach.videos.v4.category') },
  ],
});

// ════════════════════════════════════════════════════════════
// VIDEO LIBRARY PAGE (General)
// ════════════════════════════════════════════════════════════
export const generalVideosByLang: VideosByLang = {
  ar: [
    // تغذية
    { id: "1", youtubeId: "JYP1yTpfSLk", title: "تغذية الحامل - نصائح مهمة", description: "نصائح غذائية أساسية للحامل", category: "تغذية", duration: "12:00" },
    { id: "2", youtubeId: "3xN2g0tYbHo", title: "أطعمة مفيدة أثناء الحمل", description: "أفضل الأطعمة لصحة الأم والجنين", category: "تغذية", duration: "10:00" },
    { id: "3", youtubeId: "sJ0lDZ6qfhM", title: "أطعمة ممنوعة أثناء الحمل", description: "أطعمة يجب تجنبها", category: "تغذية", duration: "8:00" },
    // تأمل واسترخاء
    { id: "4", youtubeId: "pCSjhbVOdYQ", title: "تأمل استرخاء الحمل", description: "تأمل مهدئ للأمهات الحوامل", category: "صحة نفسية", duration: "60:00" },
    { id: "5", youtubeId: "pHzsNfr2NCQ", title: "يوغا ما قبل الولادة", description: "يوغا استرخاء للحامل", category: "صحة نفسية", duration: "15:00" },
    // تمارين
    { id: "6", youtubeId: "qa7RY4V6ihM", title: "تمرين كامل للحامل", description: "تمرين لطيف لكامل الجسم", category: "تمارين", duration: "10:00" },
    { id: "7", youtubeId: "Vy6jonW1lFg", title: "تمارين تقوية للحامل", description: "تمارين تقوية آمنة أثناء الحمل", category: "تمارين", duration: "12:00" },
    // ولادة وتحضير
    { id: "8", youtubeId: "jvY_KDCy7E4", title: "تحضير للولادة", description: "تمارين وأوضاع تحضيرية للولادة", category: "ولادة", duration: "8:00" },
    { id: "9", youtubeId: "NTulfAOzbp8", title: "حقيبة المستشفى", description: "قائمة تجهيز حقيبة الولادة", category: "تحضير", duration: "8:00" },
    // رعاية المولود
    { id: "10", youtubeId: "hpgjwK_oQe0", title: "رعاية المولود - الأسبوع الأول", description: "دليل الأسبوع الأول مع المولود", category: "رعاية المولود", duration: "18:00" },
    { id: "11", youtubeId: "rNjJyTga__w", title: "الرضاعة الطبيعية", description: "دليل شامل للرضاعة الطبيعية", category: "رعاية المولود", duration: "20:00" },
    // بشرة
    { id: "12", youtubeId: "CK9K2TmLG3c", title: "العناية بالبشرة للحامل", description: "روتين بشرة آمن أثناء الحمل", category: "عناية بالبشرة", duration: "15:30" },
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
    { id: "12", youtubeId: "npGb1aHQteo", title: "Top 5 Pushing Positions", description: "Best positions for effective pushing during labor", category: "Labor & Birth", duration: "10:00" },
    { id: "13", youtubeId: "nc8IbAAotHo", title: "Birth Faster With Less Pain", description: "Childbirth positions for easier labor", category: "Labor & Birth", duration: "15:00" },
    { id: "14", youtubeId: "i7vcGKtyqCY", title: "Different Pushing Positions", description: "Various positions explained for delivery", category: "Labor & Birth", duration: "12:00" },
    { id: "15", youtubeId: "NTulfAOzbp8", title: "Hospital Bag Checklist", description: "Midwife advice on what to pack", category: "Preparation", duration: "8:00" },
    { id: "16", youtubeId: "oUxVPhwFuMM", title: "Essential Hospital Bag Items", description: "Must-have items for labor and delivery", category: "Preparation", duration: "12:30" },
    { id: "17", youtubeId: "hpgjwK_oQe0", title: "Newborn Care Week 1", description: "Pediatrician guide to first week", category: "Newborn Care", duration: "18:00" },
    { id: "18", youtubeId: "-CWJYxIvoFQ", title: "Caring For Your Newborn", description: "Comprehensive newborn care guide", category: "Newborn Care", duration: "15:00" },
    { id: "19", youtubeId: "CXWzqbe1i9c", title: "Newborn Baby Care Guide", description: "Handling, feeding, and sleeping basics", category: "Newborn Care", duration: "6:00" },
    { id: "20", youtubeId: "rNjJyTga__w", title: "Breastfeeding a Newborn", description: "What's normal and common challenges", category: "Newborn Care", duration: "20:00" },
    { id: "21", youtubeId: "CK9K2TmLG3c", title: "Pregnancy Safe Skincare Routine", description: "Dermatologist's safe skincare guide", category: "Skincare", duration: "15:30" },
    { id: "22", youtubeId: "OeEQy4PO8Jg", title: "Safe Skincare During Pregnancy", description: "What products to use and avoid", category: "Skincare", duration: "12:00" },
  ],
};
