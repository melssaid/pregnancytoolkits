
# خطة تحديث إطار الأيقونات المركزي

## الهدف
إنشاء إطار دائري احترافي وجذاب للأيقونات المخصصة في منتصف صفحات الأدوات، بحجم أكبر ومظهر متناسق مع الهوية البصرية للتطبيق.

---

## التغييرات المطلوبة

### 1. تحديث `ToolFrame.tsx`

**التعديلات على قسم الأيقونة المركزية:**

| العنصر | القيمة الحالية | القيمة الجديدة |
|--------|----------------|----------------|
| شكل الإطار | مربع `rounded-xl` | دائري `rounded-full` |
| حجم الأيقونة | `48px` | `64px` |
| حجم الحاوية | صغير `p-2` | أكبر `p-5` |
| الخلفية | `bg-white` فقط | تدرج لوني متناسق مع المزاج |
| الظل | بدون | `shadow-xl` مع توهج خفيف |
| الحدود | بدون | حدود بيضاء رقيقة |

**التصميم الجديد للإطار الدائري:**
- خلفية بيضاء مع تدرج خفيف من لون المزاج
- حدود بيضاء سميكة للتمييز
- ظل ناعم لإعطاء عمق
- توهج (glow) بلون المزاج المختار
- حركة دخول احترافية بتأثير spring

---

## التفاصيل التقنية

```text
┌─────────────────────────────────────────┐
│           صفحة الأداة                    │
├─────────────────────────────────────────┤
│                                         │
│              ╭──────────╮               │
│             ╱            ╲              │
│            │   🤰 64px   │   ← إطار     │
│            │   أيقونة   │      دائري   │
│             ╲            ╱      كبير    │
│              ╰──────────╯               │
│                                         │
│         محتوى الأداة أسفل الأيقونة      │
│                                         │
└─────────────────────────────────────────┘
```

**الكود المقترح للإطار الدائري:**
```tsx
{/* Centered Icon with Circular Frame */}
{(customIcon || Icon) && (
  <motion.div 
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
    className="flex justify-center pt-8 pb-4"
  >
    <div className={`
      relative p-5 rounded-full 
      bg-white 
      shadow-xl shadow-primary/10
      ring-4 ring-white
      ${styles.iconBg.replace('bg-gradient-to-br', 'before:bg-gradient-to-br')}
    `}>
      {/* Glow Effect */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-xl opacity-50`} />
      
      {/* Icon Container */}
      <div className="relative z-10">
        {customIcon ? (
          <PregnancyIcon name={customIcon} size={64} />
        ) : Icon && (
          <Icon className="h-16 w-16 text-primary" strokeWidth={1.5} />
        )}
      </div>
    </div>
  </motion.div>
)}
```

---

## ملخص التغييرات

1. **ملف واحد فقط:** `src/components/ToolFrame.tsx`
2. **إطار دائري:** باستخدام `rounded-full` بدلاً من `rounded-xl`
3. **حجم أكبر:** الأيقونة `64px` والحاوية `p-5`
4. **خلفية بيضاء صلبة:** مع ظل وتوهج متناسق
5. **حدود بيضاء:** باستخدام `ring-4 ring-white`
6. **تأثيرات بصرية:** ظل ناعم وتوهج خفيف بلون المزاج
