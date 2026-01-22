import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Layout title={isArabic ? "سياسة الخصوصية" : "Privacy Policy"} showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          {isArabic ? (
            <>
              <p className="text-muted-foreground text-sm">آخر تحديث: يناير 2024</p>
              
              <h2>مقدمة</h2>
              <p>
                مرحباً بكِ في ويل ماما. نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
                توضح سياسة الخصوصية هذه كيفية جمع واستخدام معلوماتك.
              </p>

              <h2>البيانات التي نجمعها</h2>
              <p>تطبيق ويل ماما يعمل بالكامل على جهازك. نحن:</p>
              <ul>
                <li><strong>لا نجمع</strong> أي معلومات صحية شخصية</li>
                <li><strong>لا نرسل</strong> بياناتك إلى أي خوادم خارجية</li>
                <li><strong>لا نشارك</strong> أي معلومات مع أطراف ثالثة</li>
              </ul>
              <p>
                جميع البيانات التي تدخلينها (مثل تتبع الدورة، عداد الركلات، إلخ) 
                يتم تخزينها محلياً على جهازك فقط باستخدام تقنية التخزين المحلي للمتصفح.
              </p>

              <h2>التخزين المحلي</h2>
              <p>
                نستخدم التخزين المحلي للمتصفح لحفظ تفضيلاتك وبيانات التتبع. 
                هذه البيانات موجودة فقط على جهازك ويمكنك مسحها في أي وقت من خلال 
                إعدادات المتصفح.
              </p>

              <h2>أمان البيانات</h2>
              <p>
                بما أن جميع البيانات مخزنة محلياً على جهازك، فإن أمان بياناتك 
                يعتمد على أمان جهازك. ننصح باستخدام قفل الشاشة وكلمات مرور قوية.
              </p>

              <h2>حقوقك</h2>
              <p>لديك الحق في:</p>
              <ul>
                <li>الوصول إلى بياناتك المخزنة محلياً</li>
                <li>حذف بياناتك في أي وقت</li>
                <li>استخدام التطبيق دون إنشاء حساب</li>
              </ul>

              <h2>تغييرات على هذه السياسة</h2>
              <p>
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. 
                سننشر أي تغييرات على هذه الصفحة.
              </p>

              <h2>تواصل معنا</h2>
              <p>
                إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، 
                يرجى التواصل معنا عبر التطبيق.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">Last updated: January 2024</p>
              
              <h2>Introduction</h2>
              <p>
                Welcome to WellMama. We respect your privacy and are committed to protecting 
                your personal data. This privacy policy explains how we collect and use your information.
              </p>

              <h2>Data We Collect</h2>
              <p>WellMama operates entirely on your device. We:</p>
              <ul>
                <li><strong>Do NOT collect</strong> any personal health information</li>
                <li><strong>Do NOT send</strong> your data to any external servers</li>
                <li><strong>Do NOT share</strong> any information with third parties</li>
              </ul>
              <p>
                All data you enter (such as cycle tracking, kick counts, etc.) is stored 
                locally on your device only using browser local storage technology.
              </p>

              <h2>Local Storage</h2>
              <p>
                We use browser local storage to save your preferences and tracking data. 
                This data exists only on your device and you can clear it at any time 
                through your browser settings.
              </p>

              <h2>Data Security</h2>
              <p>
                Since all data is stored locally on your device, your data security 
                depends on your device's security. We recommend using screen lock 
                and strong passwords.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your locally stored data</li>
                <li>Delete your data at any time</li>
                <li>Use the app without creating an account</li>
              </ul>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. 
                We will post any changes on this page.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this privacy policy, 
                please contact us through the app.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
