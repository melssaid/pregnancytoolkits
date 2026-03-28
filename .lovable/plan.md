

## المشكلة

الخطأ `EISDIR: illegal operation on a directory, read` سببه أن `--manifest="."` يمرر مجلد بدل ملف. أمر `bubblewrap update` لا يقبل `--manifest` بنفس طريقة `init`.

## الحل

تغيير سطر 184 في `.github/workflows/android-twa-build.yml`:

**من:**
```bash
bubblewrap update --skipVersionUpgrade --manifest="."
```

**إلى:**
```bash
bubblewrap update --skipVersionUpgrade
```

`bubblewrap update` يقرأ `twa-manifest.json` تلقائياً من المجلد الحالي بدون الحاجة لـ `--manifest`. إزالة هذا الخيار يحل المشكلة.

## التغيير

ملف واحد فقط: `.github/workflows/android-twa-build.yml` سطر 184.

