

## المشكلة الحقيقية

**`bubblewrap init` أمر تفاعلي بالكامل** ولا يمكن أتمتته بشكل موثوق عبر `stdin` piping في GitHub Actions. كل محاولات `printf`/`yes ""` تفشل لأن Bubblewrap يستخدم مكتبة `inquirer` التي تتوقع terminal حقيقي وليس pipe. هذا هو سبب `exit code 130` المتكرر.

## الحل النهائي

**استبدال `bubblewrap init` بـ `bubblewrap update`.**

لديك بالفعل ملف `twa-manifest.json` في المشروع. الأمر `bubblewrap update` يقرأ هذا الملف مباشرة ويولّد مشروع Android بدون أي أسئلة تفاعلية.

```text
الطريقة القديمة (فاشلة):
  manifest URL → bubblewrap init → أسئلة تفاعلية → يتعلق → exit 130

الطريقة الجديدة:
  twa-manifest.json (موجود) → bubblewrap update → لا أسئلة → gradlew جاهز
```

## التغييرات المطلوبة

### 1. تعديل `.github/workflows/android-twa-build.yml`

- **حذف خطوة "Initialize TWA project"** بالكامل (مع كل `printf`/`yes`/`timeout`)
- **إضافة خطوة "Generate TWA project"** تستخدم:
  ```bash
  bubblewrap update --skipVersionUpgrade --manifest="."
  ```
  هذا الأمر يقرأ `twa-manifest.json` من المجلد الحالي ويولّد مشروع Android بدون أي تفاعل
- **حذف خطوة "Restore TWA manifest overrides"** لأنها لم تعد ضرورية (الـ patch يتم قبل update)
- **إبقاء خطوة "Setup keystore"** كما هي مع التوليد التلقائي عند غياب `KEYSTORE_BASE64`
- **إبقاء خطوة "Patch TWA manifest"** قبل الـ update لحقن المسار والإصدار
- **إبقاء خطوة "Build Android TWA"** كما هي

### 2. ترتيب الخطوات النهائي

```text
1. Checkout
2. Setup Node / Java / SDK
3. Install Bubblewrap CLI
4. Configure Bubblewrap paths
5. Setup keystore (auto-generate if missing)
6. Patch TWA manifest (jq → signingKey + version)
7. Generate TWA project (bubblewrap update)  ← بدل init
8. Build Android TWA (bubblewrap build)
9. Upload artifacts
```

### 3. ما يجب فعله بعد أول بناء ناجح (مرة واحدة فقط)

1. من Logs البناء، انسخ **KEYSTORE_BASE64** واحفظه كـ GitHub Secret
2. من Logs البناء، انسخ **شهادة PEM**
3. في Google Play Console → **Setup** → **App integrity** → **Upload key** → **Request upload key reset**
4. ارفع ملف PEM هناك
5. انتظر موافقة Google (عادة 24-48 ساعة)
6. بعدها كل AAB جديد سيكون متوافقاً

---

**لماذا هذا الحل مختلف عن كل المحاولات السابقة:** كل الإصلاحات السابقة حاولت "خداع" `bubblewrap init` بتمرير إجابات عبر stdin. هذا الحل يتجاوز المشكلة كلياً باستخدام أمر مختلف (`update`) لا يطرح أسئلة أصلاً.

