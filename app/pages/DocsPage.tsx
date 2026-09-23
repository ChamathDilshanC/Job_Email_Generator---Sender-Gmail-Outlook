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
import { BounceSidebar } from '@/components/ui/bounce-sidebar';
import { useEffect, useMemo, useState } from 'react';

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
  const sectionItems = useMemo(
    () => [
      { label: 'Contents', heading: true as const },
      ...DOC_SECTIONS.map(section => ({
        label: section.title,
        href: `#${section.id}`,
      })),
    ],
    []
  );

  useEffect(() => {
    const sections = DOC_SECTIONS.map(section => document.getElementById(section.id)).filter(
      (section): section is HTMLElement => Boolean(section)
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-16% 0px -68% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-10 pb-16">
      {/* Compact contents rail with the shared animated bounce navigation. */}
      <div className="w-full flex-shrink-0 lg:w-56">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain p-1 pr-2 [scrollbar-color: hsl(var(--muted-foreground)/.35)_transparent] [scrollbar-width:thin]">
          <div className="mb-4 flex items-center gap-2 px-2 pb-3">
            <FileCode className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Documentation Index
            </h3>
          </div>
          <BounceSidebar
            items={sectionItems}
            value={Math.max(
              1,
              DOC_SECTIONS.findIndex(section => section.id === activeSection) + 1
            )}
            onChange={index => {
              const section = DOC_SECTIONS[index - 1];
              if (section) scrollToSection(section.id);
            }}
            dotColor="#4f46e5"
            className="gap-1 pl-4"
          />
        </div>
      </div>

      {/* Main Documentation Content */}
      <div className="min-w-0 flex-1 space-y-16">
        {/* Section 1: Overview & Features */}
        <section id="overview" className="scroll-mt-24 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> Overview
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            JobMail Technical Documentation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to the official developer & user documentation for JobMail — the ultra-modern job application email generator, ATS PDF resume builder, and recruiter outreach platform.
          </p>

          <div className="grid grid-cols-1 gap-x-10 gap-y-5 border-t border-border/60 pt-6 sm:grid-cols-2">
            {[
              { title: 'AI Resume Auto-Fill', desc: 'Scan uploaded PDF resumes using Google Gemini AI to auto-populate all profile fields, projects, dates, and links.' },
              { title: 'GitHub Repo Importer', desc: 'Auto-fetch open-source repositories from any GitHub username or URL with descriptions, topics, star counts, and language tags.' },
              { title: 'ATS PDF Exporter', desc: 'Generate high-score ATS-friendly resumes in Modern, Classic, Executive, and Minimalist themes.' },
              { title: 'Emoji-Free Templates', desc: '10+ recruiter-centric email templates styled with clean tables guaranteed to bypass email spam filters.' },
            ].map((card, i) => (
              <div key={i} className="border-b border-border/50 pb-4">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">{card.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: AI Resume Parser */}
        <section id="resume-ai" className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10">
          <div className="flex items-center gap-3">
            <div className="text-blue-600 dark:text-blue-400">
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

          <div className="flex items-center gap-3 border-l-2 border-emerald-500 pl-3 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span><strong>Automatic Persistence:</strong> Parsed data is automatically stored in <code className="font-mono">localStorage</code> & updated across all application pages without re-uploading.</span>
          </div>
        </section>

        {/* Section 3: GitHub Repo Importer */}
        <section id="github-import" className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10">
          <div className="flex items-center gap-3">
            <div className="text-gray-900 dark:text-white">
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
            <div className="border-b border-border/50 pb-3">
              <div className="font-bold text-gray-900 dark:text-white mb-1">1. URL Sanitization</div>
              <div className="text-gray-500 dark:text-gray-400">Extracts clean username from standard GitHub URLs.</div>
            </div>
            <div className="border-b border-border/50 pb-3">
              <div className="font-bold text-gray-900 dark:text-white mb-1">2. Auto-Select Filter</div>
              <div className="text-gray-500 dark:text-gray-400">Filters non-fork repos with stars & descriptions by default.</div>
            </div>
            <div className="border-b border-border/50 pb-3">
              <div className="font-bold text-gray-900 dark:text-white mb-1">3. In-Modal Editing</div>
              <div className="text-gray-500 dark:text-gray-400">Edit titles, roles & descriptions before importing to resume.</div>
            </div>
          </div>
        </section>

        {/* Section 4: ATS PDF Export */}
        <section id="ats-pdf" className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10">
          <div className="flex items-center gap-3">
            <div className="text-purple-600 dark:text-purple-400">
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border/60 pt-5 text-xs sm:grid-cols-4">
            <div className="border-b border-border/50 pb-3 font-bold text-indigo-600 dark:text-indigo-400">
              Modern Tech
            </div>
            <div className="border-b border-border/50 pb-3 font-bold text-blue-600 dark:text-blue-400">
              Classic Executive
            </div>
            <div className="border-b border-border/50 pb-3 font-bold text-emerald-600 dark:text-emerald-400">
              Minimalist Clean
            </div>
            <div className="border-b border-border/50 pb-3 font-bold text-purple-600 dark:text-purple-400">
              Single-Page Compact
            </div>
          </div>
        </section>

        {/* Section 5: Email Template Engine */}
        <section id="email-templates" className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10">
          <div className="flex items-center gap-3">
            <div className="text-rose-600 dark:text-rose-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Email Template Engine
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recruiter-ready application messaging with favorite templates
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Choose from structured application, referral, networking, interview,
            and follow-up templates. Favorite templates are surfaced first in the
            Send Email selector, while AI generation can tailor the message to the
            selected role and resume profile.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border/60 pt-5 text-xs text-gray-600 dark:text-gray-300">
            <span><strong className="text-foreground">10+</strong> recruiter workflows</span>
            <span><strong className="text-foreground">ATS-friendly</strong> plain structure</span>
            <span><strong className="text-foreground">Favorites</strong> user-scoped</span>
          </div>
        </section>

        {/* Section 5: API Reference */}
        <section id="api-reference" className="scroll-mt-24 space-y-5 border-t border-border/60 pt-10">
          <div className="flex items-center gap-3">
            <div className="text-amber-600 dark:text-amber-400">
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
            <div className="space-y-2 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">POST /api/send-email</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Auth Required</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">Dispatches recruiter emails via Gmail OAuth 2.0 or Outlook SMTP transport.</p>
            </div>

            <div className="space-y-2 border-b border-border/60 pb-4">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-blue-600 dark:text-blue-400">GET /api/github/repos?username=...</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Public</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">Fetches public GitHub repositories with topics, languages, and star metrics.</p>
            </div>

            <div className="space-y-2 border-b border-border/60 pb-4">
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
