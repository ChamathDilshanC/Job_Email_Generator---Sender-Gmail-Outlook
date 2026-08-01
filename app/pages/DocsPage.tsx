'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code,
  FileCode,
  FileSpreadsheet,
  FileText,
  Github,
  Globe,
  Key,
  Layers,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const DOC_SECTIONS = [
  { id: 'overview', title: 'Overview & Features', icon: Sparkles },
  { id: 'resume-ai', title: 'AI Resume Parser', icon: Bot },
  { id: 'github-import', title: 'GitHub Repo Importer', icon: Github },
  { id: 'ats-pdf', title: 'ATS PDF Resume Exporter', icon: FileText },
  { id: 'email-templates', title: 'Email Template Engine', icon: Mail },
  { id: 'api-reference', title: 'API Endpoints Reference', icon: Terminal },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-16">
      {/* Left Sidebar Table of Contents (Chunkr-style layout) */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="sticky top-20 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 px-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Documentation Index
            </h3>
          </div>
          <nav className="space-y-1">
            {DOC_SECTIONS.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Documentation Content */}
      <div className="flex-1 space-y-10 min-w-0">
        {/* Section 1: Overview & Features */}
        <section id="overview" className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Overview
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            JobMail Technical Documentation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to the official developer & user documentation for JobMail — the ultra-modern job application email generator, ATS PDF resume builder, and recruiter outreach platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { title: 'AI Resume Auto-Fill', desc: 'Scan uploaded PDF resumes using Google Gemini AI to auto-populate all profile fields, projects, dates, and links.' },
              { title: 'GitHub Repo Importer', desc: 'Auto-fetch open-source repositories from any GitHub username or URL with descriptions, topics, star counts, and language tags.' },
              { title: 'ATS PDF Exporter', desc: 'Generate high-score ATS-friendly resumes in Modern, Classic, Executive, and Minimalist themes.' },
              { title: 'Emoji-Free Templates', desc: '10+ recruiter-centric email templates styled with clean tables guaranteed to bypass email spam filters.' },
            ].map((card, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">{card.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: AI Resume Parser */}
        <section id="resume-ai" className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Resume Parser (`lib/resumeAiParser.ts`)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatic data extraction from uploaded PDF resumes
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            When a candidate uploads a PDF resume in <strong>Your Information</strong>, the application converts the file using <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[11px]">pdf-parse</code> and forwards the text stream to Google Gemini AI via structured JSON schema parsing.
          </p>

          <div className="p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto space-y-1">
            <div className="text-gray-500">{`// Extracted Data Schema`}</div>
            <div>{`{`}</div>
            <div className="pl-4 text-emerald-400">{`"personalInfo": { "fullName", "email", "phone", "summary", "location" },`}</div>
            <div className="pl-4 text-purple-400">{`"skills": { "selectedSkills": [...], "position": "..." },`}</div>
            <div className="pl-4 text-blue-400">{`"workExperiences": [{ "position", "company", "startDate", "endDate", "responsibilities" }],`}</div>
            <div className="pl-4 text-amber-400">{`"projects": [{ "name", "role", "technologies", "githubUrl", "projectUrl", "startDate", "endDate" }],`}</div>
            <div className="pl-4 text-pink-400">{`"education": [{ "degree", "fieldOfStudy", "institution", "gpa", "startDate", "endDate" }]`}</div>
            <div>{`}`}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span><strong>Automatic Persistence:</strong> Parsed data is automatically stored in <code className="font-mono">localStorage</code> & updated across all application pages without re-uploading.</span>
          </div>
        </section>

        {/* Section 3: GitHub Repo Importer */}
        <section id="github-import" className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                GitHub Repo Importer (`lib/githubApiClient.ts`)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct integration with GitHub REST API (`/users/{'{username}'}/repos`)
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Candidates can provide their GitHub username or full profile URL (e.g. <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[11px]">https://github.com/ChamathDilshanC</code>). The system fetches all public repositories, parses primary programming languages, stargazers, forks, repository topics, and homepage links into editable project cards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
              <div className="font-bold text-gray-900 dark:text-white mb-1">1. URL Sanitization</div>
              <div className="text-gray-500 dark:text-gray-400">Extracts clean username from standard GitHub URLs.</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
              <div className="font-bold text-gray-900 dark:text-white mb-1">2. Auto-Select Filter</div>
              <div className="text-gray-500 dark:text-gray-400">Filters non-fork repos with stars & descriptions by default.</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
              <div className="font-bold text-gray-900 dark:text-white mb-1">3. In-Modal Editing</div>
              <div className="text-gray-500 dark:text-gray-400">Edit titles, roles & descriptions before importing to resume.</div>
            </div>
          </div>
        </section>

        {/* Section 4: ATS PDF Export */}
        <section id="ats-pdf" className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                ATS PDF Resume Exporter (`lib/atsPdfGenerator.ts`)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Client-side PDF generation powered by `jspdf` & `html2canvas`
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Generates high-scoring ATS-friendly PDF resumes in multiple themes:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-center font-bold text-indigo-600 dark:text-indigo-400">
              Modern Tech
            </div>
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-center font-bold text-blue-600 dark:text-blue-400">
              Classic Executive
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 text-center font-bold text-emerald-600 dark:text-emerald-400">
              Minimalist Clean
            </div>
            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 text-center font-bold text-purple-600 dark:text-purple-400">
              Single-Page Compact
            </div>
          </div>
        </section>

        {/* Section 5: API Reference */}
        <section id="api-reference" className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                API Endpoints Reference
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next.js App Router API Route definitions
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">POST /api/send-email</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Auth Required</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">Dispatches recruiter emails via Gmail OAuth 2.0 or Outlook SMTP transport.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-blue-600 dark:text-blue-400">GET /api/github/repos?username=...</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Public</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">Fetches public GitHub repositories with topics, languages, and star metrics.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-purple-600 dark:text-purple-400">POST /api/parse-resume</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Auth Required</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">Scans PDF binary data using Gemini AI structured schema response.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
