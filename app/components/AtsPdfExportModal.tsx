import {
  ATS_THEME_OPTIONS,
  AtsTheme,
  exportAtsResumeDocx,
  exportAtsResumePdf,
  generateAtsResumeHtml,
} from '@/lib/atsPdfGenerator';
import { ResumeData } from '@/lib/resumeDataService';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileText, Printer, Share2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { showToast } from '@/lib/toast';

interface AtsPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData | null;
}

export default function AtsPdfExportModal({
  isOpen,
  onClose,
  resumeData,
}: AtsPdfExportModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<AtsTheme>(AtsTheme.MODERN);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (resumeData) {
      const html = generateAtsResumeHtml(resumeData, selectedTheme);
      setPreviewHtml(html);
    }
  }, [resumeData, selectedTheme]);

  if (!isOpen || !resumeData) return null;

  const handleExportPdf = () => {
    exportAtsResumePdf(resumeData, selectedTheme);
  };

  const handleExportDocx = () => {
    exportAtsResumeDocx(resumeData, selectedTheme);
    showToast(
      'success',
      'DOCX Exported!',
      'Your editable Word document resume has been downloaded.'
    );
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/resume/share/${encodeURIComponent(
      resumeData.userId
    )}/${encodeURIComponent(resumeData.profileId)}?theme=${selectedTheme}`;
    navigator.clipboard.writeText(shareUrl);
    const themeName = ATS_THEME_OPTIONS.find(t => t.id === selectedTheme)?.name || selectedTheme;
    showToast(
      'success',
      'Shareable Link Copied!',
      `Direct link for "${themeName}" theme copied to clipboard.`
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl h-[82vh] max-h-[720px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between m-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3b3be3]/10 text-[#3b3be3] dark:text-[#818cf8] flex items-center justify-center font-semibold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  ATS Resume Exporter
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                    PDF &amp; DOCX Ready
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a recruiter-tested ATS theme and export your resume as a clean PDF or editable Word document.
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

          {/* Modal Content - 2 Columns */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
            {/* Theme Selector Sidebar (4 Cols) */}
            <div className="lg:col-span-4 p-4 border-r border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 overflow-y-auto space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                Choose ATS Layout Theme
              </label>

              {ATS_THEME_OPTIONS.map(option => {
                const isSelected = selectedTheme === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedTheme(option.id)}
                    className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-[#3b3be3] shadow-md ring-2 ring-[#3b3be3]/20'
                        : 'bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: option.accentColor }}
                        />
                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                          {option.name}
                        </h4>
                      </div>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#3b3be3] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                );
              })}

              <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                <div className="font-semibold flex items-center gap-1">
                  ⚡ ATS Optimization Tip
                </div>
                <p className="leading-tight">
                  All themes render clean single-column structure &amp; standard fonts for 100% ATS parser accuracy.
                </p>
              </div>
            </div>

            {/* Live Interactive Preview Frame (8 Cols) */}
            <div className="lg:col-span-8 p-3 bg-slate-100 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden relative h-full">
              <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="bg-gray-200 dark:bg-gray-800 px-3 py-1.5 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 shrink-0">
                  <span>Live Preview: {ATS_THEME_OPTIONS.find(t => t.id === selectedTheme)?.name}</span>
                  <span>Vector PDF &amp; Editable DOCX</span>
                </div>
                <iframe
                  title="ATS PDF Live Preview"
                  srcDoc={previewHtml}
                  className="w-full flex-1 border-0 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/90 shrink-0 z-10">
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
              Candidate: <strong className="text-gray-700 dark:text-gray-300">{resumeData.personalInfo.fullName || 'User'}</strong>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Link
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExportDocx}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                Export DOCX
              </button>
              <button
                onClick={handleExportPdf}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#3b3be3] hover:bg-[#2929c9] rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

