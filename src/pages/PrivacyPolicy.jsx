import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <p className="text-indigo-800 text-sm leading-relaxed">
            AgenStack AI ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our SaaS chatbot platform. By using our Service, you agree to the practices described in this policy.
          </p>
        </section>

        <Section title="1. Information We Collect">
          <Subsection title="1.1 Information You Provide">
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li><strong>Account Information:</strong> Name, email address, company name, and password when you register.</li>
              <li><strong>Chat Data:</strong> Messages sent to and received from AI chatbots deployed on our platform.</li>
              <li><strong>Integration Credentials:</strong> OAuth tokens for connected services (Shopify, Klaviyo, Kustomer, Messenger). Stored encrypted.</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe. We do not store full card numbers.</li>
              <li><strong>Support Communications:</strong> Emails, tickets, and feedback you send us.</li>
            </ul>
          </Subsection>
          <Subsection title="1.2 Information Collected Automatically">
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li><strong>Usage Data:</strong> Pages visited, features used, session duration, click patterns.</li>
              <li><strong>Device & Browser Information:</strong> IP address, browser type, operating system, device identifiers.</li>
              <li><strong>Log Data:</strong> Server logs, error reports, API request logs (retained 90 days).</li>
              <li><strong>Cookies:</strong> Authentication session tokens, preference storage. See Section 8.</li>
            </ul>
          </Subsection>
          <Subsection title="1.3 Information from Third Parties">
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li>Data from integrations (Shopify orders, Klaviyo contacts, etc.) only when you authorize the connection.</li>
              <li>Aggregated analytics from service providers (non-personally identifiable).</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>Providing, operating, and improving the Service.</li>
            <li>Processing transactions and sending billing communications.</li>
            <li>Sending service updates, security alerts, and support responses.</li>
            <li>Analyzing usage patterns to improve product performance.</li>
            <li>Detecting, preventing, and investigating fraud or abuse.</li>
            <li>Complying with legal obligations and enforcing our Terms of Service.</li>
            <li>Training or improving AI models — <strong>only with your explicit opt-in consent</strong>.</li>
          </ul>
        </Section>

        <Section title="3. Data Retention">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Data Type</th>
                  <th className="px-4 py-3">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {[
                  ['Account data', 'While active + 30 days after deletion'],
                  ['Chat logs', '90 days by default (configurable)'],
                  ['OAuth tokens', 'Until revoked or account deleted'],
                  ['Server / API logs', '90 days'],
                  ['Audit logs', '1 year'],
                  ['Backup snapshots', '30 days'],
                  ['Billing records', '7 years (legal requirement)'],
                ].map(([type, period]) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{type}</td>
                    <td className="px-4 py-3">{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Data Security">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>AES-256-GCM encryption for all OAuth tokens and credentials at rest.</li>
            <li>TLS 1.2+ for all data in transit.</li>
            <li>Row-level security policies in Neon PostgreSQL database.</li>
            <li>bcrypt password hashing (minimum 10 rounds).</li>
            <li>Rate limiting and IP-based abuse prevention on all API endpoints.</li>
            <li>Sentry error tracking for rapid incident detection.</li>
            <li>Regular security reviews and dependency audits.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-3">No system is 100% secure. In the event of a data breach we will notify affected users within 72 hours as required by GDPR.</p>
        </Section>

        <Section title="5. Your Rights">
          <Subsection title="5.1 GDPR Rights (EU/UK Residents)">
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li><strong>Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Rectification:</strong> Correct inaccurate data.</li>
              <li><strong>Erasure ("Right to be forgotten"):</strong> Request deletion of your data.</li>
              <li><strong>Restriction:</strong> Limit how we process your data.</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format.</li>
              <li><strong>Object:</strong> Opt out of certain processing activities.</li>
              <li><strong>Withdraw Consent:</strong> At any time, without affecting past processing.</li>
            </ul>
          </Subsection>
          <Subsection title="5.2 CCPA Rights (California Residents)">
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li>Right to know what categories of personal information are collected and why.</li>
              <li>Right to delete personal information.</li>
              <li>Right to opt-out of the sale or sharing of personal information. <strong>We do not sell personal data.</strong></li>
              <li>Right to non-discrimination for exercising CCPA rights.</li>
            </ul>
          </Subsection>
          <p className="text-sm text-gray-600 mt-3">To exercise any right, email <a href="mailto:privacy@agenstack.ai" className="text-indigo-600 underline">privacy@agenstack.ai</a>. We will respond within 30 days (45 days for complex requests). We may require identity verification.</p>
        </Section>

        <Section title="6. Data Sharing">
          <p className="text-sm text-gray-600 mb-3">We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li><strong>Service Providers:</strong> Vercel (hosting), Neon (database), OpenAI (AI), Stripe (payments), Sentry (error tracking) — each under data processing agreements.</li>
            <li><strong>Your Integrations:</strong> Third-party platforms you explicitly connect (Shopify, Klaviyo, etc.).</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our legal rights.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger or acquisition. You will be notified in advance.</li>
          </ul>
          <p className="text-sm font-semibold text-gray-800 mt-3">We do NOT sell your personal data.</p>
        </Section>

        <Section title="7. International Data Transfers">
          <p className="text-sm text-gray-600">Your data may be processed in the United States and other countries. For EU residents, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission for international transfers. A full list of subprocessors is available upon request.</p>
        </Section>

        <Section title="8. Cookies">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li><strong>Session Cookies:</strong> Required for authentication. HttpOnly, Secure, SameSite=Strict.</li>
            <li><strong>Preference Cookies:</strong> Store UI settings (dark mode, language). Can be cleared in browser settings.</li>
            <li><strong>Analytics Cookies:</strong> Optional. Used to understand usage. You can opt out at any time.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-2">We do not use third-party advertising cookies.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p className="text-sm text-gray-600">Our Service is not directed to children under 13. We do not knowingly collect personal data from children under 13. If we become aware of such collection, we will delete it immediately. Contact us at <a href="mailto:privacy@agenstack.ai" className="text-indigo-600 underline">privacy@agenstack.ai</a> if you believe a child's data has been collected.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p className="text-sm text-gray-600">We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent in-app notice at least 30 days before they take effect. Continued use of the Service after changes become effective constitutes acceptance.</p>
        </Section>

        <Section title="11. Contact Us">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Privacy inquiries:</strong> <a href="mailto:privacy@agenstack.ai" className="text-indigo-600 underline">privacy@agenstack.ai</a></p>
            <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@agenstack.ai" className="text-indigo-600 underline">dpo@agenstack.ai</a></p>
            <p><strong>Mailing Address:</strong> AgenStack AI, [Address], [City, State, ZIP]</p>
          </div>
        </Section>

      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Subsection({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
      <p>© {new Date().getFullYear()} AgenStack AI. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <span className="cursor-pointer hover:text-gray-600">Terms of Service</span>
        <span>·</span>
        <span className="cursor-pointer hover:text-gray-600">Data Processing Agreement</span>
      </div>
    </div>
  );
}
