'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextArea as Textarea } from '@/components/ui/textfield';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { exportCoverLetterDocx, exportCoverLetterPdf } from '@/lib/coverLetterExport';
import {
  stripLeadingGreeting,
  type CoverLetter,
  type CoverLetterLength,
  type CoverLetterTemplate,
  type CoverLetterTone,
} from '@/lib/coverLetter';
import {
  listResumeProfiles,
  loadResumeData,
  type ResumeData,
  type ResumeProfileSummary,
} from '@/lib/resumeDataService';
import { showToast } from '@/lib/toast';
import {
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const tones: CoverLetterTone[] = [
  'professional',
  'confident',
  'friendly',
  'concise',
  'enthusiastic',
];
const lengths: CoverLetterLength[] = ['short', 'standard', 'detailed'];
const emptyLetter = {
  companyName: '',
  position: '',
  jobUrl: '',
  jobDescription: '',
  length: 'standard' as CoverLetterLength,
  tone: 'professional' as CoverLetterTone,
  additionalInstructions: '',
  hiringManagerName: '',
  hiringManagerTitle: '',
  companyAddress: '',
  includeContactHeader: true,
  template: 'minimal' as CoverLetterTemplate,
};
const templates: {
  id: CoverLetterTemplate;
  name: string;
  description: string;
}[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Quiet, ATS-first hierarchy',
  },
  {
    id: 'corporate',
    name: 'Structured',
    description: 'Conventional recruiter spacing',
  },
  {
    id: 'editorial',
    name: 'Modern',
    description: 'Refined contemporary type',
  },
];

export default function CoverLetter() {
  const { user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<ResumeProfileSummary[]>([]);
  const [profileId, setProfileId] = useState('');
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [form, setForm] = useState(emptyLetter);
  const [letterName, setLetterName] = useState('');
  const [content, setContent] = useState('');
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [history, setHistory] = useState<CoverLetter[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>(
    'editor'
  );
  const [jobUrl, setJobUrl] = useState('');
  const selectedProfile = useMemo(
    () => profiles.find(p => p.profileId === profileId),
    [profiles, profileId]
  );

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      listResumeProfiles(user.uid),
      fetch(`/api/cover-letter?userId=${encodeURIComponent(user.uid)}`).then(r =>
        r.json()
      ),
    ])
      .then(async ([listed, saved]) => {
        setProfiles(listed);
        const defaultProfile = listed.find(p => p.isDefault) || listed[0];
        if (defaultProfile) {
          setProfileId(defaultProfile.profileId);
          setResume(await loadResumeData(user.uid, defaultProfile.profileId));
        }
        setHistory(saved.coverLetters || []);
      })
      .catch(() => showToast('error', 'Could not load cover letter workspace'));
  }, [user?.uid]);

  const chooseProfile = async (id: string) => {
    setProfileId(id);
    if (user?.uid) setResume(await loadResumeData(user.uid, id));
  };

  const importJob = async () => {
    if (!jobUrl.trim()) return;
    setIsImporting(true);
    try {
      const response = await fetch('/api/job-url/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not import that job.');
      setForm(prev => ({
        ...prev,
        jobUrl,
        companyName: data.companyName || prev.companyName,
        position: data.position || prev.position,
        jobDescription: data.jobDescription || prev.jobDescription,
      }));
      showToast('success', 'Job details imported');
    } catch (error) {
      showToast(
        'error',
        'Job import failed',
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsImporting(false);
    }
  };

  const generate = async () => {
    if (!user?.uid || !profileId || !form.companyName || !form.position) return;
    setIsBusy(true);
    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, profileId, ...form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed.');
      setContent(stripLeadingGreeting(data.content));
      setIsEditing(false);
      setMobilePanel('preview');
      showToast('success', 'Cover letter generated');
    } catch (error) {
      showToast(
        'error',
        'Could not generate cover letter',
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsBusy(false);
    }
  };

  const save = async () => {
    if (!user?.uid || !content) return;
    setIsBusy(true);
    try {
      const cleanContent = stripLeadingGreeting(content);
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          profileId,
          profileName: selectedProfile?.profileName,
          name: letterName,
          ...form,
          content: cleanContent,
          id: currentId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setCurrentId(data.coverLetter.id);
      setContent(cleanContent);
      setHistory(prev => [
        data.coverLetter,
        ...prev.filter(item => item.id !== data.coverLetter.id),
      ]);
      showToast('success', 'Cover letter saved');
    } catch (error) {
      showToast(
        'error',
        'Could not save cover letter',
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (!currentId || !content || !user?.uid) return;
    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            profileId,
            profileName: selectedProfile?.profileName,
            name: letterName,
            ...form,
            content: stripLeadingGreeting(content),
            id: currentId,
          }),
        });
      } catch (error) {
        console.error('Cover letter autosave failed:', error);
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [content, currentId, form, profileId, selectedProfile?.profileName, user?.uid, letterName]);

  const openLetter = (letter: CoverLetter) => {
    setCurrentId(letter.id);
    setProfileId(letter.profileId);
    setContent(stripLeadingGreeting(letter.content));
    setLetterName(letter.name || `${letter.companyName} - ${letter.position}`);
    setForm({ ...emptyLetter, ...letter });
    setMobilePanel('preview');
  };

  const deleteLetter = async (id: string) => {
    if (!user?.uid) return;
    const response = await fetch(
      `/api/cover-letter?userId=${encodeURIComponent(user.uid)}&id=${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    if (response.ok) setHistory(prev => prev.filter(item => item.id !== id));
  };

  const canGenerate = Boolean(
    profileId && form.companyName.trim() && form.position.trim()
  );
  const name = resume?.personalInfo.fullName || 'Your Name';
  const previewContent =
    content ||
    `I am excited to apply for the ${form.position || 'Target Position'} role at ${form.companyName || 'Target Company'}. My background and experience are aligned with the responsibilities described for this opportunity.\n\nMy experience has given me practical skills that can contribute to this role. I would welcome the opportunity to discuss how my background, relevant projects, and approach to delivering quality work could support your team.\n\nThank you for considering my application. I look forward to the opportunity to discuss the position further.`;
  const previewIsPlaceholder = !content;

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Sign in to build cover letters</CardTitle>
          <CardDescription>
            Your saved resume profiles and cover letters are available after
            signing in.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const regenerate = async () => {
    if (
      isEditing &&
      content &&
      !window.confirm('Regenerate and replace the current edited letter?')
    )
      return;
    await generate();
  };

  const renderDocument = (fullSize = false) => (
    <div
      className={`mx-auto w-full max-w-[780px] ${
        fullSize ? 'p-8 sm:p-12' : 'min-h-[760px] p-7 sm:p-10'
      } border border-slate-200/80 bg-white text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.08)] ${
        form.template === 'corporate'
          ? 'border-t-4 border-t-blue-700'
          : form.template === 'editorial'
            ? 'border-t-4 border-t-indigo-600'
            : 'border-t-4 border-t-slate-500'
      }`}
    >
      {isEditing && !fullSize ? (
        <Textarea
          className="min-h-[680px] resize-none border-0 p-0 text-sm leading-7 shadow-none focus-visible:ring-0"
          value={content}
          onChange={e => setContent(e.target.value)}
          aria-label="Edit cover letter"
        />
      ) : (
        <div
          className={`text-[13px] leading-6 ${
            previewIsPlaceholder ? 'text-slate-400' : 'text-slate-900'
          }`}
        >
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Application Version · ATS-friendly
          </div>
          {form.includeContactHeader && (
            <>
              <h1 className="text-xl font-semibold text-slate-900">{name}</h1>
              <p className="text-sm text-slate-500">
                {[
                  resume?.personalInfo.email,
                  resume?.personalInfo.phone,
                  resume?.personalInfo.location,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'email · phone · location'}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {form.position || 'Target Position'}
              </p>
            </>
          )}
          <p className="my-6 text-sm">
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm">
            {form.hiringManagerName || 'Hiring Manager'}
            <br />
            {form.hiringManagerTitle || 'Hiring Manager'}
            <br />
            {form.companyName || 'Target Company'}
            <br />
            {form.companyAddress || 'Company address'}
          </p>
          <p className="mt-5 text-sm">
            Dear {form.hiringManagerName || 'Hiring Manager'},
          </p>
          {previewContent.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index} className="mt-3 whitespace-pre-wrap text-justify">
              {paragraph}
            </p>
          ))}
          <p className="mt-6 text-sm">
            Sincerely,
            <br />
            {name}
          </p>
        </div>
      )}
    </div>
  );

  const toolbarButton =
    'h-8 rounded-lg border-slate-200 bg-white px-2.5 text-[11px] font-medium shadow-none transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700';

  return (
    <div className="flex h-full min-h-0 w-full flex-col px-4 py-3 sm:px-6 lg:px-8">
      <header className="mb-3 flex shrink-0 flex-col gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Writing workspace
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-2xl">
            Cover Letter Builder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a truthful, job-specific letter from your resume profile.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] text-slate-500">
            {isBusy ? 'Working…' : currentId ? 'Saved draft' : 'Draft ready'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setShowHistory(true)}
          >
            <FileText /> My Cover Letters ({history.length})
          </Button>
          {content && (
            <Button
              size="sm"
              variant="outline"
              className={toolbarButton}
              onClick={() => setShowFullPreview(true)}
            >
              Full Preview
            </Button>
          )}
        </div>
      </header>

      <div className="mb-3 flex shrink-0 items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 p-1 lg:hidden">
        {(['editor', 'preview'] as const).map(panel => (
          <button
            key={panel}
            type="button"
            onClick={() => setMobilePanel(panel)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize ${
              mobilePanel === panel
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500'
            }`}
          >
            {panel}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[minmax(360px,0.42fr)_minmax(0,0.58fr)]">
        <section
          className={`min-h-0 overflow-y-auto pr-1 ${
            mobilePanel === 'preview' ? 'hidden lg:block' : ''
          }`}
          aria-label="Cover letter configuration"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Configure
              </h2>
              <p className="text-xs text-slate-500">
                Set the context before generating your letter.
              </p>
            </div>
            <Select value={profileId} onValueChange={chooseProfile}>
              <SelectTrigger className="h-8 w-[150px] border-slate-200 text-xs">
                <SelectValue placeholder="Resume profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.profileId} value={profile.profileId}>
                    {profile.profileName}
                    {profile.isDefault ? ' (Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {resume && (
            <p className="mb-4 text-[11px] text-slate-500">
              {resume.personalInfo.fullName || 'Unnamed'} ·{' '}
              {resume.skills.selectedSkills?.slice(0, 4).join(', ') ||
                'No skills added'}{' '}
              · {resume.workExperiences?.length || 0} experience entries
            </p>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Letter style</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {templates.map(template => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => update('template', template.id)}
                    className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                      form.template === template.id
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {templates.find(template => template.id === form.template)?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="job-url" className="text-xs">
                Job posting URL
              </Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="job-url"
                  value={jobUrl}
                  onChange={e => setJobUrl(e.target.value)}
                  placeholder="Paste a job listing URL"
                  className="h-9 bg-slate-50 text-xs dark:bg-slate-900"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={importJob}
                  disabled={isImporting || !jobUrl.trim()}
                >
                  {isImporting ? <Loader2 className="animate-spin" /> : 'Import'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company" className="text-xs">
                  Company *
                </Label>
                <Input
                  id="company"
                  value={form.companyName}
                  onChange={e => update('companyName', e.target.value)}
                  placeholder="Google"
                  className="mt-1.5 h-9 bg-slate-50 text-xs dark:bg-slate-900"
                />
              </div>
              <div>
                <Label htmlFor="position" className="text-xs">
                  Position *
                </Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={e => update('position', e.target.value)}
                  placeholder="Software Engineer"
                  className="mt-1.5 h-9 bg-slate-50 text-xs dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-xs">
                  Job description
                </Label>
                <span className="text-[10px] text-slate-400">
                  {form.jobDescription.length.toLocaleString()} / 30,000
                </span>
              </div>
              <Textarea
                id="description"
                value={form.jobDescription}
                onChange={e => update('jobDescription', e.target.value)}
                maxLength={30000}
                rows={5}
                placeholder="Paste the role requirements for a more targeted letter..."
                className="mt-1.5 resize-y bg-slate-50 text-xs leading-5 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Length</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-0.5 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                  {lengths.map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update('length', value)}
                      className={`rounded-md px-1 py-1.5 text-[11px] capitalize ${
                        form.length === value
                          ? 'bg-white font-medium text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Tone</Label>
                <Select
                  value={form.tone}
                  onValueChange={value => update('tone', value)}
                >
                  <SelectTrigger className="mt-1.5 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(value => (
                      <SelectItem key={value} value={value}>
                        {value[0].toUpperCase() + value.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <details className="border-t border-slate-200/80 pt-3 dark:border-slate-800">
              <summary className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200">
                Advanced instructions
              </summary>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={form.hiringManagerName}
                    onChange={e => update('hiringManagerName', e.target.value)}
                    placeholder="Hiring manager name"
                    className="h-9 text-xs"
                  />
                  <Input
                    value={form.hiringManagerTitle}
                    onChange={e => update('hiringManagerTitle', e.target.value)}
                    placeholder="Hiring manager title"
                    className="h-9 text-xs"
                  />
                </div>
                <Input
                  value={form.companyAddress}
                  onChange={e => update('companyAddress', e.target.value)}
                  placeholder="Company address"
                  className="h-9 text-xs"
                />
                <Textarea
                  value={form.additionalInstructions}
                  onChange={e => update('additionalInstructions', e.target.value)}
                  placeholder="Highlight a relevant project, skill, or achievement..."
                  rows={3}
                  className="resize-y text-xs"
                />
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.includeContactHeader}
                    onChange={e =>
                      update('includeContactHeader', e.target.checked)
                    }
                  />
                  Include contact header
                </label>
              </div>
            </details>
          </div>

          <div className="sticky bottom-0 mt-5 flex flex-col gap-2 border-t border-slate-200 bg-white/95 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Label htmlFor="letter-name" className="text-xs">
                Cover letter name
              </Label>
              <Input
                id="letter-name"
                value={letterName}
                onChange={e => setLetterName(e.target.value)}
                placeholder="e.g. Google Software Engineer"
                className="mt-1 h-9 bg-slate-50 text-xs dark:bg-slate-900"
              />
            </div>
            <Button
              className="h-9 shrink-0 bg-indigo-600 text-xs hover:bg-indigo-700"
              disabled={!canGenerate || isBusy}
              onClick={generate}
            >
              {isBusy ? (
                <>
                  <Loader2 className="animate-spin" /> Writing…
                </>
              ) : (
                <>
                  <Sparkles /> Generate
                </>
              )}
            </Button>
          </div>
        </section>

        <section
          className={`min-h-0 min-w-0 flex-col overflow-hidden border-l border-slate-200/80 pl-0 lg:flex lg:pl-6 dark:border-slate-800 ${
            mobilePanel === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
          aria-label="Cover letter preview"
        >
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Live preview
              </h2>
              <p className="text-xs text-slate-500">
                {content
                  ? 'ATS-friendly single-column application version'
                  : 'Generate to replace the sample copy'}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className={toolbarButton}
                onClick={() => setShowFullPreview(true)}
              >
                Full preview
              </Button>
              {content && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={() =>
                      navigator.clipboard
                        .writeText(content)
                        .then(() =>
                          showToast('success', 'Cover letter copied to clipboard')
                        )
                        .catch(() =>
                          showToast('error', 'Clipboard access failed')
                        )
                    }
                  >
                    <Copy /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={() => save()}
                    disabled={isBusy}
                  >
                    <Save /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={() => {
                      try {
                        exportCoverLetterPdf(
                          {
                            ...form,
                            id: currentId || '',
                            profileId,
                            content,
                            createdAt: '',
                            updatedAt: '',
                          },
                          resume
                        );
                      } catch (error) {
                        showToast(
                          'error',
                          'PDF export failed',
                          error instanceof Error ? error.message : undefined
                        );
                      }
                    }}
                  >
                    <Download /> PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={() =>
                      exportCoverLetterDocx(
                        {
                          ...form,
                          id: currentId || '',
                          profileId,
                          content,
                          createdAt: '',
                          updatedAt: '',
                        },
                        resume
                      ).catch(() => showToast('error', 'DOCX export failed'))
                    }
                  >
                    <Download /> DOCX
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={toolbarButton}
                    onClick={regenerate}
                  >
                    <RefreshCw /> Regenerate
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-slate-50/80 p-3 sm:p-5 dark:bg-slate-900/50">
            {renderDocument()}
          </div>
        </section>
      </div>

      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cover Letter Preview</DialogTitle>
            <DialogDescription>
              Review the complete letter before saving or exporting.
            </DialogDescription>
          </DialogHeader>
          {renderDocument(true)}
        </DialogContent>
      </Dialog>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Cover Letters</DialogTitle>
            <DialogDescription>
              Open, edit, or remove saved letters.
            </DialogDescription>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Saved cover letters will appear here.
            </p>
          ) : (
            <div className="divide-y">
              {history.map(letter => (
                <div
                  key={letter.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {letter.name || `${letter.companyName} - ${letter.position}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {letter.companyName} · {letter.position}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                        {letter.profileName || letter.profileId}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Created {new Date(letter.createdAt).toLocaleString()}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Updated {new Date(letter.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        openLetter(letter);
                        setShowHistory(false);
                      }}
                    >
                      Open
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete cover letter"
                      onClick={() => deleteLetter(letter.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
