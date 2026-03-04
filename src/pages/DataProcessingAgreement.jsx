import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

export default function DataProcessingAgreement({ onBack }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

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
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Data Processing Agreement</h1>
              <p className="text-xs text-gray-500">Effective: {today} · GDPR Article 28 Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Parties */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Parties to This Agreement</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">Data Controller</p>
              <p className="text-sm font-semibold text-gray-900">You (the Customer)</p>
              <p className="text-xs text-gray-500 mt-1">The entity that has accepted the AgenStack AI Terms of Service and controls the personal data processed through the Service.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">Data Processor</p>
              <p className="text-sm font-semibold text-gray-900">AgenStack AI</p>
              <p className="text-xs text-gray-500 mt-1">The company that processes personal data on behalf of the Controller to provide the chatbot platform service.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">This DPA supplements and is incorporated into the AgenStack AI Terms of Service. In the event of conflict, this DPA takes precedence with respect to data protection obligations.</p>
        </section>

        <Section title="1. Definitions">
          <dl className="space-y-3 text-sm">
            {[
              ['Personal Data', 'Any information relating to an identified or identifiable natural person as defined under applicable Data Protection Law.'],
              ['Data Protection Law', 'All applicable privacy and data protection laws, including GDPR (EU) 2016/679, UK GDPR, and CCPA.'],
              ['Processing', 'Any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.'],
              ['Sub-processor', 'A third party engaged by AgenStack AI to Process Personal Data on behalf of the Controller.'],
              ['Data Subject', 'The natural person to whom Personal Data relates (e.g., your end users or customers).'],
              ['Standard Contractual Clauses (SCCs)', 'The clauses approved by the European Commission for transfers of Personal Data to third countries.'],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-3">
                <dt className="font-semibold text-gray-800 min-w-[180px]">{term}:</dt>
                <dd className="text-gray-600">{def}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="2. Scope & Subject Matter">
          <p className="text-sm text-gray-600">This DPA applies to all Processing of Personal Data carried out by AgenStack AI as a Data Processor on behalf of the Customer in connection with the provision of the Service, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm mt-2">
            <li>Chat messages and conversation data from end users.</li>
            <li>Contact information (name, email, phone) captured via chatbot forms.</li>
            <li>Behavioral data (session activity, engagement metrics).</li>
            <li>Integration data from connected third-party platforms (Shopify, Klaviyo, etc.).</li>
          </ul>
        </Section>

        <Section title="3. Controller Instructions">
          <p className="text-sm text-gray-600 mb-3">AgenStack AI shall Process Personal Data only on documented instructions from the Controller, except where required by applicable law. The Controller's instructions are set out in:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>These Terms of Service and this DPA.</li>
            <li>The platform configuration set by the Controller (bot settings, data retention rules, etc.).</li>
            <li>Any subsequent written instructions agreed by both parties.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">AgenStack AI will promptly notify the Controller if, in its opinion, an instruction violates applicable Data Protection Law.</p>
        </Section>

        <Section title="4. AgenStack AI's Obligations">
          <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
            <li>Process Personal Data only for purposes set out in this DPA and as instructed by the Controller.</li>
            <li>Ensure that personnel authorized to Process Personal Data are bound by confidentiality obligations.</li>
            <li>Implement appropriate technical and organizational security measures (see Section 5).</li>
            <li>Not engage Sub-processors without the Controller's prior written authorization (Section 7).</li>
            <li>Assist the Controller in responding to Data Subject requests (Section 6).</li>
            <li>Notify the Controller without undue delay (and within 72 hours where feasible) of any Personal Data breach.</li>
            <li>Delete or return all Personal Data upon termination of the Service, at the Controller's choice.</li>
            <li>Make available all information necessary to demonstrate compliance with this DPA.</li>
          </ul>
        </Section>

        <Section title="5. Security Measures">
          <p className="text-sm text-gray-600 mb-3">AgenStack AI maintains the following technical and organizational measures (TOMs):</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Measures Implemented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {[
                  ['Encryption at Rest', 'AES-256-GCM for all OAuth tokens and credentials; bcrypt (10+ rounds) for passwords'],
                  ['Encryption in Transit', 'TLS 1.2+ enforced on all connections; HSTS enabled'],
                  ['Access Control', 'Role-based access control (RBAC); multi-tenant data isolation via row-level security'],
                  ['Authentication', 'Secure session tokens; rate-limited login; optional MFA'],
                  ['Monitoring', 'Sentry error tracking; API rate limiting; security headers (CSP, X-Frame-Options, etc.)'],
                  ['Vulnerability Management', 'Automated dependency audits; regular security reviews'],
                  ['Data Minimization', 'Configurable retention periods; data purge on account deletion'],
                  ['Incident Response', 'Documented IR plan; 72-hour breach notification target'],
                ].map(([cat, measure]) => (
                  <tr key={cat} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{cat}</td>
                    <td className="px-4 py-3">{measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="6. Data Subject Rights">
          <p className="text-sm text-gray-600 mb-3">Taking into account the nature of the Processing, AgenStack AI will assist the Controller in fulfilling its obligations to respond to Data Subject requests, including rights of access, rectification, erasure, restriction, portability, and objection.</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>The Controller is responsible for communicating with Data Subjects and determining whether a request is valid.</li>
            <li>AgenStack AI will provide technical assistance (e.g., data export, deletion) within 5 business days of a validated Controller request.</li>
            <li>Where AgenStack AI receives a Data Subject request directly, it will promptly forward it to the Controller without responding unless required by law.</li>
          </ul>
        </Section>

        <Section title="7. Sub-processors">
          <p className="text-sm text-gray-600 mb-3">The Controller provides general authorization for AgenStack AI to engage the following Sub-processors. AgenStack AI will notify the Controller of any intended changes (additions or replacements) with at least 30 days' notice, giving the Controller the opportunity to object.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Sub-processor</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {[
                  ['Vercel Inc.', 'Application hosting & serverless functions', 'USA'],
                  ['Neon Inc.', 'PostgreSQL database hosting', 'USA'],
                  ['OpenAI Inc.', 'AI language model API', 'USA'],
                  ['Stripe Inc.', 'Payment processing', 'USA'],
                  ['Sentry Inc.', 'Error monitoring & alerting', 'USA'],
                ].map(([sp, purpose, loc]) => (
                  <tr key={sp} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sp}</td>
                    <td className="px-4 py-3">{purpose}</td>
                    <td className="px-4 py-3">{loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">AgenStack AI requires all Sub-processors to enter into data processing agreements providing equivalent data protection guarantees.</p>
        </Section>

        <Section title="8. International Transfers">
          <p className="text-sm text-gray-600 mb-2">Where Personal Data is transferred from the European Economic Area (EEA), Switzerland, or the UK to a country not recognized as providing adequate data protection, AgenStack AI will ensure appropriate safeguards are in place, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission (Module 2: Controller-to-Processor).</li>
            <li>UK International Data Transfer Agreements (IDTAs) for UK transfers.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">The SCCs are hereby incorporated by reference into this DPA. A signed copy is available upon request.</p>
        </Section>

        <Section title="9. Data Breach Notification">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>AgenStack AI will notify the Controller of a confirmed Personal Data breach without undue delay and within 72 hours of becoming aware, where feasible.</li>
            <li>The notification will include: nature of the breach, categories and approximate number of Data Subjects affected, categories and approximate number of records affected, likely consequences, and measures taken or proposed.</li>
            <li>The Controller is responsible for notifying supervisory authorities and Data Subjects as required by applicable Data Protection Law.</li>
          </ul>
        </Section>

        <Section title="10. Audits & Compliance">
          <p className="text-sm text-gray-600 mb-2">AgenStack AI will:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>Make available all information reasonably necessary to demonstrate compliance with this DPA.</li>
            <li>Allow and contribute to audits and inspections conducted by the Controller or a mandated third-party auditor, with reasonable prior notice (minimum 30 days) and subject to confidentiality obligations.</li>
            <li>Audits shall not materially disrupt AgenStack AI's business operations and shall occur no more than once per calendar year unless required by a supervisory authority.</li>
          </ul>
        </Section>

        <Section title="11. Term & Termination">
          <p className="text-sm text-gray-600">This DPA remains in effect for the duration of the Service Agreement. Upon termination, AgenStack AI will, at the Controller's election, either return all Personal Data in a portable format or securely delete it within 30 days, and provide written certification of deletion upon request. Backup data will be purged within the standard backup retention cycle (30 days).</p>
        </Section>

        <Section title="12. Contact & Execution">
          <div className="text-sm text-gray-600 space-y-2">
            <p>For DPA-related questions or to request a countersigned copy:</p>
            <p><strong>Email:</strong> <a href="mailto:dpo@agenstack.ai" className="text-indigo-600 underline">dpo@agenstack.ai</a></p>
            <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@agenstack.ai" className="text-indigo-600 underline">dpo@agenstack.ai</a></p>
            <p className="text-xs text-gray-500 pt-2">By continuing to use the Service, you (the Controller) agree to this DPA. If you require a countersigned physical or PDF copy for compliance documentation, please contact us at the address above.</p>
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

function Footer() {
  return (
    <div className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
      <p>© {new Date().getFullYear()} AgenStack AI. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <span className="cursor-pointer hover:text-gray-600">Privacy Policy</span>
        <span>·</span>
        <span className="cursor-pointer hover:text-gray-600">Terms of Service</span>
      </div>
    </div>
  );
}
