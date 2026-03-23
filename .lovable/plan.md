

# إضافة استدعاء useInAppReview في عداد الركلات وحاسبة موعد الولادة

## التغييرات

### 1. SmartKickCounter.tsx
- استيراد `useInAppReview` من `@/hooks/useInAppReview`
- استدعاء `maybePromptReview('kick_count_complete')` بعد حفظ الجلسة بنجاح (سطر ~128، بعد `setHistory`)

### 2. DueDateCalculator.tsx
- استيراد `useInAppReview` من `@/hooks/useInAppReview`
- استدعاء `maybePromptReview('due_date_calculated')` بعد حساب موعد الولادة (نهاية دالة `calculate`، سطر ~100)

## الملفات المتأثرة
| ملف | تغيير |
|-----|--------|
| `src/pages/tools/SmartKickCounter.tsx` | إضافة import + استدعاء بعد حفظ الجلسة |
| `src/pages/tools/DueDateCalculator.tsx` | إضافة import + استدعاء بعد الحساب |

تغييرات بسيطة — سطرين إضافة في كل ملف.

