

## خطة تطوير شاشة الـ Onboarding الشاملة

### المشاكل الحالية
1. **خطأ منطقي**: الحالات الصحية في Step 3 تعرض "سكري الحمل" حتى لمن اختارت "أحلم بطفل"
2. **النصوص صغيرة**: أحجام 10-11px لا تليق بتطبيق احترافي
3. **خطوة الأهداف (Goals) غير مفعّلة**: الملف موجود لكن غير مستخدم في التدفق (4 خطوات فقط)
4. **اختيار اللغة**: لا يوجد زر "لغة الجهاز" بارز مع فاصل احترافي

### التغييرات المطلوبة

#### 1. OnboardingStep1Welcome — زر لغة الجهاز + تكبير الخطوط
- إضافة زر كبير "🌐 لغة الجهاز" بأيقونة واضحة أعلى قائمة اللغات
- فاصل احترافي (divider مع نص "أو اختر يدوياً") بين زر الجهاز واللغات
- تكبير الخطوط: العنوان `text-xl font-black`، الأوصاف `text-sm`، أزرار اللغة `text-sm py-2.5`
- زر المتابعة `py-3.5 text-sm font-bold rounded-2xl`

#### 2. OnboardingStep2Journey — تكبير + توصيات فورية
- تكبير العنوان والنصوص لتتوافق مع معايير Pregnancy+
- عرض `JourneyRecommendations` مباشرة أسفل اختيار المرحلة

#### 3. OnboardingStep3Health — حالات صحية ذكية حسب المرحلة
- استقبال `journeyStage` كـ prop
- **Fertility**: PCOS، اضطراب الغدة الدرقية، ضغط الدم، لا شيء
- **Pregnant**: سكري حمل، ضغط دم، حمل توأم، غدة درقية، لا شيء
- **Postpartum**: اكتئاب ما بعد الولادة، ضغط الدم، غدة درقية، لا شيء
- تكبير جميع الخطوط وحقول الإدخال (`h-11` بدل `h-8`)

#### 4. OnboardingStep4Goals — إعادة تفعيل في التدفق
- تكبير الخطوط والأزرار لتتوافق مع باقي الخطوات

#### 5. OnboardingStep5Privacy — تكبير الخطوط

#### 6. OnboardingDisclaimer — تحديث التدفق
- `TOTAL_STEPS = 5`
- إضافة Step 4 (Goals) بين Health و Privacy
- تمرير `journeyStage` إلى Step 3

### الملفات المتأثرة (6 ملفات)
- `src/components/OnboardingDisclaimer.tsx`
- `src/components/onboarding/OnboardingStep1Welcome.tsx`
- `src/components/onboarding/OnboardingStep2Journey.tsx`
- `src/components/onboarding/OnboardingStep3Health.tsx`
- `src/components/onboarding/OnboardingStep4Goals.tsx`
- `src/components/onboarding/OnboardingStep5Privacy.tsx`

