'use client';

import {
  ATS_THEME_OPTIONS,
  AtsTheme,
  exportAtsResumePdf,
  generateAtsResumeHtml,
} from '@/lib/atsPdfGenerator';
import { ResumeData } from '@/lib/resumeDataService';
import { showToast } from '@/lib/toast';
import { Check, Copy, Download, Loader2, Share2, Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicShareableResumePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const profileId = (params?.profileId as string) || 'default';

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<AtsTheme>(AtsTheme.MODERN);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchResume = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/resume?userId=${encodeURIComponent(userId)}&profileId=${encodeURIComponent(
            profileId
          )}`
        );
        const data = await res.json();
        if (data?.resume) {
          setResumeData(data.resume);
        } else {
          setError('Resume not found or has been removed.');
        }
      } catch (err) {
        console.error('Error fetching shareable resume:', err);
        setError('Failed to load this resume.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [userId, profileId]);

  const previewHtml = resumeData
    ? generateAtsResumeHtml(resumeData, selectedTheme)
    : '';

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast(
      'success',
      'Share Link Copied!',
      'Anyone with this link can view this ATS resume.'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (resumeData) {
      exportAtsResumePdf(resumeData, selectedTheme);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#818cf8] mb-3" />
        <p className="text-sm font-medium text-gray-300">Loading Resume...</p>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Resume Not Found</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          {error || 'This resume link may be invalid or no longer exists.'}
        </p>
      </div>
    );
  }

  const candidateName = resumeData.personalInfo.fullName || 'Candidate';
  const candidatePosition = resumeData.skills.position || 'Software Engineer';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b3be3]/20 text-[#818cf8] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {candidateName}
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Public Resume
                </span>
              </h1>
              <p className="text-xs text-gray-400">{candidatePosition}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Theme Selector Pills */}
            <div className="hidden lg:flex items-center gap-1.5 bg-gray-800/80 p-1 rounded-xl border border-gray-700/60 text-xs">
              {ATS_THEME_OPTIONS.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTheme === theme.id
                      ? 'bg-[#3b3be3] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }`}
                >
                  {theme.badge}
                </button>
              ))}
            </div>

            {/* Copy Share Link */}
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied Link</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-400" />
                  <span>Copy Share Link</span>
                </>
              )}
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium bg-[#3b3be3] hover:bg-[#2929c9] text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Theme Selector Bar */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-gray-400 shrink-0 font-medium">Theme:</span>
        {ATS_THEME_OPTIONS.map(theme => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              selectedTheme === theme.id
                ? 'bg-[#3b3be3] text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {theme.badge}
          </button>
        ))}
      </div>

      {/* Main Vector Resume Viewer */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800 min-h-[85vh] flex flex-col">
          <iframe
            title={`${candidateName} - ATS Resume`}
            srcDoc={previewHtml}
            className="w-full flex-1 border-0 bg-white"
          />
        </div>
      </main>
    </div>
  );
}
