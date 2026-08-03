'use client';

import { ATS_THEME_OPTIONS, AtsTheme } from '@/lib/atsPdfGenerator';
import { ResumeData } from '@/lib/resumeDataService';
import { showToast } from '@/lib/toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, ExternalLink, Share2, X } from 'lucide-react';
import { useState } from 'react';

interface ShareResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData | null;
}

export default function ShareResumeModal({
  isOpen,
  onClose,
  resumeData,
}: ShareResumeModalProps) {
  const [copiedTheme, setCopiedTheme] = useState<string | null>(null);

  if (!isOpen || !resumeData) return null;

  const handleCopyLinkForTheme = (themeId: AtsTheme, themeName: string) => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/resume/share/${encodeURIComponent(
      resumeData.userId
    )}/${encodeURIComponent(resumeData.profileId)}?theme=${themeId}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedTheme(themeId);
    showToast(
      'success',
      'Share Link Copied!',
      `Direct link for "${themeName}" layout copied to clipboard.`
    );
    setTimeout(() => setCopiedTheme(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col m-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b3be3]/10 text-[#3b3be3] flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Share Your Resume Link
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select which recruiter-tested layout theme you want to share.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: 4 Theme Options */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Choose Layout Template to Share
            </p>
            {ATS_THEME_OPTIONS.map(theme => {
              const isCopied = copiedTheme === theme.id;
              const shareUrl =
                typeof window !== 'undefined'
                  ? `${window.location.origin}/resume/share/${encodeURIComponent(
                      resumeData.userId
                    )}/${encodeURIComponent(resumeData.profileId)}?theme=${theme.id}`
                  : '#';

              return (
                <div
                  key={theme.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 hover:border-[#3b3be3]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-3 h-3 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {theme.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Preview in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopyLinkForTheme(theme.id, theme.name)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all shadow-sm ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#3b3be3] hover:bg-[#2929c9] text-white active:scale-95'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
