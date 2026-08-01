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
    name: 'Modern Tech',
    description: 'Emerald/Teal accents, tech pills, 30-second skimmable layout',
    accentColor: '#0d9488',
    badge: 'Popular',
  },
  {
    id: AtsTheme.CLASSIC,
    name: 'Classic Professional',
    description: 'Traditional single-column layout, 100% ATS parser score',
    accentColor: '#1e293b',
    badge: 'Highest ATS Score',
  },
  {
    id: AtsTheme.EXECUTIVE,
    name: 'Executive Suite',
    description: 'Deep Indigo header bar, structured experience timeline',
    accentColor: '#3b82f6',
    badge: 'Senior Roles',
  },
  {
    id: AtsTheme.MINIMALIST,
    name: 'Minimalist Compact',
    description: 'High content density, compact spacing for 1-page resumes',
    accentColor: '#334155',
    badge: 'Clean & Compact',
  },
];

function formatDateRange(
  startDate: string,
  endDate: string,
  currentlyWorking: boolean
): string {
  const start = startDate
    ? new Date(startDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';
  const end = currentlyWorking
    ? 'Present'
    : endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';
  return `${start} - ${end}`;
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

  const contactItems = [
    personalInfo.email ? `📧 ${personalInfo.email}` : '',
    personalInfo.phone ? `📞 ${personalInfo.phone}` : '',
    personalInfo.location ? `📍 ${personalInfo.location}` : '',
    socialLinks?.linkedin ? `LinkedIn: ${socialLinks.linkedin}` : '',
    socialLinks?.github ? `GitHub: ${socialLinks.github}` : '',
    socialLinks?.portfolio ? `Portfolio: ${socialLinks.portfolio}` : '',
  ].filter(Boolean);

  let accentColor = '#0d9488';
  let headerBg = '#f0fdf4';
  let fontFamily = `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif`;

  if (theme === AtsTheme.CLASSIC) {
    accentColor = '#0f172a';
    headerBg = '#f8fafc';
    fontFamily = `'Georgia', 'Times New Roman', serif`;
  } else if (theme === AtsTheme.EXECUTIVE) {
    accentColor = '#1e40af';
    headerBg = '#eff6ff';
    fontFamily = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
  } else if (theme === AtsTheme.MINIMALIST) {
    accentColor = '#334155';
    headerBg = '#f1f5f9';
    fontFamily = `'Helvetica Neue', Arial, sans-serif`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fullName} - ATS Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: letter portrait;
      margin: 0.5in;
    }

    body {
      font-family: ${fontFamily};
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13.5px;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    a {
      color: ${accentColor};
      text-decoration: none;
      font-weight: 600;
    }

    .resume-header {
      border-bottom: 2.5px solid ${accentColor};
      padding-bottom: 14px;
      margin-bottom: 18px;
    }

    .candidate-name {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .candidate-title {
      font-size: 15px;
      font-weight: 600;
      color: ${accentColor};
      margin-top: 2px;
      margin-bottom: 6px;
    }

    .contact-bar {
      font-size: 12px;
      color: #475569;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 6px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0f172a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: ${accentColor};
      border-radius: 50%;
    }

    .summary-box {
      background-color: ${headerBg};
      border-left: 3px solid ${accentColor};
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 14px;
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }

    .skill-pill {
      background-color: ${headerBg};
      color: ${accentColor};
      border: 1px solid ${accentColor}40;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }

    .item-card {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .item-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .item-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: ${accentColor};
    }

    .item-date {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }

    .item-desc {
      font-size: 13px;
      color: #334155;
      margin-top: 3px;
      margin-bottom: 4px;
    }

    ul.bullet-list {
      padding-left: 18px;
      margin-top: 4px;
    }

    ul.bullet-list li {
      margin-bottom: 3px;
      font-size: 12.5px;
      color: #334155;
    }

    .tech-stack {
      font-size: 12px;
      color: #475569;
      margin-top: 4px;
    }

    .project-links {
      margin-top: 4px;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Header Section -->
  <div class="resume-header">
    <div class="candidate-name">${fullName}</div>
    <div class="candidate-title">${position}</div>
    <div class="contact-bar">
      ${contactItems.map(item => `<span>${item}</span>`).join(' &bull; ')}
    </div>
  </div>

  <!-- Executive Summary -->
  ${
    summary
      ? `<div class="summary-box">
          ${summary}
         </div>`
      : ''
  }

  <!-- Core Skills / Technical Proficiency -->
  ${
    selectedSkills.length > 0
      ? `<div class="section-title">Technical Proficiency &amp; Core Skills</div>
         <div class="skills-grid">
           ${selectedSkills.map(skill => `<span class="skill-pill">${skill}</span>`).join('')}
         </div>`
      : ''
  }

  <!-- Professional Work Experience -->
  ${
    workExperiences.length > 0
      ? `<div class="section-title">Professional Experience</div>
         ${workExperiences
           .map(
             exp => `<div class="item-card">
               <div class="item-header">
                 <span class="item-title">${exp.position}</span>
                 <span class="item-date">${formatDateRange(
                   exp.startDate,
                   exp.endDate,
                   exp.currentlyWorking
                 )}</span>
               </div>
               <div class="item-subtitle">${exp.company}</div>
               ${exp.description ? `<div class="item-desc">${exp.description}</div>` : ''}
               ${
                 exp.responsibilities && exp.responsibilities.length > 0
                   ? `<ul class="bullet-list">
                       ${exp.responsibilities
                         .filter(Boolean)
                         .map(r => `<li>${r}</li>`)
                         .join('')}
                      </ul>`
                   : ''
               }
             </div>`
           )
           .join('')}`
      : ''
  }

  <!-- Featured Projects -->
  ${
    projects.length > 0
      ? `<div class="section-title">Featured Projects &amp; Software Deliverables</div>
         ${projects
           .map(
             p => `<div class="item-card">
               <div class="item-header">
                 <span class="item-title">${p.name} <span style="font-weight:400; font-size:12px; color:#64748b;">(${p.role || 'Developer'})</span></span>
                 <span class="item-date">${formatDateRange(
                   p.startDate,
                   p.endDate,
                   p.currentlyWorking
                 )}</span>
               </div>
               ${p.description ? `<div class="item-desc">${p.description}</div>` : ''}
               ${
                 p.technologies && p.technologies.length > 0
                   ? `<div class="tech-stack"><strong>Tech Stack:</strong> ${p.technologies.join(', ')}</div>`
                   : ''
               }
               ${
                 p.keyFeatures && p.keyFeatures.length > 0
                   ? `<ul class="bullet-list">
                       ${p.keyFeatures
                         .filter(Boolean)
                         .map(f => `<li>${f}</li>`)
                         .join('')}
                      </ul>`
                   : ''
               }
               <div class="project-links">
                 ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">📦 GitHub: ${p.githubUrl}</a> &nbsp;&nbsp;` : ''}
                 ${p.projectUrl ? `<a href="${p.projectUrl}" target="_blank">🚀 Live Demo: ${p.projectUrl}</a>` : ''}
               </div>
             </div>`
           )
           .join('')}`
      : ''
  }

  <!-- Education & Credentials -->
  ${
    education.length > 0
      ? `<div class="section-title">Education &amp; Credentials</div>
         ${education
           .map(
             edu => `<div class="item-card">
               <div class="item-header">
                 <span class="item-title">${edu.degree} in ${edu.fieldOfStudy}</span>
                 <span class="item-date">${formatDateRange(
                   edu.startDate,
                   edu.endDate,
                   edu.currentlyStudying
                 )}</span>
               </div>
               <div class="item-subtitle">${edu.institution}</div>
             </div>`
           )
           .join('')}`
      : ''
  }

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
