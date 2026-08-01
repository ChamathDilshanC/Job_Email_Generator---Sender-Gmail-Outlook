'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FileText,
  Layers,
  Mail,
  Send,
  Shield,
  Zap,
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Guide & System Architecture
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            JobMail Architecture & Sending Guide
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Understand how JobMail processes candidate profile data, generates tailored ATS-optimized email templates, and dispatches them securely via Gmail OAuth or Outlook SMTP.
          </p>
        </div>
      </div>

      {/* Main Execution Flow Diagram */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-indigo-500" />
          End-to-End Email Dispatch Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Profile Data & AI Sync',
              desc: 'Candidate details (Experience, Projects, GitHub repos) are cached in localStorage & synced with MongoDB profile store.',
              icon: Database,
              color: 'from-blue-500 to-indigo-500',
            },
            {
              step: '02',
              title: 'Template Compilation',
              desc: 'Pure HTML & inline-styled CSS engine dynamically inserts profile data into recruiter-tested email layouts.',
              icon: Code2,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              step: '03',
              title: 'Security & Auth Gate',
              desc: 'Tokens (Gmail OAuth 2.0 / Outlook App Credentials) are validated and encrypted using AES-256 GCM.',
              icon: Shield,
              color: 'from-purple-500 to-pink-500',
            },
            {
              step: '04',
              title: 'Direct Provider Dispatch',
              desc: 'Emails are dispatched directly through Google Gmail API or Microsoft Graph / Nodemailer SMTP protocol.',
              icon: Send,
              color: 'from-emerald-500 to-teal-500',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white bg-gradient-to-r ${item.color}`}>
                    STEP {item.step}
                  </span>
                  <item.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Codebase Logics & Technical Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Sending Logic */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Email Dispatch Engine (`lib/emailService.ts`)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Core API handler for provider authentication & transport
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 font-mono text-[11px] text-gray-800 dark:text-gray-200 overflow-x-auto">
              <code>
                {`// API Endpoint: /api/send-email\nPOST {\n  recipientEmail: "recruiter@company.com",\n  subject: "Application for Senior Developer",\n  htmlContent: "...",\n  provider: "gmail" | "outlook"\n}`}
              </code>
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Gmail OAuth 2.0 Integration:</strong> Uses Google API Client with refresh tokens to request scoped access (`https://mail.google.com/`) for direct API dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Outlook SMTP / Graph API:</strong> Authenticates via OAuth 2.0 PKCE flow or Nodemailer transport with App Passwords.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Attachment Management:</strong> PDF resumes generated on-demand are encoded to Base64 buffers and attached as MIME body parts.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Template Generation Logic */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Template Engine (`lib/emailTemplateGenerator.ts`)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                10+ recruiter-centric HTML templates with inline styles
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 font-mono text-[11px] text-gray-800 dark:text-gray-200 overflow-x-auto">
              <code>
                {`// Pure HTML Generator (Zero External CSS Dependencies)\nfunction generateEmailTemplate(type, data, jobDetails) {\n  // Inlines clean tables, typography & accent colors\n  return wrapHtml(renderBody(type, data, jobDetails));\n}`}
              </code>
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span><strong>No Emoji Guarantee:</strong> Pure text formatting ensures high deliverability without triggering spam/promotions tab filters.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span><strong>Responsive Email Tables:</strong> Uses HTML table standards (`cellpadding=0`) guaranteed to render identically across Gmail, Outlook Web, and Apple Mail.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span><strong>Dynamic Data Interpolation:</strong> Seamlessly pulls technical skills, project links, GitHub repos, and work history directly into template cards.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step-by-Step User Instructions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-amber-500" />
          Step-by-Step Job Application Guide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Fill Your Profile / Import GitHub
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Navigate to <strong>Your Information</strong>. Either upload a PDF resume to scan with AI or import open-source project cards directly from your GitHub profile link.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Select Job Details & Template
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Go to <strong>Send Email</strong>. Input the recruiter email, target position, and company name. Pick from Ultra-Modern, Executive, or Minimalist recruiter templates.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Preview, Attach Resume & Dispatch
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Review live preview with custom accent colors. Attach your auto-generated ATS-Friendly PDF resume with one click, then hit <strong>Send Email</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
