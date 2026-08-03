import { ResumeData } from './resumeDataService';

export enum AtsTheme {
  MODERN = 'modern',
  CLASSIC = 'classic',
  EXECUTIVE = 'executive',
  MINIMALIST = 'minimalist',
}

export interface AtsThemeOption {
  id: AtsTheme;
  name: string;
  description: string;
  accentColor: string;
  badge: string;
}

export const ATS_THEME_OPTIONS: AtsThemeOption[] = [
  {
    id: AtsTheme.MODERN,
    name: 'Modern Executive',
    description: 'Olivia Sanchez layout - Top header card with avatar & 3-column key skills grid',
    accentColor: '#1e293b',
    badge: 'Olivia Sanchez',
  },
  {
    id: AtsTheme.CLASSIC,
    name: 'Classic ATS',
    description: 'Pathy Krishna layout - Impact bold uppercase title, centered contact & solid line dividers',
    accentColor: '#000000',
    badge: 'Pathy Krishna',
  },
  {
    id: AtsTheme.EXECUTIVE,
    name: 'Executive Accent',
    description: 'Estelle Darcy layout - Centered header with vibrant blue role title & section dividers',
    accentColor: '#0066cc',
    badge: 'Estelle Darcy',
  },
  {
    id: AtsTheme.MINIMALIST,
    name: 'Minimalist Slate',
    description: 'High-density compact layout, slate accents, 100% ATS vector ready',
    accentColor: '#334155',
    badge: 'Compact',
  },
];

function formatDateRange(
  startDate: string,
  endDate: string,
  currentlyWorking: boolean
): string {
  if (!startDate && !endDate) return '';
  const start = startDate
    ? new Date(startDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';
  const end = currentlyWorking
    ? 'Present'
    : endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Present';
  if (!start) return end;
  return `${start} - ${end}`;
}

function getInitials(name: string): string {
  if (!name) return 'CV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Generates ATS-Compliant, Vector-Printable HTML for the selected resume theme.
 */
export function generateAtsResumeHtml(
  resumeData: ResumeData,
  theme: AtsTheme = AtsTheme.MODERN
): string {
  const {
    personalInfo,
    skills,
    workExperiences,
    education,
    projects,
    socialLinks,
  } = resumeData;

  const fullName = personalInfo.fullName || 'Your Name';
  const position = skills.position || 'Software Engineer';
  const summary = personalInfo.summary || '';
  const selectedSkills = skills.selectedSkills || [];
  const initials = getInitials(fullName);

  // Common Page Break CSS
  const printPageBreakCss = `
    @page {
      size: letter portrait;
      margin: 0.5in;
    }
    @media print {
      @page {
        size: letter portrait;
        margin: 0.5in;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      .section-block, .item-card, .skills-block, .summary-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        break-inside: avoid-page !important;
        -webkit-column-break-inside: avoid !important;
      }
      .section-title {
        page-break-after: avoid !important;
        break-after: avoid !important;
        break-after: avoid-page !important;
        -webkit-column-break-after: avoid !important;
      }
    }
    .section-block {
      display: block;
      page-break-inside: avoid;
      break-inside: avoid;
      break-inside: avoid-page;
      -webkit-column-break-inside: avoid;
      margin-top: 16px;
    }
    .section-title {
      page-break-after: avoid;
      break-after: avoid;
      break-after: avoid-page;
      -webkit-column-break-after: avoid;
    }
    .item-card {
      display: block;
      page-break-inside: avoid;
      break-inside: avoid;
      break-inside: avoid-page;
      -webkit-column-break-inside: avoid;
      margin-bottom: 14px;
    }
    .bullet-list {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .bullet-list li {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `;

  // ----------------------------------------------------
  // THEME 1: MODERN (Olivia Sanchez Layout)
  // ----------------------------------------------------
  if (theme === AtsTheme.MODERN) {
    const contactLines = [
      personalInfo.phone ? `<a href="tel:${personalInfo.phone.replace(/\s+/g, '')}">${personalInfo.phone}</a> 📞` : '',
      personalInfo.email ? `<a href="mailto:${personalInfo.email}">${personalInfo.email}</a> ✉️` : '',
      personalInfo.location ? `<span>${personalInfo.location}</span> 📍` : '',
      socialLinks?.linkedin ? `<a href="${formatUrl(socialLinks.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a> 🌐` : '',
      socialLinks?.github ? `<a href="${formatUrl(socialLinks.github)}" target="_blank" rel="noopener noreferrer">GitHub</a> 🌐` : '',
      socialLinks?.portfolio ? `<a href="${formatUrl(socialLinks.portfolio)}" target="_blank" rel="noopener noreferrer">Portfolio</a> 🌐` : '',
    ].filter(Boolean);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fullName} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    ${printPageBreakCss}
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      padding: 0.4in;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
    a:hover {
      color: #1d4ed8;
    }
    .header-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header-left { flex: 1; }
    .candidate-name {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .candidate-title {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      margin-top: 2px;
    }
    .avatar-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background-color: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      margin: 0 20px;
      flex-shrink: 0;
    }
    .header-right {
      text-align: right;
      font-size: 11.5px;
      color: #475569;
      line-height: 1.6;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 10px;
    }
    .summary-text {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.6;
      margin-bottom: 14px;
    }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-title { font-size: 13.5px; font-weight: 700; color: #0f172a; }
    .item-date { font-size: 12px; font-weight: 600; color: #475569; }
    .item-subtitle { font-size: 12.5px; font-weight: 600; color: #475569; margin-top: 1px; }
    .bullet-list { padding-left: 18px; margin-top: 4px; }
    .bullet-list li { margin-bottom: 3px; font-size: 12.5px; color: #334155; }
    .skills-block {
      margin-top: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px 16px;
      margin-bottom: 14px;
    }
    .skill-item { font-size: 12.5px; color: #334155; display: flex; align-items: center; gap: 6px; }
    .skill-item::before { content: "•"; color: #475569; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="header-left">
      <div class="candidate-name">${fullName}</div>
      <div class="candidate-title">${position}</div>
    </div>
    ${personalInfo.photoUrl ? `
      <div style="position: relative; width: 68px; height: 68px; flex-shrink: 0; margin: 0 20px;">
        <img src="${personalInfo.photoUrl}" alt="${fullName}" class="avatar-circle" style="margin: 0; width: 68px; height: 68px; object-fit: cover; border: 2px solid #cbd5e1;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="avatar-circle" style="margin: 0; display: none;">${initials}</div>
      </div>
    ` : `<div class="avatar-circle">${initials}</div>`}
    <div class="header-right">
      ${contactLines.map(c => `<div>${c}</div>`).join('')}
    </div>
  </div>

  ${summary ? `<div class="section-block"><div class="section-title">SUMMARY</div><div class="summary-text">${summary}</div></div>` : ''}

  ${workExperiences.length > 0 ? `
    <div class="section-title" style="margin-top:16px;">WORK EXPERIENCE</div>
    ${workExperiences.map(exp => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${exp.position}, ${exp.company}</span>
          <span class="item-date">${formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
        </div>
        ${exp.description ? `<div style="font-size:12.5px; color:#475569; margin-top:2px;">${exp.description}</div>` : ''}
        ${exp.responsibilities && exp.responsibilities.length > 0 ? `
          <ul class="bullet-list">
            ${exp.responsibilities.filter(Boolean).map(r => `<li>${r}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${projects.length > 0 ? `
    <div class="section-title" style="margin-top:16px;">KEY PROJECTS</div>
    ${projects.map(p => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${p.name} <span style="font-weight:400; font-size:12px; color:#64748b;">(${p.role || 'Developer'})</span></span>
          <span class="item-date">${formatDateRange(p.startDate, p.endDate, p.currentlyWorking)}</span>
        </div>
        ${p.description ? `<div style="font-size:12.5px; color:#475569; margin-top:2px;">${p.description}</div>` : ''}
        ${p.keyFeatures && p.keyFeatures.length > 0 ? `
          <ul class="bullet-list">
            ${p.keyFeatures.filter(Boolean).map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${education.length > 0 ? `
    <div class="section-title" style="margin-top:16px;">EDUCATION</div>
    ${education.map(edu => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${edu.degree} in ${edu.fieldOfStudy}</span>
          <span class="item-date">${formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</span>
        </div>
        <div class="item-subtitle">${edu.institution}</div>
      </div>
    `).join('')}
  ` : ''}

  ${selectedSkills.length > 0 ? `
    <div class="skills-block">
      <div class="section-title">KEY SKILLS</div>
      <div class="skills-grid">
        ${selectedSkills.map(s => `<div class="skill-item">${s}</div>`).join('')}
      </div>
    </div>
  ` : ''}
</body>
</html>`;
  }

  // ----------------------------------------------------
  // THEME 2: CLASSIC (Pathy Krishna Layout)
  // ----------------------------------------------------
  if (theme === AtsTheme.CLASSIC) {
    const contactLine = [
      personalInfo.location ? `<span>${personalInfo.location}</span>` : '',
      personalInfo.phone ? `<a href="tel:${personalInfo.phone.replace(/\s+/g, '')}">${personalInfo.phone}</a>` : '',
      personalInfo.email ? `<a href="mailto:${personalInfo.email}">${personalInfo.email}</a>` : '',
      socialLinks?.linkedin ? `<a href="${formatUrl(socialLinks.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : '',
      socialLinks?.github ? `<a href="${formatUrl(socialLinks.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : '',
      socialLinks?.portfolio ? `<a href="${formatUrl(socialLinks.portfolio)}" target="_blank" rel="noopener noreferrer">Portfolio</a>` : '',
    ].filter(Boolean).join(' | ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fullName} - ATS Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    ${printPageBreakCss}
    body {
      font-family: 'Inter', sans-serif;
      color: #000000;
      background: #ffffff;
      line-height: 1.45;
      font-size: 12.5px;
      padding: 0.4in;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
    a:hover {
      color: #1d4ed8;
    }
    .header-block {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .candidate-name {
      font-size: 30px;
      font-weight: 900;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .contact-line {
      font-size: 11.5px;
      color: #1e293b;
      text-align: center;
      margin-top: 6px;
    }
    .header-divider {
      border-bottom: 1.5px solid #000000;
      margin-top: 12px;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 10px;
    }
    .summary-text {
      font-size: 12.5px;
      color: #1e293b;
      line-height: 1.55;
      margin-bottom: 12px;
    }
    .item-row { display: flex; justify-content: space-between; align-items: baseline; }
    .item-company { font-size: 13px; font-weight: 800; color: #000000; }
    .item-date { font-size: 12px; font-weight: 600; color: #1e293b; }
    .item-role { font-size: 13px; font-weight: 700; color: #000000; margin-top: 1px; }
    .bullet-list { padding-left: 18px; margin-top: 4px; }
    .bullet-list li { margin-bottom: 3px; font-size: 12px; color: #1e293b; }
    .skills-block {
      margin-top: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .skills-line {
      font-size: 12px;
      color: #000000;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header-block">
    <div class="candidate-name">${fullName}</div>
    <div class="contact-line">${contactLine}</div>
    <div class="header-divider"></div>
  </div>

  ${summary ? `
    <div class="section-block">
      <div class="section-title">PROFESSIONAL SUMMARY</div>
      <div class="summary-text">${summary}</div>
    </div>
  ` : ''}

  ${education.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">EDUCATION</div>
    ${education.map(edu => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-company">${edu.institution}</span>
          <span class="item-date">${formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</span>
        </div>
        <div class="item-role">${edu.degree} in ${edu.fieldOfStudy}</div>
      </div>
    `).join('')}
  ` : ''}

  ${workExperiences.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">RELEVANT EXPERIENCE</div>
    ${workExperiences.map(exp => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-company">${exp.company}</span>
          <span class="item-date">${formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
        </div>
        <div class="item-role">${exp.position}</div>
        ${exp.description ? `<div style="font-size:12px; color:#1e293b; margin-top:2px;">${exp.description}</div>` : ''}
        ${exp.responsibilities && exp.responsibilities.length > 0 ? `
          <ul class="bullet-list">
            ${exp.responsibilities.filter(Boolean).map(r => `<li>${r}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${projects.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">PROJECTS &amp; DELIVERABLES</div>
    ${projects.map(p => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-company">${p.name}</span>
          <span class="item-date">${formatDateRange(p.startDate, p.endDate, p.currentlyWorking)}</span>
        </div>
        <div class="item-role">${p.role || 'Developer'}</div>
        ${p.keyFeatures && p.keyFeatures.length > 0 ? `
          <ul class="bullet-list">
            ${p.keyFeatures.filter(Boolean).map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${selectedSkills.length > 0 ? `
    <div class="skills-block">
      <div class="section-title">SKILLS &amp; COMPETENCIES</div>
      <div class="skills-line"><strong>Technical Skills:</strong> ${selectedSkills.join(', ')}</div>
    </div>
  ` : ''}
</body>
</html>`;
  }

  // ----------------------------------------------------
  // THEME 3: EXECUTIVE (Estelle Darcy Layout)
  // ----------------------------------------------------
  if (theme === AtsTheme.EXECUTIVE) {
    const contactLine = [
      personalInfo.location ? `<span>${personalInfo.location}</span>` : '',
      personalInfo.phone ? `<a href="tel:${personalInfo.phone.replace(/\s+/g, '')}">${personalInfo.phone}</a>` : '',
      personalInfo.email ? `<a href="mailto:${personalInfo.email}">${personalInfo.email}</a>` : '',
      socialLinks?.linkedin ? `<a href="${formatUrl(socialLinks.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : '',
      socialLinks?.github ? `<a href="${formatUrl(socialLinks.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : '',
      socialLinks?.portfolio ? `<a href="${formatUrl(socialLinks.portfolio)}" target="_blank" rel="noopener noreferrer">Portfolio</a>` : '',
    ].filter(Boolean).join(' | ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fullName} - Executive Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    ${printPageBreakCss}
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      padding: 0.4in;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
    a:hover {
      color: #004499;
    }
    .header-block {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .candidate-name {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .candidate-role {
      font-size: 15px;
      font-weight: 700;
      color: #0066cc;
      text-transform: uppercase;
      text-align: center;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .contact-line {
      font-size: 12px;
      color: #475569;
      text-align: center;
      margin-top: 6px;
    }
    .blue-divider {
      border-bottom: 2px solid #0066cc;
      margin-top: 12px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0066cc;
      border-bottom: 1.5px solid #0066cc;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 10px;
    }
    .summary-text {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.6;
      margin-bottom: 14px;
    }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-title { font-size: 13.5px; font-weight: 700; color: #0f172a; }
    .item-date { font-size: 12px; font-weight: 700; color: #1e293b; }
    .bullet-list { padding-left: 18px; margin-top: 4px; }
    .bullet-list li { margin-bottom: 3px; font-size: 12.5px; color: #334155; }
    .skills-block {
      margin-top: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .skills-line {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header-block">
    <div class="candidate-name">${fullName}</div>
    <div class="candidate-role">${position}</div>
    <div class="contact-line">${contactLine}</div>
    <div class="blue-divider"></div>
  </div>

  ${summary ? `
    <div class="section-block">
      <div class="section-title">SUMMARY</div>
      <div class="summary-text">${summary}</div>
    </div>
  ` : ''}

  ${workExperiences.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">PROFESSIONAL EXPERIENCE</div>
    ${workExperiences.map(exp => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${exp.position}, ${exp.company}</span>
          <span class="item-date">${formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
        </div>
        ${exp.description ? `<div style="font-size:12.5px; color:#475569; margin-top:2px;">${exp.description}</div>` : ''}
        ${exp.responsibilities && exp.responsibilities.length > 0 ? `
          <ul class="bullet-list">
            ${exp.responsibilities.filter(Boolean).map(r => `<li>${r}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${projects.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">FEATURED PROJECTS</div>
    ${projects.map(p => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${p.name} (${p.role || 'Developer'})</span>
          <span class="item-date">${formatDateRange(p.startDate, p.endDate, p.currentlyWorking)}</span>
        </div>
        ${p.keyFeatures && p.keyFeatures.length > 0 ? `
          <ul class="bullet-list">
            ${p.keyFeatures.filter(Boolean).map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${selectedSkills.length > 0 ? `
    <div class="skills-block">
      <div class="section-title">SKILLS</div>
      <div class="skills-line">${selectedSkills.join('  •  ')}</div>
    </div>
  ` : ''}

  ${education.length > 0 ? `
    <div class="section-title" style="margin-top:14px;">EDUCATION</div>
    ${education.map(edu => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${edu.degree} in ${edu.fieldOfStudy}</span>
          <span class="item-date">${formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</span>
        </div>
        <div style="font-size:12.5px; color:#475569; font-weight:600;">${edu.institution}</div>
      </div>
    `).join('')}
  ` : ''}
</body>
</html>`;
  }

  // ----------------------------------------------------
  // THEME 4: MINIMALIST (Compact Slate Layout)
  // ----------------------------------------------------
  const contactItems = [
    personalInfo.email ? `📧 <a href="mailto:${personalInfo.email}">${personalInfo.email}</a>` : '',
    personalInfo.phone ? `📞 <a href="tel:${personalInfo.phone.replace(/\s+/g, '')}">${personalInfo.phone}</a>` : '',
    personalInfo.location ? `📍 <span>${personalInfo.location}</span>` : '',
    socialLinks?.linkedin ? `🌐 <a href="${formatUrl(socialLinks.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : '',
    socialLinks?.github ? `💻 <a href="${formatUrl(socialLinks.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : '',
    socialLinks?.portfolio ? `🔗 <a href="${formatUrl(socialLinks.portfolio)}" target="_blank" rel="noopener noreferrer">Portfolio</a>` : '',
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fullName} - Minimalist Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    ${printPageBreakCss}
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 12.5px;
      padding: 0.4in;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
    a:hover {
      color: #1d4ed8;
    }
    .header-block { page-break-inside: avoid; break-inside: avoid; }
    .candidate-name { font-size: 24px; font-weight: 800; color: #0f172a; }
    .candidate-title { font-size: 14px; font-weight: 600; color: #334155; margin-top: 2px; }
    .contact-bar { font-size: 11.5px; color: #475569; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
    .section-title {
      font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
      color: #334155; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 14px; margin-bottom: 10px;
    }
    .summary-box { background-color: #f1f5f9; border-left: 3px solid #334155; padding: 8px 12px; border-radius: 4px; font-size: 12.5px; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .item-card { margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-title { font-size: 13px; font-weight: 700; color: #0f172a; }
    .item-subtitle { font-size: 12.5px; font-weight: 600; color: #334155; }
    .item-date { font-size: 11.5px; color: #64748b; font-weight: 600; }
    .bullet-list { padding-left: 16px; margin-top: 4px; }
    .bullet-list li { margin-bottom: 2px; font-size: 12px; color: #334155; }
    .skills-block { page-break-inside: avoid; break-inside: avoid; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .skill-pill { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header-block" style="border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 14px;">
    <div class="candidate-name">${fullName}</div>
    <div class="candidate-title">${position}</div>
    <div class="contact-bar">${contactItems.map(item => `<span>${item}</span>`).join(' &bull; ')}</div>
  </div>
  ${summary ? `<div class="summary-box">${summary}</div>` : ''}
  ${selectedSkills.length > 0 ? `<div class="skills-block"><div class="section-title">Technical Skills</div><div class="skills-grid">${selectedSkills.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div></div>` : ''}
  ${workExperiences.length > 0 ? `<div class="section-title" style="margin-top:14px;">Work Experience</div>${workExperiences.map(exp => `<div class="item-card"><div class="item-header"><span class="item-title">${exp.position}</span><span class="item-date">${formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span></div><div class="item-subtitle">${exp.company}</div>${exp.responsibilities && exp.responsibilities.length > 0 ? `<ul class="bullet-list">${exp.responsibilities.filter(Boolean).map(r => `<li>${r}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
  ${projects.length > 0 ? `<div class="section-title" style="margin-top:14px;">Projects</div>${projects.map(p => `<div class="item-card"><div class="item-header"><span class="item-title">${p.name} (${p.role || 'Developer'})</span><span class="item-date">${formatDateRange(p.startDate, p.endDate, p.currentlyWorking)}</span></div>${p.keyFeatures && p.keyFeatures.length > 0 ? `<ul class="bullet-list">${p.keyFeatures.filter(Boolean).map(f => `<li>${f}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
  ${education.length > 0 ? `<div class="section-title" style="margin-top:14px;">Education</div>${education.map(edu => `<div class="item-card"><div class="item-header"><span class="item-title">${edu.degree} in ${edu.fieldOfStudy}</span><span class="item-date">${formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying)}</span></div><div class="item-subtitle">${edu.institution}</div></div>`).join('')}` : ''}
</body>
</html>`;
}

/**
 * Triggers clean, vector-searchable ATS PDF export using a printable window.
 */
export function exportAtsResumePdf(
  resumeData: ResumeData,
  theme: AtsTheme = AtsTheme.MODERN
): void {
  const htmlContent = generateAtsResumeHtml(resumeData, theme);
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups for this site to export your ATS PDF Resume.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };
}

/**
 * Triggers clean, editable DOCX Word Document download of the ATS resume.
 */
export function exportAtsResumeDocx(
  resumeData: ResumeData,
  theme: AtsTheme = AtsTheme.MODERN
): void {
  const htmlContent = generateAtsResumeHtml(resumeData, theme);
  const candidateName = (resumeData.personalInfo.fullName || 'Candidate_Resume').trim();
  const fileName = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.doc`;

  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${candidateName} - Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
</head>
<body>`;
  const footer = `</body></html>`;
  const fullDocument = header + htmlContent + footer;

  const blob = new Blob(['\ufeff' + fullDocument], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
