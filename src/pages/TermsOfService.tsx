import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Layout title={isArabic ? "شروط الاستخدام" : "Terms of Service"} showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          {isArabic ? (
            <>
              <p className="text-muted-foreground text-sm">آخر تحديث: يناير 2024</p>
              
              <h2>القبول بالشروط</h2>
              <p>
                باستخدامك لتطبيق ويل ماما، فإنك توافقين على الالتزام بهذه الشروط والأحكام.
              </p>

              <h2>إخلاء المسؤولية الطبية</h2>
              <p className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <strong>هام جداً:</strong> تطبيق ويل ماما مخصص للأغراض المعلوماتية والتعليمية فقط. 
                هذا التطبيق:
              </p>
              <ul>
                <li>لا يقدم نصائح طبية أو تشخيصات أو علاجات</li>
                <li>لا يحل محل استشارة الطبيب أو مقدم الرعاية الصحية</li>
                <li>لا يجب استخدامه لاتخاذ قرارات طبية طارئة</li>
              </ul>
              <p>
                <strong>استشيري دائماً طبيبك أو مقدم الرعاية الصحية المؤهل</strong> 
                بخصوص أي أسئلة طبية أو صحية.
              </p>

              <h2>استخدام التطبيق</h2>
              <p>أنتِ توافقين على:</p>
              <ul>
                <li>استخدام التطبيق للأغراض الشخصية وغير التجارية فقط</li>
                <li>عدم الاعتماد على نتائج التطبيق كبديل للرعاية الطبية</li>
                <li>طلب الرعاية الطبية الفورية في حالات الطوارئ</li>
              </ul>

              <h2>دقة المعلومات</h2>
              <p>
                بينما نسعى لتوفير معلومات دقيقة ومحدثة، لا نضمن دقة أو اكتمال 
                أي معلومات في التطبيق. الحسابات والتقديرات هي تقريبية وقد تختلف 
                عن الواقع الفعلي.
              </p>

              <h2>حدود المسؤولية</h2>
              <p>
                لن نكون مسؤولين عن أي أضرار ناتجة عن استخدام أو عدم القدرة على 
                استخدام التطبيق، بما في ذلك أي قرارات صحية تُتخذ بناءً على 
                المعلومات المقدمة.
              </p>

              <h2>التعديلات</h2>
              <p>
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. 
                استمرار استخدامك للتطبيق يعني موافقتك على الشروط المعدلة.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">Last updated: January 2024</p>
              
              <h2>Acceptance of Terms</h2>
              <p>
                By using WellMama, you agree to be bound by these terms and conditions.
              </p>

              <h2>Medical Disclaimer</h2>
              <p className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <strong>Very Important:</strong> WellMama is intended for informational 
                and educational purposes only. This application:
              </p>
              <ul>
                <li>Does NOT provide medical advice, diagnoses, or treatments</li>
                <li>Does NOT replace consultation with a doctor or healthcare provider</li>
                <li>Should NOT be used for emergency medical decisions</li>
              </ul>
              <p>
                <strong>Always consult your doctor or qualified healthcare provider</strong> 
                regarding any medical or health questions.
              </p>

              <h2>Use of Application</h2>
              <p>You agree to:</p>
              <ul>
                <li>Use the app for personal, non-commercial purposes only</li>
                <li>Not rely on app results as a substitute for medical care</li>
                <li>Seek immediate medical care in emergency situations</li>
              </ul>

              <h2>Accuracy of Information</h2>
              <p>
                While we strive to provide accurate and up-to-date information, 
                we do not guarantee the accuracy or completeness of any information 
                in the app. Calculations and estimates are approximate and may differ 
                from actual reality.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                We will not be liable for any damages resulting from the use or 
                inability to use the app, including any health decisions made based 
                on the information provided.
              </p>

              <h2>Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. 
                Your continued use of the app constitutes acceptance of the modified terms.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
