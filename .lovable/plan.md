

# تقرير فحص شامل: الترابط والمشاكل المكتشفة

---

## المشاكل المكتشفة

### 1. فئة "categories.labor" فارغة — لا تحتوي أي أداة
- مسجلة في `categoryKeys` وفي `journeyCategoryMap.pregnant`
- **لا توجد أداة واحدة** تستخدم `categoryKey: "categories.labor"`
- أداة `ai-birth-plan` موضوعة تحت `categories.pregnancy` بدلاً من `categories.labor`
- **التأثير**: الفئة تظهر كتصنيف فارغ (أو لا تظهر لأنه لا أدوات فيها)
- **الحل**: حذف `categories.labor` من `categoryKeys` و`journeyCategoryMap` بما أن أدوات الولادة موزعة على pregnancy/preparation

### 2. ثلاث أدوات لها Routes لكن محذوفة من `toolsData`
هذه الأدوات لها صفحات كاملة وroutes في `AnimatedRoutes.tsx` لكنها **غير مسجلة** في `toolsData`:
- **ai-craving-alternatives** — صفحة موجودة، route موجود، لكن لا تظهر في الصفحة الرئيسية
- **smart-grocery-list** — صفحة 694 سطر كاملة، route موجود، لكن لا تظهر
- **ai-back-pain-relief** — صفحة موجودة، route موجود، لكن لا تظهر

**التأثير**: 
- يمكن الوصول لها فقط عبر Hub Navigation tabs (ToolHubNav)
- مسجلة في `PREMIUM_ONLY_TOOL_IDS` لكن بدون تسجيل في toolsData لا تعمل بشكل صحيح مع paywall
- `RelatedTools` لا تعرف بوجودها (لا تظهر كاقتراحات)
- **الحل**: إضافتها إلى `toolsData` بتصنيفاتها الصحيحة (nutrition + wellness)

### 3. عدم تطابق toolRelationships مع IDs الفعلية
- `toolRelationships` يستخدم `"ai-craving-alternatives"` و`"smart-grocery-list"` و`"ai-back-pain-relief"` — لكنها غير مسجلة في `toolsData`
- **التأثير**: `getRelatedTools()` لا ترجع هذه الأدوات كاقتراحات
- **الحل**: بعد إضافتها لـ `toolsData`، تضاف أيضاً لـ `toolRelationships`

### 4. `useSubscriptionStatus` يشير لـ IDs غير موجودة في toolsData
- `ai-craving-alternatives` مسجلة في `PREMIUM_ONLY_TOOL_IDS` لكن غير موجودة في `toolsData`
- **التأثير**: فحص Premium لا يعمل بشكل متسق

### 5. Route test (`routes.test.ts`) يتوقع أدوات غير مسجلة في toolsData
- الاختبار يتحقق أن كل tool href له route، لكنه يسرد routes مثل `/tools/ai-craving-alternatives` و `/tools/smart-grocery-list` و `/tools/ai-back-pain-relief` التي ليست في toolsData
- **الحل**: بعد إضافة الأدوات لـ toolsData، سيتطابق الاختبار

### 6. `categoryStyles` في Index.tsx لا يحتوي `categories.labor`
- لا يوجد تنسيق (styling) لـ `categories.labor` — إذا ظهرت ستكون بدون لون
- **الحل**: حذف الفئة نهائياً (انظر النقطة 1)

---

## ما هو سليم ويعمل بشكل صحيح

- **Onboarding**: يعمل بشكل كامل — 5 خطوات (لغة، رحلة، صحة، أهداف، خصوصية)
- **Dashboard ↔ Tools**: جميع الروابط في QuickActionsBar وDailyPriorities وFetalMovementCard تشير لمسارات صحيحة
- **BottomNavigation**: AI Tools panel يعرض كل أداة hasAI من toolsData — يعمل بشكل صحيح
- **Hub Navigation**: NUTRITION_HUB_TABS و FITNESS_HUB_TABS تربط الأدوات المتعلقة — تعمل لكن تشير لأدوات غير مسجلة في toolsData
- **Legacy Redirects**: جميعها سليمة (13 redirect)
- **الترجمات**: المفاتيح الأساسية لـ `tools.*` و`toolsInternal.*` موجودة في الـ 7 لغات
- **Prerender SEO metadata**: يغطي جميع الأدوات بما فيها الثلاث المحذوفة

---

## خطة الإصلاح

### الخطوة 1: إضافة الأدوات الثلاث المفقودة إلى `toolsData`
في `src/lib/tools-data.ts`:
- إضافة `ai-craving-alternatives` تحت `categories.nutrition`
- إضافة `smart-grocery-list` تحت `categories.nutrition`  
- إضافة `ai-back-pain-relief` تحت `categories.wellness`

### الخطوة 2: حذف فئة `categories.labor` الفارغة
- حذفها من `categoryKeys`
- حذفها من `journeyCategoryMap.pregnant`

### الخطوة 3: تحديث `toolRelationships`
- إضافة العلاقات للأدوات الثلاث الجديدة

### الخطوة 4: إضافة style لـ `categories.labor` أو حذفها
- بما أنها ستُحذف، لا حاجة لإضافة style

---

**الحجم التقديري**: تعديل ملف واحد فقط (`tools-data.ts`) — حوالي 15 سطر إضافة + 2 سطر حذف

