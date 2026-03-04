import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService({ onBack }) {
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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Terms of Service</h1>
              <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <section className="bg-amber-50 border border-amber-100 rounded-xl p-6">
          <p className="text-amber-800 text-sm leading-relaxed">
            Please read these Terms of Service carefully before using AgenStack AI. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <Section title="1. Acceptance of Terms">
          <p className="text-sm text-gray-600">These Terms of Service ("Terms") form a legally binding agreement between you (or the entity you represent) and AgenStack AI ("Company," "we," "us," "our") governing your access to and use of the agenstack.ai platform and associated services ("Service"). By creating an account or using the Service, you confirm that you are at least 18 years old and have the authority to enter into these Terms on behalf of yourself or your organization.</p>
        </Section>

        <Section title="2. Description of Service">
          <p className="text-sm text-gray-600">AgenStack AI provides a multi-tenant SaaS chatbot platform that enables businesses to deploy AI-powered customer service chatbots with e-commerce and CRM integrations. The Service includes bot builder interfaces, live chat, analytics, proactive engagement tools, and third-party integrations (Shopify, Klaviyo, Kustomer, Messenger, and others).</p>
        </Section>

        <Section title="3. Account Registration & Security">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>You must provide accurate, complete, and current information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</li>
            <li>You must notify us immediately at <a href="mailto:security@agenstack.ai" className="text-indigo-600 underline">security@agenstack.ai</a> of any unauthorized use of your account.</li>
            <li>We reserve the right to suspend accounts showing signs of compromise or abuse.</li>
            <li>One organization per account unless explicitly authorized by us in writing.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable Use Policy">
          <p className="text-sm text-gray-600 mb-3">You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>Violate any applicable local, state, national, or international law or regulation.</li>
            <li>Transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of another's privacy.</li>
            <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation.</li>
            <li>Introduce malware, viruses, or any other harmful code.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or related systems.</li>
            <li>Use the Service to send unsolicited messages (spam).</li>
            <li>Reverse engineer, decompile, or extract source code from the Service.</li>
            <li>Use the Service to train competing AI models without written permission.</li>
            <li>Exceed API rate limits or attempt to circumvent usage restrictions.</li>
            <li>Engage in any activity that disrupts, degrades, or interferes with the Service.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">Violations may result in immediate account suspension or termination without notice or refund.</p>
        </Section>

        <Section title="5. AI-Generated Content Disclaimer">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Important — Please Read</p>
            <ul className="list-disc pl-5 space-y-1 text-red-700 text-sm">
              <li>Chatbots powered by our Service use AI and may generate inaccurate, incomplete, or misleading information ("hallucinations").</li>
              <li>AI responses are <strong>not</strong> professional legal, medical, financial, or other expert advice.</li>
              <li>You are solely responsible for verifying AI-generated content before acting on it.</li>
              <li>We are not liable for decisions made based on AI-generated content.</li>
              <li>You are responsible for ensuring your chatbot deployments comply with applicable laws in your jurisdiction.</li>
            </ul>
          </div>
        </Section>

        <Section title="6. Intellectual Property">
          <p className="text-sm text-gray-600 mb-2"><strong>Our IP:</strong> The Service, including all software, design, code, text, graphics, logos, and trademarks, is owned by AgenStack AI and protected by intellectual property laws. No rights are granted except the limited license described in Section 7.</p>
          <p className="text-sm text-gray-600 mb-2"><strong>Your Content:</strong> You retain all rights to content you create using the Service (bot configurations, conversation data, etc.). By using the Service, you grant us a limited, non-exclusive, royalty-free license to process your content solely to provide the Service.</p>
          <p className="text-sm text-gray-600"><strong>Feedback:</strong> Any feedback, suggestions, or ideas you provide may be used by us without obligation or compensation to you.</p>
        </Section>

        <Section title="7. License to Use the Service">
          <p className="text-sm text-gray-600">Subject to these Terms and timely payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes during your subscription term. You may not sublicense, resell, or commercially exploit the Service without written permission.</p>
        </Section>

        <Section title="8. Payment & Billing">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>Subscription fees are billed in advance on a monthly or annual basis.</li>
            <li>All fees are non-refundable except as expressly stated in these Terms or required by law.</li>
            <li>We reserve the right to change pricing with 30 days' prior notice.</li>
            <li>Overdue payments may result in suspension of the Service.</li>
            <li>Taxes are your responsibility; prices shown are exclusive of applicable taxes.</li>
          </ul>
        </Section>

        <Section title="9. Confidentiality">
          <p className="text-sm text-gray-600">Each party agrees to protect the other's Confidential Information using the same degree of care it uses for its own confidential information (at least reasonable care), and not to disclose it to third parties without prior written consent, except as required by law.</p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p className="text-sm text-gray-600">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR THAT AI-GENERATED CONTENT WILL BE ACCURATE OR RELIABLE.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p className="text-sm text-gray-600 mb-2">TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100 USD.</li>
            <li>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.</p>
        </Section>

        <Section title="12. Indemnification">
          <p className="text-sm text-gray-600">You agree to indemnify, defend, and hold harmless AgenStack AI and its officers, directors, employees, and agents from and against any claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any rights of a third party; or (d) your AI chatbot deployments and the content they generate.</p>
        </Section>

        <Section title="13. Termination">
          <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
            <li>You may cancel your account at any time from your billing settings. Cancellation takes effect at the end of the current billing period.</li>
            <li>We may suspend or terminate your account immediately for material breach of these Terms, including Acceptable Use violations.</li>
            <li>Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days before deletion, during which you may request an export.</li>
          </ul>
        </Section>

        <Section title="14. Governing Law & Dispute Resolution">
          <p className="text-sm text-gray-600 mb-2">These Terms are governed by the laws of the State of [STATE], without regard to conflict of law principles.</p>
          <p className="text-sm text-gray-600">Any dispute shall be resolved through: (1) good-faith negotiation for 30 days; (2) if unresolved, binding arbitration under the rules of JAMS. You waive the right to participate in a class action lawsuit or class-wide arbitration.</p>
        </Section>

        <Section title="15. Changes to These Terms">
          <p className="text-sm text-gray-600">We may modify these Terms at any time. We will provide at least 30 days' notice of material changes via email or in-app notification. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</p>
        </Section>

        <Section title="16. Contact">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Legal inquiries:</strong> <a href="mailto:legal@agenstack.ai" className="text-indigo-600 underline">legal@agenstack.ai</a></p>
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

function Footer() {
  return (
    <div className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
      <p>© {new Date().getFullYear()} AgenStack AI. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <span className="cursor-pointer hover:text-gray-600">Privacy Policy</span>
        <span>·</span>
        <span className="cursor-pointer hover:text-gray-600">Data Processing Agreement</span>
      </div>
    </div>
  );
}
