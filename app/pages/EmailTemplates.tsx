'use client';

import { generateEmailFromTemplate } from '@/lib/emailTemplateGenerator';
import { loadResumeData, ResumeData } from '@/lib/resumeDataService';
import { TEMPLATE_METADATA, TemplateType } from '@/lib/templateTypes';
import { useEffect, useState } from 'react';

export default function EmailTemplates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateType>(
    TemplateType.PROFESSIONAL_INTRO
  );
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(
    null
  );
  const [previewEmail, setPreviewEmail] = useState<{
    subject: string;
    bodyText: string;
    bodyHtml: string;
  } | null>(null);

  // Load resume data on component mount
  useEffect(() => {
    const fetchResumeData = async () => {
      setIsLoadingResume(true);
      try {
        const data = await loadResumeData();
        setResumeData(data);
      } catch (error) {
        console.error('Error loading resume data:', error);
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResumeData();
  }, []);

  const handleSelectTemplate = (templateId: TemplateType) => {
    setSelectedTemplateId(templateId);
    // Store in localStorage for use in SendEmail page
    localStorage.setItem('selectedTemplateId', templateId.toString());
  };

  const handlePreviewWithResume = (templateId: TemplateType) => {
    if (!resumeData) {
      alert(
        'Please complete your resume in the Resume Builder first to preview with your data.'
      );
      return;
    }

    // Generate preview email with sample job details
    const sampleJobDetails = {
      companyName: 'Example Company',
      position: 'Software Developer',
      recipientEmail: 'hr@example.com',
    };

    const generatedEmail = generateEmailFromTemplate(
      templateId,
      resumeData,
      sampleJobDetails
    );

    setPreviewEmail(generatedEmail);
    setPreviewTemplate(templateId);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewTemplate(null);
    setPreviewEmail(null);
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#3b3be3] to-[#3b3be3] bg-clip-text text-transparent">
            Email Templates
          </h1>
          <p className="text-gray-500">
            Choose from 5 professional job application email templates
          </p>
          {isLoadingResume && (
            <p className="text-sm text-blue-600 mt-2">
              Loading your resume data...
            </p>
          )}
          {!isLoadingResume && !resumeData && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ No resume data found. Please complete your{' '}
                <a
                  href="/resume-builder"
                  className="font-semibold underline hover:text-yellow-900"
                >
                  Resume Builder
                </a>{' '}
                to preview templates with your actual data.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_METADATA.map(template => {
            const isSelected = template.id === selectedTemplateId;

            return (
              <div
                key={template.id}
                className={`bg-white border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? 'border-[#22c55e] shadow-lg ring-2 ring-[#22c55e] ring-opacity-50'
                    : 'border-gray-200 hover:border-[#3b3be3]'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-[#3b3be3] rounded-full text-xs font-semibold">
                        Template {template.id}
                      </span>
                      {template.id === TemplateType.COMPREHENSIVE_PROFILE && (
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-md">
                          ⭐ Recommended for Jobs
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[#22c55e]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold my-2">
                    {template.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="text-sm mb-2 text-gray-600">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    {template.preview}
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    {template.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
                        : 'bg-[#3b3be3] text-white hover:bg-[#2f2fb8] hover:scale-105'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Currently Selected
                      </span>
                    ) : (
                      'Select Template'
                    )}
                  </button>

                  <button
                    onClick={() => handlePreviewWithResume(template.id)}
                    disabled={!resumeData}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      resumeData
                        ? 'border-[#3b3be3] text-[#3b3be3] hover:bg-blue-50'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Preview with My Resume
                  </button>

                  {isSelected && (
                    <div className="text-center">
                      <span className="text-sm font-semibold text-[#22c55e] flex items-center justify-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewEmail && previewTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {TEMPLATE_METADATA.find(t => t.id === previewTemplate)?.name}{' '}
                  Preview
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Generated with your resume data
                </p>
              </div>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Subject:
                </p>
                <p className="text-gray-900">{previewEmail.subject}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {previewEmail.bodyText}
                </pre>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 This preview uses sample company details (Example Company,
                  Software Developer). When you send an email, it will use your
                  actual job application details.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate);
                  closePreview();
                }}
                className="px-6 py-2.5 rounded-lg font-medium text-sm bg-[#3b3be3] text-white hover:bg-[#2f2fb8] transition-colors"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
