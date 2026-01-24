import { Layout } from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout title="Privacy Policy" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to Pregnancy Toolkits ("we," "our," or "us"). We respect your privacy and are 
            committed to protecting your personal data. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our mobile application and website.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information Stored Locally</h3>
          <p>
            Pregnancy Toolkits operates primarily on your device. The following data is stored 
            locally using browser local storage technology:
          </p>
          <ul>
            <li>Pregnancy tracking data (due dates, cycle information)</li>
            <li>Health measurements (weight, kick counts, etc.)</li>
            <li>Personal preferences and settings</li>
            <li>Diary entries and notes</li>
          </ul>
          <p><strong>This data never leaves your device and is not transmitted to our servers.</strong></p>

          <h3>2.2 Analytics Data</h3>
          <p>We collect anonymous usage analytics to improve the app experience, including:</p>
          <ul>
            <li>Which tools and features are used most frequently</li>
            <li>General app navigation patterns</li>
            <li>Device type and operating system (anonymized)</li>
            <li>App performance metrics</li>
          </ul>
          <p><strong>No personal health data or identifiable information is collected through analytics.</strong></p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve and optimize app functionality</li>
            <li>Understand user preferences and usage patterns</li>
            <li>Develop new features and tools</li>
            <li>Ensure technical functionality and security</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We prioritize the security of your data. Since most data is stored locally on your device:
          </p>
          <ul>
            <li>Your data security depends on your device's security measures</li>
            <li>We recommend using screen lock and strong passwords</li>
            <li>We do not have access to your locally stored health data</li>
            <li>Any data transmitted to our servers is encrypted using industry-standard protocols</li>
          </ul>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:</p>
          <ul>
            <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal requests</li>
            <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>6. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> View all data stored locally on your device</li>
            <li><strong>Delete:</strong> Clear your data at any time through browser settings or app settings</li>
            <li><strong>Opt-out:</strong> Disable analytics collection in app settings</li>
            <li><strong>No Account Required:</strong> Use the app without creating an account</li>
          </ul>

          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 13. We do not knowingly 
            collect personal information from children under 13. If you believe we have collected 
            information from a child under 13, please contact us immediately.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            Our app may contain links to third-party websites or services. We are not responsible 
            for the privacy practices of these third parties. We encourage you to read the privacy 
            policies of any third-party services you access.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date. 
            You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, 
            please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:M.melssaid@gmail.com" className="text-primary hover:underline">M.melssaid@gmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+97333775705" className="text-primary hover:underline">+973 3377 5705</a></li>
          </ul>

          <h2>11. Consent</h2>
          <p>
            By using Pregnancy Toolkits, you consent to this Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </Layout>
  );
}
