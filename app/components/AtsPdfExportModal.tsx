'use client';

import {
  ATS_THEME_OPTIONS,
  AtsTheme,
  exportAtsResumePdf,
  generateAtsResumeHtml,
} from '@/lib/atsPdfGenerator';
import { ResumeData } from '@/lib/resumeDataService';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, Printer, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  const handleExport = () => {
    exportAtsResumePdf(resumeData, selectedTheme);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full lg:w-[66.666vw] h-[85vh] lg:h-[66.666vh] min-h-[520px] max-w-7xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between m-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b3be3]/10 text-[#3b3be3] dark:text-[#818cf8] flex items-center justify-center font-semibold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  ATS PDF Resume Exporter
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                    100% Vector ATS Ready
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a recruiter-tested ATS theme and export your resume as a clean, searchable PDF.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content - 2 Columns */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
            {/* Theme Selector Sidebar (4 Cols) */}
            <div className="lg:col-span-4 p-5 border-r border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 overflow-y-auto space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Choose ATS Layout Theme
              </label>

              {ATS_THEME_OPTIONS.map(option => {
                const isSelected = selectedTheme === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedTheme(option.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-[#3b3be3] shadow-md ring-2 ring-[#3b3be3]/20'
                        : 'bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: option.accentColor }}
                        />
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {option.name}
                        </h4>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#3b3be3] text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                );
              })}

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  ⚡ ATS Optimization Tip
                </div>
                <p>
                  All themes render clean single-column structure &amp; standard fonts so systems like Workday &amp; Greenhouse extract 100% of your experience.
                </p>
              </div>
            </div>

            {/* Live Interactive Preview Frame (8 Cols) */}
            <div className="lg:col-span-8 p-4 bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center overflow-hidden relative h-full">
              <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 shrink-0">
                  <span>Live Preview: {ATS_THEME_OPTIONS.find(t => t.id === selectedTheme)?.name}</span>
                  <span>Vector Searchable PDF</span>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Candidate: <strong className="text-gray-700 dark:text-gray-300">{resumeData.personalInfo.fullName || 'User'}</strong> ({resumeData.skills.position || 'Software Engineer'})
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 text-sm font-medium text-white bg-[#3b3be3] hover:bg-[#2929c9] rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download ATS PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
