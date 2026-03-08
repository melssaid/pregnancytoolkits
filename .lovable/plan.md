

## اصلاح الطباعة أثناء التحميل

### المشكلة
أزرار الطباعة والتحميل متاحة أثناء تحميل المحتوى (streaming). عند الضغط عليها قبل اكتمال التحميل، يتم طباعة تقرير ناقص أو فارغ.

### الحل
إضافة prop جديد `isLoading` لمكون `PrintableReport` لتعطيل أزرار الطباعة والتحميل أثناء التحميل.

### التغييرات

**1. `src/components/PrintableReport.tsx`**
- إضافة `isLoading?: boolean` للـ props
- تعطيل زري الطباعة والتحميل عندما `isLoading === true`
- إضافة نص توضيحي بأن التقرير لا يزال يُحمّل

**2. `src/components/smart-plan/SmartPlanResultView.tsx`**
- تمرير `isLoading` للـ `PrintableReport`

**3. `src/pages/tools/AIBirthPlanGenerator.tsx`**
- تمرير `isLoading` للـ `PrintableReport`

**4. `src/pages/tools/PostpartumMentalHealthCoach.tsx`**
- تمرير `isLoading` للـ `PrintableReport`

