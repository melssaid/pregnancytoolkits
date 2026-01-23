# pregnancy toolkit- Women's Health Tools App

![WellMama](https://img.shields.io/badge/WellMama-Women's%20Health-0891B2?style=for-the-badge)

تطبيق شامل لأدوات صحة المرأة يوفر 17 أداة احترافية لمتابعة صحة المرأة من مرحلة التخطيط للحمل وحتى ما بعد الولادة.

A comprehensive Women's Health toolkit providing 17 professional-grade calculators and trackers designed for every stage of a woman's journey — from fertility planning to postpartum care.

---

## 🌟 المميزات | Features

- ✅ **17 أداة صحية متكاملة** | 17 comprehensive health tools
- ✅ **تصميم طبي احترافي** | Professional medical design
- ✅ **حفظ البيانات محلياً** | LocalStorage persistence
- ✅ **تصميم متجاوب** | Responsive design
- ✅ **رسوم متحركة سلسة** | Smooth Framer Motion animations
- ✅ **واجهة سهلة الاستخدام** | User-friendly interface
- ✅ **بحث وفلترة حسب الفئة** | Search and category filtering

---

## 🛠️ الأدوات المتاحة | Available Tools

### 🌸 الخصوبة | Fertility
| الأداة | Tool | الوصف |
|--------|------|--------|
| حاسبة الإباضة | Ovulation Calculator | تتبع فترة الخصوبة وتوقع موعد الإباضة |

### 🤰 الحمل | Pregnancy
| الأداة | Tool | الوصف |
|--------|------|--------|
| حاسبة موعد الولادة | Due Date Calculator | حساب موعد الولادة المتوقع |
| حاسبة مؤشر كتلة الجسم للحامل | Pregnancy BMI | حساب الوزن المثالي خلال الحمل |
| عداد ركلات الجنين | Kick Counter | تتبع حركات الجنين |
| متتبع نمو الجنين | Fetal Growth Tracker | متابعة نمو الجنين أسبوعياً |

### ⏱️ المخاض | Labor
| الأداة | Tool | الوصف |
|--------|------|--------|
| مؤقت الانقباضات | Contraction Timer | قياس توقيت ومدة الانقباضات |

### 👶 ما بعد الولادة | Postpartum
| الأداة | Tool | الوصف |
|--------|------|--------|
| متتبع الرضاعة | Breastfeeding Tracker | تسجيل جلسات الرضاعة |

### ⚠️ تقييم المخاطر | Risk Assessment
| الأداة | Tool | الوصف |
|--------|------|--------|
| تقييم سكري الحمل | GDM Risk Assessment | تقييم عوامل خطر سكري الحمل |
| تقييم تسمم الحمل | Preeclampsia Risk | تقييم عوامل خطر تسمم الحمل |

### 🧠 الصحة النفسية | Mental Health
| الأداة | Tool | الوصف |
|--------|------|--------|
| فحص اكتئاب ما بعد الولادة | PPD Screener (EPDS) | استبيان إدنبرة لاكتئاب ما بعد الولادة |

### 💪 العافية | Wellness
| الأداة | Tool | الوصف |
|--------|------|--------|
| متتبع شرب الماء | Water Intake Tracker | تتبع كمية الماء اليومية |
| دليل التمارين | Exercise Guide | تمارين آمنة لكل مرحلة من الحمل |

### 📚 مراجع | Reference
| الأداة | Tool | الوصف |
|--------|------|--------|
| دليل الأدوية الآمنة | Safe Medications | مرجع سريع للأدوية أثناء الحمل والرضاعة |
| جدول التطعيمات | Vaccination Schedule | جدول التطعيمات للحامل والمولود |

### 📋 التحضير | Preparation
| الأداة | Tool | الوصف |
|--------|------|--------|
| قائمة حقيبة المستشفى | Hospital Bag Checklist | قائمة شاملة لتجهيز حقيبة الولادة |

### 🧬 الوراثة | Genetics
| الأداة | Tool | الوصف |
|--------|------|--------|
| حاسبة فصيلة الدم | Blood Type Calculator | توقع فصيلة دم الطفل |

### 🔴 صحة الدورة الشهرية | Menstrual Health
| الأداة | Tool | الوصف |
|--------|------|--------|
| متتبع الدورة الشهرية | Cycle Tracker | تتبع الدورة الشهرية والأعراض |

---

## 🚀 كيفية الاستخدام | How to Use

### التشغيل المحلي | Local Development

```bash
# تثبيت الحزم | Install dependencies
npm install

# تشغيل التطبيق | Start development server
npm run dev

# بناء للإنتاج | Build for production
npm run build
```

### استخدام التطبيق | Using the App

1. **الصفحة الرئيسية**: تعرض جميع الأدوات الـ 17 في شبكة منظمة
2. **البحث**: استخدم شريط البحث للعثور على أداة محددة
3. **الفلترة**: اختر فئة معينة لعرض الأدوات ذات الصلة
4. **الأدوات**: انقر على أي بطاقة للدخول إلى الأداة واستخدامها

---

## 🛠️ التقنيات المستخدمة | Tech Stack

| التقنية | الاستخدام |
|---------|----------|
| **React 18** | إطار العمل الأساسي |
| **TypeScript** | لغة البرمجة |
| **Vite** | أداة البناء |
| **Tailwind CSS** | تنسيق الواجهة |
| **Framer Motion** | الرسوم المتحركة |
| **shadcn/ui** | مكتبة المكونات |
| **React Router** | التنقل بين الصفحات |
| **date-fns** | معالجة التواريخ |
| **Lucide React** | الأيقونات |
| **LocalStorage** | حفظ البيانات محلياً |

---

## 📁 هيكل المشروع | Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # التخطيط العام
│   ├── ToolCard.tsx        # بطاقة الأداة
│   └── ui/                 # مكونات shadcn
├── lib/
│   ├── tools-data.ts       # بيانات الأدوات
│   └── utils.ts            # دوال مساعدة
├── pages/
│   ├── Index.tsx           # الصفحة الرئيسية
│   └── tools/
│       ├── OvulationCalculator.tsx
│       ├── DueDateCalculator.tsx
│       ├── CycleTracker.tsx
│       ├── PregnancyBMI.tsx
│       ├── KickCounter.tsx
│       ├── ContractionTimer.tsx
│       ├── FetalGrowth.tsx
│       ├── BloodType.tsx
│       ├── GestationalDiabetes.tsx
│       ├── PreeclampsiaRisk.tsx
│       ├── SafeMedications.tsx
│       ├── PPDScreener.tsx
│       ├── BreastfeedingTracker.tsx
│       ├── WaterIntake.tsx
│       ├── ExerciseGuide.tsx
│       ├── VaccinationSchedule.tsx
│       └── HospitalBag.tsx
└── App.tsx                 # التوجيه الرئيسي
```

---

## 🎨 نظام التصميم | Design System

### الألوان | Colors
- **Primary**: Teal (`#0891B2`) - اللون الأساسي للثقة والصحة
- **Success**: Green - للنتائج الإيجابية
- **Warning**: Amber - للتحذيرات
- **Destructive**: Red - للمخاطر العالية

### المبادئ | Principles
- تصميم نظيف وموثوق مستوحى من Mayo Clinic/WebMD
- مسافات بيضاء واسعة
- بطاقات بيضاء على خلفية رمادية فاتحة
- طباعة واضحة مع تدرج هرمي

---

## ⚠️ إخلاء المسؤولية الطبية | Medical Disclaimer

> **هام**: هذه الأدوات للأغراض المعلوماتية والتعليمية فقط. لا تشكل نصيحة طبية أو تشخيصاً أو علاجاً. استشر دائماً مقدمي الرعاية الصحية المؤهلين لاتخاذ القرارات الطبية.

> **Important**: These tools are for informational and educational purposes only. They do not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.

---

## 📝 الترخيص | License

هذا المشروع مفتوح المصدر ومتاح للاستخدام والتعديل.

---

## 🤝 المساهمة | Contributing

نرحب بالمساهمات! يرجى فتح issue أو pull request لأي اقتراحات أو تحسينات.

---

<div align="center">

**صُنع بـ ❤️ لدعم صحة المرأة**

**Made with ❤️ to support women's health**

</div>
