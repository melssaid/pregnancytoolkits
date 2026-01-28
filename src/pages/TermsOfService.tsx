import { Layout } from "@/components/Layout";

export default function TermsOfService() {
  return (
    <Layout title="Terms of Service" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground text-sm">Last updated: January 2026</p>
          
          <h2>Acceptance of Terms</h2>
          <p>
            By using Pregnancy Toolkits, you agree to be bound by these terms and conditions.
          </p>

          <h2>Medical Disclaimer</h2>
          <p className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <strong>Very Important:</strong> Pregnancy Toolkits is intended for informational 
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
        </div>
      </div>
    </Layout>
  );
}
