import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { CoverLetter, CoverLetterTemplate } from '@/lib/coverLetter';
import { getCoverLetterFilename } from '@/lib/coverLetter';
import type { ResumeData } from '@/lib/resumeDataService';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

export function exportCoverLetterPdf(letter: CoverLetter, resume: ResumeData | null) {
  const name = resume?.personalInfo.fullName || 'Applicant';
  const contact = [resume?.personalInfo.email, resume?.personalInfo.phone, resume?.personalInfo.location].filter(Boolean).join(' · ');
  const paragraphs = letter.content.split(/\n\s*\n/).map(p => `<p>${htmlEscape(p).replace(/\n/g, '<br>')}</p>`).join('');
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Please allow popups to export the PDF.');
  const theme = letter.template || 'minimal';
  const styles = theme === 'corporate'
    ? `body{border-left:9px solid #1555b5;padding-left:30px;font-family:Arial;color:#26364b}header{border-bottom:2px solid #1555b5;padding-bottom:22px}h1{color:#1555b5} .accent{color:#1555b5}`
    : theme === 'editorial'
      ? `body{font-family:Arial;color:#252525;border-top:10px solid #d71920;padding-top:28px}header{border-bottom:1px solid #d71920;padding-bottom:22px}h1{letter-spacing:3px;text-transform:uppercase}.accent{color:#d71920}`
      : theme === 'executive'
        ? `body{border-top:8px solid #172554;padding-top:18px;font-family:Arial;color:#1e293b}header{border-bottom:1px solid #cbd5e1;padding-bottom:18px}h1{color:#172554}.accent{color:#4338ca}`
        : theme === 'modern'
          ? `body{font-family:Arial;color:#164e63}header{border-left:5px solid #0f766e;padding-left:18px;border-bottom:1px solid #99f6e4;padding-bottom:18px}h1{color:#0f766e}.accent{color:#0f766e}`
          : theme === 'classic'
            ? `body{font-family:Georgia,serif;color:#303030}header{border-bottom:1px solid #c9b18b;padding-bottom:18px}h1{font-size:19pt}.accent{color:#8a5a16}`
            : `body{font-family:Arial;color:#303030}header{border-bottom:1px solid #cfcfcf;padding-bottom:18px}h1{letter-spacing:3px;text-transform:uppercase}.accent{color:#555}`;
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cover Letter</title><style>@page{size:A4;margin:16mm}body{font-size:10pt;line-height:1.42;max-height:265mm;overflow:hidden}header{margin-bottom:18px}h1{font-size:18pt;margin:0 0 4pt}.muted{color:#526071;font-size:9pt}.date{margin:14pt 0}p{margin:0 0 8pt}.closing{margin-top:14pt}.accent{font-weight:bold}</style><style>${styles}</style></head><body>${letter.includeContactHeader ? `<header><h1>${htmlEscape(name)}</h1><div class="muted">${htmlEscape(contact)}</div><div class="accent">${htmlEscape(letter.position)}</div></header>` : ''}<div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div><div>${htmlEscape(letter.hiringManagerName || 'Hiring Manager')}<br>${htmlEscape(letter.hiringManagerTitle || '')}<br>${htmlEscape(letter.companyName)}<br>${htmlEscape(letter.companyAddress || '')}</div><p>Dear ${htmlEscape(letter.hiringManagerName || 'Hiring Manager')},</p>${paragraphs}<p class="closing">Sincerely,<br>${htmlEscape(name)}</p></body></html>`);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
}

export async function exportCoverLetterDocx(letter: CoverLetter, resume: ResumeData | null) {
  const name = resume?.personalInfo.fullName || 'Applicant';
  const contact = [resume?.personalInfo.email, resume?.personalInfo.phone, resume?.personalInfo.location].filter(Boolean).join(' · ');
  const accent = letter.template === 'editorial' ? 'D71920' : letter.template === 'corporate' ? '1555B5' : '555555';
  const children = [
    ...(letter.includeContactHeader ? [new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 34, color: accent, allCaps: letter.template === 'editorial' })] }), new Paragraph({ children: [new TextRun({ text: `${contact}\n${letter.position}`, color: '526071' })] })] : []),
    new Paragraph({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), spacing: { before: 360, after: 360 } }),
    new Paragraph({ children: [new TextRun(letter.hiringManagerName || 'Hiring Manager'), new TextRun({ text: `\n${letter.hiringManagerTitle || ''}\n${letter.companyName}\n${letter.companyAddress || ''}` })] }),
    new Paragraph({ text: `Dear ${letter.hiringManagerName || 'Hiring Manager'},`, spacing: { before: 360, after: 240 } }),
    ...letter.content.split(/\n\s*\n/).map(text => new Paragraph({ text, spacing: { after: 240 }, style: 'Normal' })),
    new Paragraph({ text: `Sincerely,\n${name}`, spacing: { before: 240 } }),
  ];
  const document = new Document({ sections: [{ properties: {}, children }], styles: { default: { document: { run: { font: 'Arial', size: 22 } } } } });
  const blob = await Packer.toBlob(document);
  download(blob, getCoverLetterFilename(name, letter.companyName, letter.position, 'docx'));
}
