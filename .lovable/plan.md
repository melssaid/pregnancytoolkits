

## المشكلة

`bubblewrap update` يحاول تحميل أيقونات التطبيق من الروابط المحددة في `twa-manifest.json`:
- `https://pregnancytoolkits.lovable.app/icons/icon-512x512.png` → **404 Not Found**

هذه الملفات غير موجودة في `public/icons/`. المجلد يحتوي فقط على أيقونات الأدوات، وليس أيقونات التطبيق بالأحجام المطلوبة (72, 96, 128, 144, 152, 192, 384, 512).

## الحل

### 1. إنشاء أيقونات التطبيق بجميع الأحجام المطلوبة

يجب إنشاء الملفات التالية في `public/icons/`:

```text
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

**السؤال**: هل لديك أيقونة التطبيق ال