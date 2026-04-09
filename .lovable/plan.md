

# خطة: إزالة تكرار إخلاء المسؤولية الطبية

## المشكلة

1. **شاشة الترحيب (Step 5)**: يظهر إخلاء المسؤولية مرتين — مربع "إخلاء المسؤولية الطبية" + نص `consultNote` أسفله (نفس المعنى مكرر)
2. **ToolFrame**: كل أداة تعرض disclaimer في الفوتر عبر `ToolFrame` — وبعض الأدوات تضيف `AIResultDisclaimer` إضافي داخل المحتوى (مثل SmartAppointmentReminder)

## الإجراءات

### 1. دمج الإخلاء في شاشة الترحيب (OnboardingStep5Privacy.tsx)
- **حذف** نص `consultNote` المنفصل (السطر 72-74) لأن مربع الإخلاء أعلاه يحتوي نفس المعنى بالفعل
- **تحسين** مربع الإخلاء ليكون شاملاً بنص واحد واضح ومختصر

### 2. فحص الأدوات للتكرار
- أداة `SmartAppointmentReminder` تعرض `AIResultDisclaimer` داخلياً + فوتر `ToolFrame` = تكرار → إزالة `AIResultDisclaimer` الداخلي لأن `ToolFrame` يغطيه
- فحص باقي الأدوات التي تستخدم `MedicalDisclaimer` (حالياً auto-accept بدون UI) — هذه لا تسبب تكراراً مرئياً

### 3. توحيد الأسلوب
- الاعتماد على فوتر `ToolFrame` كإخلاء وحيد لكل الأدوات
- إبقاء `AIResultDisclaimer` فقط عندما لا يكون داخل `ToolFrame`

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `src/components/onboarding/OnboardingStep5Privacy.tsx` | حذف `consultNote` المكرر |
| `src/pages/tools/SmartAppointmentReminder.tsx` | إزالة `AIResultDisclaimer` المكرر |

## النتيجة
إخلاء مسؤولية واحد فقط في كل شاشة — لا تكرار.

