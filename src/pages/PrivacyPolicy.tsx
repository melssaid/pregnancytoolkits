import { Layout } from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout title="Privacy Policy" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground text-sm">Last updated: January 2024</p>
          
          <h2>Introduction</h2>
          <p>
            Welcome to Pregnancy Toolkits. We respect your privacy and are committed to protecting 
            your personal data. This privacy policy explains how we collect and use your information.
          </p>

          <h2>Data We Collect</h2>
          <p>Pregnancy Toolkits operates entirely on your device. We:</p>
          <ul>
            <li><strong>Do NOT collect</strong> any personal health information</li>
            <li><strong>Do NOT send</strong> your data to any external servers</li>
            <li><strong>Do NOT share</strong> any information with third parties</li>
          </ul>
          <p>
            All data you enter (such as cycle tracking, kick counts, etc.) is stored 
            locally on your device only using browser local storage technology.
          </p>

          <h2>Anonymous Analytics</h2>
          <p>
            We collect anonymous usage analytics to improve the app experience. This includes:
          </p>
          <ul>
            <li>Which tools are used most frequently</li>
            <li>General app navigation patterns</li>
            <li>No personal or health data is ever collected</li>
          </ul>

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
        </div>
      </div>
    </Layout>
  );
}
