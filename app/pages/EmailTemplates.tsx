'use client';

import { useAuth } from '@/contexts/AuthContext';
import { generateEmailFromTemplate } from '@/lib/emailTemplateGenerator';
import {
  loadResumeData,
  ResumeData,
  saveResumeData,
} from '@/lib/resumeDataService';
import { fetchBestMatchingSkillsForPosition } from '@/lib/skillsApiClient';
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_METADATA,
  TemplateCategory,
  TemplateMetadata,
  TemplateType,
} from '@/lib/templateTypes';
import { showToast } from '@/lib/toast';
import { loadFavoriteTemplateIds, toggleFavoriteTemplate } from '@/lib/favoriteTemplates';
import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const CATEGORY_TABS = Object.values(TemplateCategory);

export default function EmailTemplates() {
  const { user } = useAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateType>(
    TemplateType.PROFESSIONAL_INTRO
  );
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(
    TemplateCategory.APPLICATION
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
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<TemplateType[]>([]);
  const [isMatchingRole, setIsMatchingRole] = useState(false);
  const [customizingTemplate, setCustomizingTemplate] =
    useState<TemplateMetadata | null>(null);
  const [customizationDraft, setCustomizationDraft] = useState<{
    skills: string[];
  } | null>(null);
  const [newCustomizationSkill, setNewCustomizationSkill] = useState('');
  const [isSavingCustomization, setIsSavingCustomization] = useState(false);
  // Load resume data and selected template on component mount
  useEffect(() => {
    setFavoriteTemplateIds(loadFavoriteTemplateIds(user?.uid));
    // Load selected template from localStorage
    const savedTemplateId = localStorage.getItem('selectedTemplateId');
    if (savedTemplateId) {
      setSelectedTemplateId(parseInt(savedTemplateId) as TemplateType);
    }

    // Load resume data
    const fetchResumeData = async () => {
      setIsLoadingResume(true);
      try {
        const data = await loadResumeData(user?.uid);
        setResumeData(data);
      } catch (error) {
        console.error('Error loading resume data:', error);
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResumeData();
  }, [user?.uid]);

  const handleToggleFavorite = (templateId: TemplateType) => {
    setFavoriteTemplateIds(toggleFavoriteTemplate(user?.uid, templateId));
  };

  const visibleTemplates = useMemo(
    () => TEMPLATE_METADATA.filter(template => template.category === activeCategory),
    [activeCategory]
  );

  const handleSelectTemplate = async (templateId: TemplateType) => {
    setSelectedTemplateId(templateId);
    // Store in localStorage for use in SendEmail page
    localStorage.setItem('selectedTemplateId', templateId.toString());

    const roleTarget = TEMPLATE_METADATA.find(item => item.id === templateId)?.roleTarget;
    if (!roleTarget || !resumeData || !user?.uid) return;

    setIsMatchingRole(true);
    try {
      const matchedSkills = await fetchBestMatchingSkillsForPosition(roleTarget, 6);
      const existingSkills = resumeData.skills?.selectedSkills || [];
      const mergedSkills = Array.from(
        new Map(
          [...matchedSkills, ...existingSkills]
            .map(skill => skill.trim())
            .filter(Boolean)
            .map(skill => [skill.toLowerCase(), skill] as const)
        ).values()
      ).slice(0, 50);
      const updatedResumeData: ResumeData = {
        ...resumeData,
        skills: {
          ...resumeData.skills,
          position: roleTarget,
          selectedSkills: mergedSkills,
        },
      };

      await saveResumeData(
        user.uid,
        {
          personalInfo: updatedResumeData.personalInfo,
          socialLinks: updatedResumeData.socialLinks,
          workExperiences: updatedResumeData.workExperiences,
          education: updatedResumeData.education,
          projects: updatedResumeData.projects,
          skills: updatedResumeData.skills,
        },
        { profileId: updatedResumeData.profileId }
      );
      setResumeData(updatedResumeData);
      showToast(
        'success',
        'Role Skills Matched',
        `${roleTarget} selected. The best ${matchedSkills.length} skills were added to Your Information.`
      );
    } catch (error) {
      console.error('Error matching role skills:', error);
      showToast(
        'warning',
        'Template Selected',
        'The role template was selected, but matched skills could not be saved. You can retry from Your Information.'
      );
    } finally {
      setIsMatchingRole(false);
    }
  };

  const openCustomization = (templateId: TemplateType) => {
    if (!resumeData) {
      showToast(
        'warning',
        'Resume Required',
        'Complete Your Information before customizing an email template.'
      );
      return;
    }

    const template = TEMPLATE_METADATA.find(item => item.id === templateId);
    if (!template) return;

    setCustomizingTemplate(template);
    setCustomizationDraft({
      skills: [...(resumeData.skills?.selectedSkills || [])],
    });
    setNewCustomizationSkill('');
  };

  const closeCustomization = () => {
    if (isSavingCustomization) return;
    setCustomizingTemplate(null);
    setCustomizationDraft(null);
  };

  const addCustomizationSkill = () => {
    const skill = newCustomizationSkill.trim();
    if (!skill || !customizationDraft) return;

    const alreadyAdded = customizationDraft.skills.some(
      item => item.trim().toLowerCase() === skill.toLowerCase()
    );
    if (alreadyAdded) {
      setNewCustomizationSkill('');
      return;
    }

    if (customizationDraft.skills.length >= 50) {
      showToast('warning', 'Skill Limit Reached', 'You can keep up to 50 skills in a profile.');
      return;
    }

    setCustomizationDraft(previous =>
      previous
        ? { ...previous, skills: [...previous.skills, skill] }
        : previous
    );
    setNewCustomizationSkill('');
  };

  const removeCustomizationSkill = (skillToRemove: string) => {
    setCustomizationDraft(previous =>
      previous
        ? {
            ...previous,
            skills: previous.skills.filter(skill => skill !== skillToRemove),
          }
        : previous
    );
  };

  const saveCustomization = async () => {
    if (!customizingTemplate || !customizationDraft || !resumeData || !user?.uid) {
      return;
    }

    setIsSavingCustomization(true);
    try {
      const normalizedSkills = Array.from(
        new Map(
          customizationDraft.skills
            .map(skill => skill.trim())
            .filter(Boolean)
            .map(skill => [skill.toLowerCase(), skill] as const)
        ).values()
      ).slice(0, 50);
      const updatedResumeData: ResumeData = {
        ...resumeData,
        skills: {
          ...resumeData.skills,
          position: customizingTemplate.roleTarget || resumeData.skills.position,
          selectedSkills: normalizedSkills,
        },
      };

      await saveResumeData(
        user.uid,
        {
          personalInfo: updatedResumeData.personalInfo,
          socialLinks: updatedResumeData.socialLinks,
          workExperiences: updatedResumeData.workExperiences,
          education: updatedResumeData.education,
          projects: updatedResumeData.projects,
          skills: updatedResumeData.skills,
        },
        { profileId: updatedResumeData.profileId }
      );

      setResumeData(updatedResumeData);
      setSelectedTemplateId(customizingTemplate.id);
      localStorage.setItem('selectedTemplateId', customizingTemplate.id.toString());
      setCustomizingTemplate(null);
      setCustomizationDraft(null);
      showToast(
        'success',
        'Template Customized',
        'Your selected skills were saved to Your Information.'
      );
    } catch (error) {
      console.error('Error saving template customization:', error);
      showToast(
        'error',
        'Could Not Save Customization',
        'Please try again or update your skills from Your Information.'
      );
    } finally {
      setIsSavingCustomization(false);
    }
  };

  const handlePreviewWithResume = (templateId: TemplateType) => {
    if (!resumeData) {
      showToast(
        'warning',
        'Resume Required',
        'Please complete your resume in the Resume Builder first to preview with your data.'
      );
      return;
    }

    // Role-targeted templates preview against their own target role so the
    // user can verify the correct structure before selecting one.
    const roleTarget = TEMPLATE_METADATA.find(item => item.id === templateId)?.roleTarget;

    // Generate preview email with sample job details
    const sampleJobDetails = {
      companyName: 'Example Company',
      position: roleTarget || 'Software Developer',
      recipientEmail: 'hr@example.com',
      recruiterName: 'Jordan Lee',
      referralName: 'Sam Perera',
      referralRole: 'Senior Engineer',
      interviewerName: 'Priya Nair',
      interviewDate: 'July 15',
      daysSinceApplied: '2 weeks',
      offerDeadline: 'Friday',
      decision: 'accept' as const,
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
          <p className="text-gray-500 dark:text-gray-400">
            Choose from {TEMPLATE_METADATA.length} professional job
            application email templates
          </p>
          {isLoadingResume && (
            <p className="text-sm text-blue-600 dark:text-[#a5b4fc] mt-2">
              Loading your resume data...
            </p>
          )}
          {!isLoadingResume && !resumeData && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ No resume data found. Please complete your{' '}
                <a
                  href="/resume-builder"
                  className="font-semibold underline hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  Resume Builder
                </a>{' '}
                to preview templates with your actual data.
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          {CATEGORY_TABS.map(category => {
            const count = TEMPLATE_METADATA.filter(
              t => t.category === category
            ).length;
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3b3be3] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {TEMPLATE_CATEGORY_LABELS[category]}
                <span
                  className={`ml-1.5 ${
                    isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTemplates.map(template => {
            const isSelected = template.id === selectedTemplateId;

            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-gray-900 border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40 ${
                  isSelected
                    ? 'border-[#22c55e] shadow-lg ring-2 ring-[#22c55e] ring-opacity-50'
                    : 'border-gray-200 dark:border-gray-800 hover:border-[#3b3be3] dark:hover:border-[#818cf8]'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-[#818cf8]/15 text-[#3b3be3] dark:text-[#a5b4fc] rounded-full text-xs font-semibold">
                        Template {template.id}
                      </span>
                      {template.recommended && (
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-md">
                          ⭐ Recommended for Jobs
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(template.id)}
                      aria-label={`${favoriteTemplateIds.includes(template.id) ? 'Remove' : 'Add'} ${template.name} favorite`}
                      title={favoriteTemplateIds.includes(template.id) ? 'Remove from favorites' : 'Add to favorites'}
                      className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <Heart
                        className="h-5 w-5"
                        fill={favoriteTemplateIds.includes(template.id) ? 'currentColor' : 'none'}
                      />
                    </button>
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
                  <h3 className="text-xl font-semibold my-2 text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    {template.preview}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
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
                      isMatchingRole && template.roleTarget
                        ? 'Matching Skills...'
                        : 'Select Template'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openCustomization(template.id)}
                    disabled={!resumeData || isSavingCustomization}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      resumeData
                        ? 'border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Customize
                  </button>

                  <button
                    onClick={() => handlePreviewWithResume(template.id)}
                    disabled={!resumeData}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      resumeData
                        ? 'border-[#3b3be3] text-[#3b3be3] dark:border-[#818cf8] dark:text-[#a5b4fc] hover:bg-blue-50 dark:hover:bg-[#818cf8]/10'
                        : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
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

      {/* Customize template skills */}
      {customizingTemplate && customizationDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCustomization}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Customize {customizingTemplate.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add or remove the skills used by this template. Your profile
                  details always come from Your Information.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCustomization}
                disabled={isSavingCustomization}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Close customization"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Skills Used in This Template
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Add or remove skills freely. The first six are highlighted
                      in role-targeted email layouts.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {customizationDraft.skills.length}/50
                  </span>
                </div>

                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newCustomizationSkill}
                    placeholder="Add a skill, e.g. Docker"
                    onChange={event => setNewCustomizationSkill(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCustomizationSkill();
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#3b3be3] focus:ring-2 focus:ring-[#3b3be3]/20 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={addCustomizationSkill}
                    disabled={!newCustomizationSkill.trim()}
                    className="rounded-lg bg-[#3b3be3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f2fb8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex min-h-16 flex-wrap gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-3 dark:border-gray-700 dark:bg-gray-800/40">
                  {customizationDraft.skills.length > 0 ? (
                    customizationDraft.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeCustomizationSkill(skill)}
                          className="text-indigo-500 transition hover:text-red-600 dark:text-indigo-300 dark:hover:text-red-400"
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="self-center text-sm text-gray-500 dark:text-gray-400">
                      No skills selected. Add the skills you want this email to highlight.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
              <button
                type="button"
                onClick={closeCustomization}
                disabled={isSavingCustomization}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomization}
                disabled={isSavingCustomization}
                className="rounded-lg bg-[#3b3be3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f2fb8] disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingCustomization ? 'Saving...' : 'Save & Use Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewEmail && previewTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {TEMPLATE_METADATA.find(t => t.id === previewTemplate)?.name}{' '}
                  Preview
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Generated with your resume data
                </p>
              </div>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
              <div className="mb-4 p-4 bg-blue-50 dark:bg-[#818cf8]/10 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Subject:
                </p>
                <p className="text-gray-900 dark:text-gray-100">{previewEmail.subject}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {previewEmail.bodyText}
                </pre>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  💡 This preview uses sample company details (Example Company,
                  Software Developer). When you send an email, it will use your
                  actual job application details.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
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
