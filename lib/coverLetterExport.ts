import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { CoverLetter } from '@/lib/coverLetter';
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
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cover Letter</title><style>@page{size:A4;margin:22mm}body{font-family:Arial,sans-serif;color:#172033;font-size:11pt;line-height:1.6}h1{font-size:20pt;margin:0 0 4pt}h2{font-size:11pt;margin:22pt 0 4pt}p{margin:0 0 12pt}.muted{color:#526071;font-size:10pt}.date{margin:22pt 0}.closing{margin-top:22pt}</style></head><body>${letter.includeContactHeader ? `<h1>${htmlEscape(name)}</h1><div class="muted">${htmlEscape(contact)}</div>` : ''}<div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div><div>${htmlEscape(letter.hiringManagerName || 'Hiring Manager')}<br>${htmlEscape(letter.hiringManagerTitle || '')}<br>${htmlEscape(letter.companyName)}<br>${htmlEscape(letter.companyAddress || '')}</div><p>Dear ${htmlEscape(letter.hiringManagerName || 'Hiring Manager')},</p>${paragraphs}<p class="closing">Sincerely,<br>${htmlEscape(name)}</p></body></html>`);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
}

export async function exportCoverLetterDocx(letter: CoverLetter, resume: ResumeData | null) {
  const name = resume?.personalInfo.fullName || 'Applicant';
  const contact = [resume?.personalInfo.email, resume?.personalInfo.phone, resume?.personalInfo.location].filter(Boolean).join(' · ');
  const children = [
    ...(letter.includeContactHeader ? [new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 34 })] }), new Paragraph({ children: [new TextRun({ text: contact, color: '526071' })] })] : []),
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
