export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 mb-8 leading-relaxed">
            At Job Email Generator, we take your privacy seriously. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our service. Please read this privacy
            policy carefully. If you do not agree with the terms of this privacy
            policy, please do not access the site.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We may collect information about you in a variety of ways. The
              information we may collect via the Service includes:
            </p>

            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Personal Data
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Personally identifiable information, such as your name, email
                  address, and profile picture, that you voluntarily give to us
                  when you choose to authenticate with Google. This information
                  is collected when you sign in to use our Service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Usage Data
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Information our servers automatically collect when you access
                  the Service, such as your IP address, browser type, operating
                  system, access times, and the pages you have viewed directly
                  before and after accessing the Service. We also collect
                  information about how you use our service, including email
                  drafts, job descriptions, and resume information you provide.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Authentication Data
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  OAuth access tokens required to send emails on your behalf
                  through Gmail or Outlook. These tokens are securely stored and
                  encrypted. We do not store your email credentials or have
                  access to your email account beyond the specific permissions
                  you explicitly grant through the OAuth consent screen.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Use of Your Information
            </h2>
            <p className="text-gray-700 mb-3 leading-relaxed">
              Having accurate information about you permits us to provide you
              with a smooth, efficient, and customized experience. Specifically,
              we may use information collected about you via the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
              <li>Create and manage your account</li>
              <li>
                Generate personalized job application emails based on your input
              </li>
              <li>
                Send emails on your behalf through your connected email account
                (Gmail or Outlook)
              </li>
              <li>
                Process your transactions and send you related information
              </li>
              <li>Improve and optimize our service and user experience</li>
              <li>
                Monitor and analyze usage and trends to improve your experience
                with the Service
              </li>
              <li>Respond to product and customer service requests</li>
              <li>
                Communicate with you about service updates, security alerts, and
                administrative messages
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Disclosure of Your Information
            </h2>
            <p className="text-gray-700 mb-3 leading-relaxed">
              We may share information we have collected about you in certain
              situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the
                release of information about you is necessary to respond to
                legal process, to investigate or remedy potential violations of
                our policies, or to protect the rights, property, and safety of
                others, we may share your information as permitted or required
                by any applicable law, rule, or regulation.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share
                your information with third parties that perform services for us
                or on our behalf, including payment processing, data analysis,
                email delivery, hosting services, customer service, and
                marketing assistance.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Security of Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse. Your authentication tokens are securely stored and
              encrypted using industry-standard encryption methods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-gray-700 mb-3 leading-relaxed">
              Our Service integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
              <li>
                <strong>Google OAuth:</strong> For secure user authentication
                and account management
              </li>
              <li>
                <strong>Google Gmail API:</strong> To send emails on your behalf
                when you explicitly authorize this action
              </li>
              <li>
                <strong>Microsoft Outlook API:</strong> To send emails via
                Outlook when you explicitly authorize this action
              </li>
            </ul>
            <p className="text-gray-700 mt-3 leading-relaxed">
              These third-party services have their own privacy policies. We
              encourage you to review their privacy policies and terms of
              service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Your Privacy Rights
            </h2>
            <p className="text-gray-700 mb-3 leading-relaxed">
              Depending on your location and applicable laws, you may have the
              following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
              <li>
                <strong>Right to Access:</strong> You have the right to request
                access to the personal information we hold about you
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to
                correct inaccurate or incomplete personal data
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request
                deletion of your personal data and account information
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> You can revoke
                access to your email account at any time through your Google or
                Microsoft account settings
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You have the right
                to request a copy of your data in a structured, commonly used
                format
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We will retain your personal information only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use your information to the extent necessary to comply
              with our legal obligations, resolve disputes, and enforce our
              policies. You can request deletion of your account and all
              associated data at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Policy for Children
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not knowingly solicit information from or market to children
              under the age of 13. If we learn that we have collected personal
              information from a child under age 13 without verification of
              parental consent, we will delete that information as quickly as
              possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time in order to
              reflect changes to our practices or for other operational, legal,
              or regulatory reasons. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last
              updated" date at the top of this Privacy Policy. You are advised
              to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions or comments about this Privacy Policy,
              please contact us through our support channels or by email.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
