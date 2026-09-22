'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextArea as Textarea } from '@/components/ui/textfield';
import { useAuth } from '@/contexts/AuthContext';
import { exportCoverLetterDocx, exportCoverLetterPdf } from '@/lib/coverLetterExport';
import { type CoverLetter, type CoverLetterLength, type CoverLetterTemplate, type CoverLetterTone } from '@/lib/coverLetter';
import { listResumeProfiles, loadResumeData, type ResumeData, type ResumeProfileSummary } from '@/lib/resumeDataService';
import { showToast } from '@/lib/toast';
import { Copy, Download, FileText, Loader2, RefreshCw, Save, Sparkles, Trash2, Palette } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const tones: CoverLetterTone[] = ['professional', 'confident', 'friendly', 'concise', 'enthusiastic'];
const lengths: CoverLetterLength[] = ['short', 'standard', 'detailed'];
const emptyLetter = { companyName: '', position: '', jobUrl: '', jobDescription: '', length: 'standard' as CoverLetterLength, tone: 'professional' as CoverLetterTone, additionalInstructions: '', hiringManagerName: '', hiringManagerTitle: '', companyAddress: '', includeContactHeader: true, template: 'minimal' as CoverLetterTemplate };
const templates: { id: CoverLetterTemplate; name: string; description: string; className: string }[] = [
  { id: 'minimal', name: 'Minimal Mono', description: 'Elegant grayscale with a clean sidebar feel', className: 'border-slate-400 bg-slate-50' },
  { id: 'corporate', name: 'Blue Corporate', description: 'Confident blue rail and structured header', className: 'border-blue-500 bg-blue-50' },
  { id: 'editorial', name: 'Red Editorial', description: 'Bold red accents with a premium letterhead', className: 'border-red-500 bg-red-50' },
];

export default function CoverLetter() {
  const { user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<ResumeProfileSummary[]>([]);
  const [profileId, setProfileId] = useState('');
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [form, setForm] = useState(emptyLetter);
  const [content, setContent] = useState('');
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [history, setHistory] = useState<CoverLetter[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jobUrl, setJobUrl] = useState('');
  const selectedProfile = useMemo(() => profiles.find(p => p.profileId === profileId), [profiles, profileId]);

  const update = (key: keyof typeof form, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([listResumeProfiles(user.uid), fetch(`/api/cover-letter?userId=${encodeURIComponent(user.uid)}`).then(r => r.json())]).then(async ([listed, saved]) => {
      setProfiles(listed);
      const defaultProfile = listed.find(p => p.isDefault) || listed[0];
      if (defaultProfile) { setProfileId(defaultProfile.profileId); setResume(await loadResumeData(user.uid, defaultProfile.profileId)); }
      setHistory(saved.coverLetters || []);
    }).catch(() => showToast('error', 'Could not load cover letter workspace'));
  }, [user?.uid]);

  const chooseProfile = async (id: string) => {
    setProfileId(id);
    if (user?.uid) setResume(await loadResumeData(user.uid, id));
  };

  const importJob = async () => {
    if (!jobUrl.trim()) return;
    setIsImporting(true);
    try {
      const response = await fetch('/api/job-url/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: jobUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not import that job.');
      setForm(prev => ({ ...prev, jobUrl, companyName: data.companyName || prev.companyName, position: data.position || prev.position, jobDescription: data.jobDescription || prev.jobDescription }));
      showToast('success', 'Job details imported');
    } catch (error) { showToast('error', 'Job import failed', error instanceof Error ? error.message : undefined); } finally { setIsImporting(false); }
  };

  const generate = async () => {
    if (!user?.uid || !profileId || !form.companyName || !form.position || !form.jobDescription) return;
    setIsBusy(true);
    try {
      const response = await fetch('/api/cover-letter/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, profileId, ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed.');
      setContent(data.content); setIsEditing(false); showToast('success', 'Cover letter generated');
    } catch (error) { showToast('error', 'Could not generate cover letter', error instanceof Error ? error.message : undefined); } finally { setIsBusy(false); }
  };

  const save = async () => {
    if (!user?.uid || !content) return;
    setIsBusy(true);
    try {
      const response = await fetch('/api/cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, profileId, profileName: selectedProfile?.profileName, ...form, content, id: currentId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setCurrentId(data.coverLetter.id); setHistory(prev => [data.coverLetter, ...prev.filter(item => item.id !== data.coverLetter.id)]); showToast('success', 'Cover letter saved');
    } catch (error) { showToast('error', 'Could not save cover letter', error instanceof Error ? error.message : undefined); } finally { setIsBusy(false); }
  };

  useEffect(() => {
    if (!currentId || !content || !user?.uid) return;
    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, profileId, profileName: selectedProfile?.profileName, ...form, content, id: currentId }) });
      } catch (error) {
        console.error('Cover letter autosave failed:', error);
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [content, currentId, form, profileId, selectedProfile?.profileName, user?.uid]);

  const openLetter = (letter: CoverLetter) => { setCurrentId(letter.id); setProfileId(letter.profileId); setContent(letter.content); setForm({ ...emptyLetter, ...letter }); };
  const deleteLetter = async (id: string) => { if (!user?.uid) return; const response = await fetch(`/api/cover-letter?userId=${encodeURIComponent(user.uid)}&id=${encodeURIComponent(id)}`, { method: 'DELETE' }); if (response.ok) setHistory(prev => prev.filter(item => item.id !== id)); };
  const canGenerate = Boolean(profileId && form.companyName.trim() && form.position.trim() && form.jobDescription.trim());
  const name = resume?.personalInfo.fullName || 'Your Name';

  if (!isAuthenticated) return <Card className="mx-auto max-w-xl"><CardHeader><CardTitle>Sign in to build cover letters</CardTitle><CardDescription>Your saved resume profiles and cover letters are available after signing in.</CardDescription></CardHeader></Card>;

  const regenerate = async () => {
    if (isEditing && content && !window.confirm('Regenerate and replace the current edited letter?')) return;
    await generate();
  };

  return <div className="mx-auto max-w-7xl space-y-5">
    <div><h2 className="text-2xl font-semibold tracking-tight">Cover Letter Builder</h2><p className="text-sm text-muted-foreground">Create a truthful, job-specific letter from any saved resume profile.</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
      <Card><CardHeader><CardTitle>Job details</CardTitle><CardDescription>Choose a profile, import a posting, or enter details manually.</CardDescription></CardHeader><CardContent className="space-y-4">
        <div><Label>Resume Profile</Label><Select value={profileId} onValueChange={chooseProfile}><SelectTrigger><SelectValue placeholder="Select a resume profile" /></SelectTrigger><SelectContent>{profiles.map(p => <SelectItem key={p.profileId} value={p.profileId}>{p.profileName}{p.isDefault ? ' (Default)' : ''}</SelectItem>)}</SelectContent></Select>{resume && <p className="mt-2 text-xs text-muted-foreground">{resume.personalInfo.fullName || 'Unnamed'} · {resume.skills.selectedSkills?.slice(0, 4).join(', ') || 'No skills added'} · {resume.workExperiences?.length || 0} experience entries</p>}</div>
        <div><div className="mb-2 flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /><Label>Letter Template</Label></div><div className="grid gap-2">{templates.map(template => <button type="button" key={template.id} onClick={() => update('template', template.id)} className={`rounded-xl border-2 p-3 text-left transition-all ${form.template === template.id ? `${template.className} ring-2 ring-primary/30` : 'border-border bg-background hover:border-primary/40'}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold">{template.name}</span>{form.template === template.id && <span className="text-xs font-medium text-primary">Selected</span>}</div><p className="mt-1 text-xs text-muted-foreground">{template.description}</p></button>)}</div></div>
        <div><Label htmlFor="job-url">Job Posting URL</Label><div className="flex gap-2"><Input id="job-url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://company.com/jobs/software-engineer" /><Button type="button" variant="outline" onClick={importJob} disabled={isImporting || !jobUrl.trim()}>{isImporting ? <Loader2 className="animate-spin" /> : 'Import'}</Button></div></div>
        <div><Label htmlFor="company">Company *</Label><Input id="company" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Google" /></div>
        <div><Label htmlFor="position">Position *</Label><Input id="position" value={form.position} onChange={e => update('position', e.target.value)} placeholder="Software Engineer" /></div>
        <div><Label htmlFor="description">Job Description <span className="text-destructive">*</span></Label><Textarea id="description" value={form.jobDescription} onChange={e => update('jobDescription', e.target.value)} maxLength={30000} rows={8} placeholder="Paste the job description here..." className="mt-1.5 resize-y leading-5" /><p className="mt-1 text-right text-xs text-muted-foreground">{form.jobDescription.length.toLocaleString()} / 30,000</p></div>
        <div><Label>Length</Label><div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">{lengths.map(value => <Button key={value} type="button" variant={form.length === value ? 'default' : 'ghost'} size="sm" className={`h-9 text-xs ${form.length === value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`} onClick={() => update('length', value)}>{value[0].toUpperCase() + value.slice(1)}</Button>)}</div><p className="mt-1 text-xs text-muted-foreground">{form.length === 'short' ? '150-220 words · concise application' : form.length === 'detailed' ? '400-550 words · expanded context' : '250-350 words · recommended default'}</p></div>
        <div><Label>Tone</Label><Select value={form.tone} onValueChange={value => update('tone', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tones.map(value => <SelectItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent></Select></div>
        <details><summary className="cursor-pointer text-sm font-medium">Letter details and instructions</summary><div className="mt-3 space-y-3"><Input value={form.hiringManagerName} onChange={e => update('hiringManagerName', e.target.value)} placeholder="Hiring manager name (optional)" /><Input value={form.hiringManagerTitle} onChange={e => update('hiringManagerTitle', e.target.value)} placeholder="Hiring manager title (optional)" /><Input value={form.companyAddress} onChange={e => update('companyAddress', e.target.value)} placeholder="Company address (optional)" /><Textarea value={form.additionalInstructions} onChange={e => update('additionalInstructions', e.target.value)} placeholder="Additional instructions, such as highlight my React experience..." rows={3} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.includeContactHeader} onChange={e => update('includeContactHeader', e.target.checked)} /> Include contact header</label></div></details>
        <Button className="w-full" size="lg" disabled={!canGenerate || isBusy} onClick={generate}>{isBusy ? <><Loader2 className="animate-spin" /> Writing your cover letter...</> : <><Sparkles /> Generate Cover Letter</>}</Button>
      </CardContent></Card>
      <Card className="bg-muted/30"><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Preview</CardTitle><CardDescription>{content ? 'Edit the letter before saving or downloading.' : 'Your cover letter will appear here.'}</CardDescription></div>{content && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}><FileText /> {isEditing ? 'Preview' : 'Edit'}</Button><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(content).then(() => showToast('success', 'Cover letter copied to clipboard')).catch(() => showToast('error', 'Clipboard access failed'))}><Copy /> Copy</Button><Button size="sm" variant="outline" onClick={() => save()} disabled={isBusy}><Save /> Save</Button><Button size="sm" variant="outline" onClick={() => { try { exportCoverLetterPdf({ ...form, id: currentId || '', profileId, content, createdAt: '', updatedAt: '' }, resume); } catch (error) { showToast('error', 'PDF export failed', error instanceof Error ? error.message : undefined); } }}><Download /> PDF</Button><Button size="sm" variant="outline" onClick={() => exportCoverLetterDocx({ ...form, id: currentId || '', profileId, content, createdAt: '', updatedAt: '' }, resume).catch(() => showToast('error', 'DOCX export failed'))}><Download /> DOCX</Button><Button size="sm" variant="outline" onClick={regenerate}><RefreshCw /> Regenerate</Button></div>}</CardHeader><CardContent><div className={`mx-auto min-h-[560px] max-w-[760px] p-8 text-slate-900 shadow-sm sm:p-12 ${form.template === 'corporate' ? 'border-l-8 border-blue-700 bg-white' : form.template === 'editorial' ? 'border-t-8 border-red-600 bg-white' : 'bg-white'}`}>{content ? isEditing ? <Textarea className="min-h-[480px] resize-y border-0 p-0 text-[15px] leading-7 shadow-none focus-visible:ring-0" value={content} onChange={e => setContent(e.target.value)} /> : <><div>{form.includeContactHeader && <><h1 className={`text-xl font-semibold ${form.template === 'editorial' ? 'uppercase tracking-[0.2em]' : form.template === 'corporate' ? 'text-blue-700' : 'tracking-[0.15em]'}`}>{name}</h1><p className="text-sm text-slate-500">{[resume?.personalInfo.email, resume?.personalInfo.phone, resume?.personalInfo.location].filter(Boolean).join(' · ')}</p><p className={`mt-1 text-xs font-semibold ${form.template === 'editorial' ? 'text-red-600' : form.template === 'corporate' ? 'text-blue-700' : 'text-slate-500'}`}>{form.position}</p></>}<p className="my-8 text-sm">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p className="text-sm">{form.hiringManagerName || 'Hiring Manager'}<br />{form.hiringManagerTitle}<br />{form.companyName}<br />{form.companyAddress}</p><p className="mt-6 text-[15px]">Dear {form.hiringManagerName || 'Hiring Manager'},</p>{content.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="mt-4 whitespace-pre-wrap text-[15px] leading-7">{paragraph}</p>)}<p className="mt-8 text-[15px]">Sincerely,<br />{name}</p></div></> : <div className="flex min-h-[480px] flex-col items-center justify-center text-center text-muted-foreground"><Sparkles className="mb-3 h-10 w-10" /><h3 className="font-medium">Your cover letter will appear here</h3><p className="mt-1 max-w-sm text-sm">Select a resume, add job details, and let AI create a personalized letter.</p></div>}</div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>My Cover Letters</CardTitle><CardDescription>Open, edit, or remove saved letters.</CardDescription></CardHeader><CardContent>{history.length === 0 ? <p className="text-sm text-muted-foreground">Saved cover letters will appear here.</p> : <div className="divide-y">{history.map(letter => <div key={letter.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{letter.companyName} · {letter.position}</p><p className="text-xs text-muted-foreground">{letter.profileName || letter.profileId} · {new Date(letter.updatedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => openLetter(letter)}>Open</Button><Button size="icon" variant="ghost" aria-label="Delete cover letter" onClick={() => deleteLetter(letter.id)}><Trash2 /></Button></div></div>)}</div>}</CardContent></Card>
  </div>;
}
