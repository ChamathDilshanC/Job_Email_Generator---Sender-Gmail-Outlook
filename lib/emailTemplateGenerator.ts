import { ResumeData } from './resumeDataService';
import { GeneratedEmail, JobDetails, TemplateType } from './templateTypes';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Format date range for work experience or projects
 */
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
 * Format social links for email display (plain text)
 */
function formatSocialLinks(socialLinks?: {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
  other?: string;
}): string {
  if (!socialLinks) return '';

  const links: string[] = [];
  if (socialLinks.linkedin) links.push(`LinkedIn: ${socialLinks.linkedin}`);
  if (socialLinks.github) links.push(`GitHub: ${socialLinks.github}`);
  if (socialLinks.portfolio) links.push(`Portfolio: ${socialLinks.portfolio}`);
  if (socialLinks.website) links.push(`Website: ${socialLinks.website}`);
  if (socialLinks.twitter) links.push(`Twitter: ${socialLinks.twitter}`);
  if (socialLinks.other) links.push(socialLinks.other);

  return links.length > 0 ? `\n${links.join(' | ')}` : '';
}

/**
 * Render social links as HTML anchors, styled with the template's accent color
 */
function renderSocialLinksHtml(
  socialLinks:
    | {
        github?: string;
        linkedin?: string;
        portfolio?: string;
        twitter?: string;
        website?: string;
        other?: string;
      }
    | undefined,
  accent: string
): string {
  if (!socialLinks) return '';

  const links: string[] = [];
  if (socialLinks.linkedin)
    links.push(
      `<a href="${socialLinks.linkedin}" style="color:${accent}; text-decoration:none; font-weight:600;">LinkedIn</a>`
    );
  if (socialLinks.github)
    links.push(
      `<a href="${socialLinks.github}" style="color:${accent}; text-decoration:none; font-weight:600;">GitHub</a>`
    );
  if (socialLinks.portfolio)
    links.push(
      `<a href="${socialLinks.portfolio}" style="color:${accent}; text-decoration:none; font-weight:600;">Portfolio</a>`
    );
  if (socialLinks.website)
    links.push(
      `<a href="${socialLinks.website}" style="color:${accent}; text-decoration:none; font-weight:600;">Website</a>`
    );
  if (socialLinks.twitter)
    links.push(
      `<a href="${socialLinks.twitter}" style="color:${accent}; text-decoration:none; font-weight:600;">Twitter</a>`
    );

  return links.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;');
}

/**
 * Shared "letterhead" header used at the top of every template - name,
 * contact line, and social links, underlined in the template's accent color.
 */
function renderHeaderHtml(
  fullName: string,
  personalInfo: { email?: string; phone?: string; location?: string },
  socialLinks: ResumeData['socialLinks'],
  accent: string
): string {
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean);
  const linksHtml = renderSocialLinksHtml(socialLinks, accent);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="padding-bottom:12px; border-bottom:3px solid ${accent};">
      <div style="font-size:22px; font-weight:700; color:#111827; font-family:${FONT};">${fullName}</div>
      <div style="font-size:13px; color:#6b7280; margin-top:6px; font-family:${FONT};">${contactParts.join(
    '&nbsp;&nbsp;|&nbsp;&nbsp;'
  )}</div>
      ${
        linksHtml
          ? `<div style="font-size:13px; margin-top:6px; font-family:${FONT};">${linksHtml}</div>`
          : ''
      }
    </td>
  </tr>
</table>
<div style="height:24px; line-height:24px; font-size:1px;">&nbsp;</div>`;
}

/**
 * A rounded "pill" badge - used for skills, tech stacks, etc.
 */
function renderPill(text: string, accent: string, bg: string): string {
  return `<span style="display:inline-block; padding:5px 12px; margin:3px 6px 3px 0; background-color:${bg}; color:${accent}; border-radius:999px; font-size:13px; font-weight:600; font-family:${FONT}; border:1px solid ${accent}40;">${text}</span>`;
}

/**
 * Shared closing block: sign-off + a divider + a "resume attached" note,
 * styled with the template's accent color. Appears at the bottom of every
 * template so the reader never has to guess whether a CV was included.
 */
function renderClosingHtml(
  fullName: string,
  signOff: string,
  accent: string,
  bg: string
): string {
  return `<p style="margin-top:28px; font-family:${FONT}; font-size:14px; color:#333;">${signOff},<br>
<strong>${fullName}</strong></p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px;">
  <tr><td style="border-top:1px solid #e5e7eb; font-size:1px; line-height:1px;">&nbsp;</td></tr>
</table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:18px; background-color:${bg}; border-radius:8px;">
  <tr>
    <td style="padding:14px 16px; font-family:${FONT}; font-size:14px; color:#374151;">
      <span style="font-size:16px;">&#128206;</span>&nbsp;&nbsp;<strong style="color:${accent};">Attached:</strong> My resume/CV is included with this email for your review.
    </td>
  </tr>
</table>`;
}

/**
 * Sign-off used by templates that shouldn't claim a resume is attached
 * (thank-you notes, check-ins, networking asks, offer responses).
 */
function renderSimpleClosingHtml(
  fullName: string,
  signOff: string,
  accent: string
): string {
  return `<p style="margin-top:28px; font-family:${FONT}; font-size:14px; color:#333;">${signOff},<br>
<strong>${fullName}</strong></p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px;">
  <tr><td style="border-top:1px solid #e5e7eb; font-size:1px; line-height:1px;">&nbsp;</td></tr>
</table>`;
}

/**
 * Centered callout banner - used for referral credit, interview recap,
 * days-since-applied, and offer-decision highlights.
 */
function renderBannerHtml(text: string, accent: string, bg: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin:18px 0;">
  <tr>
    <td style="background-color:${bg}; border-radius:8px; padding:14px 16px; text-align:center; font-family:${FONT}; font-size:14px; font-weight:600; color:${accent};">
      ${text}
    </td>
  </tr>
</table>`;
}

function attachmentNoteText(): string {
  return `\n${'─'.repeat(40)}\n📎 Attached: My resume/CV is included with this email for your review.`;
}

function wrapHtml(inner: string): string {
  return `<div style="font-family:${FONT}; line-height:1.6; color:#333; max-width:640px; margin:0 auto;">
${inner}
</div>`;
}

/**
 * Template 1: Professional Introduction
 * Classic, formal letter - deep blue accent, flowing prose, no bells and whistles.
 */
function generateProfessionalIntroduction(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, education, socialLinks } =
    resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#1d4ed8';
  const bg = '#eff6ff';

  const fullName = personalInfo.fullName || 'Your Name';
  const topSkills =
    skills.selectedSkills.slice(0, 5).join(', ') || 'your skills';
  const latestExperience = workExperiences[0];
  const latestEducation = education[0];
  const linksText = formatSocialLinks(socialLinks);

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }${linksText}

Dear Hiring Manager,

I am writing to express my strong interest in the ${position} position at ${companyName}. ${
    personalInfo.summary ||
    `With my background and proven track record, I am confident I would be a valuable addition to your team.`
  }

${
  latestExperience
    ? `Currently, I am working as a ${latestExperience.position} at ${
        latestExperience.company
      }, where I have been ${
        latestExperience.description ||
        'developing my skills and contributing to impactful projects'
      }.`
    : 'I bring hands-on experience and a passion for excellence to every project I undertake.'
}

My technical expertise includes ${topSkills}, which I believe align perfectly with the requirements of this role.

${
  latestEducation
    ? `I hold a ${latestEducation.degree} in ${latestEducation.fieldOfStudy} from ${latestEducation.institution}, which has provided me with a strong foundation in the field.`
    : ''
}

I am particularly drawn to ${companyName} because of your innovative approach and commitment to excellence. I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I am writing to express my strong interest in the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. ${
    personalInfo.summary ||
    `With my background and proven track record, I am confident I would be a valuable addition to your team.`
  }</p>

${
  latestExperience
    ? `<p>Currently, I am working as a <strong>${
        latestExperience.position
      }</strong> at <strong>${
        latestExperience.company
      }</strong>, where I have been ${
        latestExperience.description ||
        'developing my skills and contributing to impactful projects'
      }.</p>`
    : '<p>I bring hands-on experience and a passion for excellence to every project I undertake.</p>'
}

<p>My technical expertise includes <strong>${topSkills}</strong>, which I believe align perfectly with the requirements of this role.</p>

${
  latestEducation
    ? `<p>I hold a <strong>${latestEducation.degree}</strong> in <strong>${latestEducation.fieldOfStudy}</strong> from <strong>${latestEducation.institution}</strong>, which has provided me with a strong foundation in the field.</p>`
    : ''
}

<p>I am particularly drawn to <strong style="color:${accent};">${companyName}</strong> because of your innovative approach and commitment to excellence. I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success.</p>

<p>Thank you for considering my application. I look forward to hearing from you.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Application for ${position} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 2: Skills Highlight
 * Teal accent, skills rendered as pill badges instead of a bullet list.
 */
function generateSkillsHighlight(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, projects, socialLinks } = resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#0d9488';
  const bg = '#f0fdfa';

  const fullName = personalInfo.fullName || 'Your Name';
  const skillsList =
    skills.selectedSkills.length > 0
      ? skills.selectedSkills.map(skill => `• ${skill}`).join('\n')
      : '• Your key skills';

  const recentProjects = projects.slice(0, 2);

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

I am excited to apply for the ${position} role at ${companyName}. As a professional with expertise in ${
    skills.position || 'software development'
  }, I am eager to bring my technical capabilities to your innovative team.

Key Skills & Competencies:
${skillsList}

${
  recentProjects.length > 0
    ? `Recent Achievements:
${recentProjects
  .map(p => `• ${p.name}: ${p.description || 'Successfully delivered project'}`)
  .join('\n')}`
    : ''
}

I am impressed by ${companyName}'s commitment to innovation, and I am confident that my technical background and problem-solving abilities would make me a strong contributor to your projects.

I would appreciate the opportunity to discuss how my skill set aligns with your needs.

Thank you for your time and consideration.

Sincerely,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I am excited to apply for the <strong>${position}</strong> role at <strong style="color:${accent};">${companyName}</strong>. As a professional with expertise in <strong>${
    skills.position || 'software development'
  }</strong>, I am eager to bring my technical capabilities to your innovative team.</p>

<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">Key Skills &amp; Competencies</p>
<div>
${
  skills.selectedSkills.length > 0
    ? skills.selectedSkills.map(skill => renderPill(skill, accent, bg)).join('')
    : renderPill('Your key skills', accent, bg)
}
</div>

${
  recentProjects.length > 0
    ? `<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">Recent Achievements</p>
<ul style="margin-top:0; padding-left:20px;">
${recentProjects
  .map(
    p =>
      `<li style="margin-bottom:6px;"><strong>${p.name}</strong>: ${
        p.description || 'Successfully delivered project'
      }</li>`
  )
  .join('')}
</ul>`
    : ''
}

<p>I am impressed by <strong style="color:${accent};">${companyName}</strong>'s commitment to innovation, and I am confident that my technical background and problem-solving abilities would make me a strong contributor to your projects.</p>

<p>I would appreciate the opportunity to discuss how my skill set aligns with your needs.</p>

${renderClosingHtml(fullName, 'Sincerely', accent, bg)}`);

  return {
    subject: `Skilled ${position} Ready to Contribute - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 3: Experience-Focused
 * Indigo accent, work history rendered as a vertical timeline.
 */
function generateExperienceFocused(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, workExperiences, socialLinks } = resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#4f46e5';
  const bg = '#eef2ff';

  const fullName = personalInfo.fullName || 'Your Name';
  const experienceYears =
    workExperiences.length > 0 ? `${workExperiences.length}+` : 'several';

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

With ${experienceYears} years of professional experience, I am writing to apply for the ${position} position at ${companyName}. Throughout my career, I have consistently delivered results and driven success in challenging environments.

Professional Highlights:
${workExperiences
  .slice(0, 3)
  .map(
    exp => `
${exp.position} | ${exp.company} | ${formatDateRange(
      exp.startDate,
      exp.endDate,
      exp.currentlyWorking
    )}
${exp.description || ''}
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `• ${r}`)
  .join('\n')}`
  )
  .join('\n')}

I am particularly interested in ${companyName} because of your reputation for excellence. My experience has prepared me to make immediate contributions to your team.

Thank you for considering my application.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>With <span style="background-color:${bg}; color:${accent}; font-weight:700; padding:2px 8px; border-radius:6px;">${experienceYears} years</span> of professional experience, I am writing to apply for the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. Throughout my career, I have consistently delivered results and driven success in challenging environments.</p>

<p style="font-weight:700; margin-top:22px; margin-bottom:4px; color:#111827;">Professional Highlights</p>
${workExperiences
  .slice(0, 3)
  .map(
    exp => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:14px;">
  <tr>
    <td style="width:10px; vertical-align:top; padding-top:4px;">
      <div style="width:10px; height:10px; border-radius:50%; background-color:${accent};"></div>
    </td>
    <td style="width:2px; border-left:2px solid ${accent}33; padding:0 12px;"></td>
    <td style="vertical-align:top; padding-bottom:6px;">
      <p style="margin:0 0 2px 0;"><strong>${exp.position}</strong> &middot; ${
      exp.company
    }</p>
      <p style="margin:0 0 6px 0; font-size:12px; color:#6b7280; font-weight:600;">${formatDateRange(
        exp.startDate,
        exp.endDate,
        exp.currentlyWorking
      )}</p>
      <p style="margin:0 0 6px 0;">${exp.description || ''}</p>
      <ul style="margin:0; padding-left:18px;">
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `<li style="margin-bottom:4px;">${r}</li>`)
  .join('')}
      </ul>
    </td>
  </tr>
</table>`
  )
  .join('')}

<p style="margin-top:22px;">I am particularly interested in <strong style="color:${accent};">${companyName}</strong> because of your reputation for excellence. My experience has prepared me to make immediate contributions to your team.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Experienced ${position} Seeking New Opportunity - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 4: Project Showcase
 * Violet accent, projects rendered as cards with a colored top bar and tech pills.
 */
function generateProjectShowcase(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, projects, skills, socialLinks } = resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#7c3aed';
  const bg = '#f5f3ff';

  const fullName = personalInfo.fullName || 'Your Name';
  const topProjects = projects.slice(0, 3);

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

I am applying for the ${position} role at ${companyName}, and I am excited to share how my project experience aligns with your needs.

Featured Projects:
${topProjects
  .map(
    p => `
${p.name} | ${p.role} | ${formatDateRange(
      p.startDate,
      p.endDate,
      p.currentlyWorking
    )}
${p.description || ''}
Technologies: ${p.technologies.join(', ')}
${p.keyFeatures
  .filter(f => f)
  .slice(0, 3)
  .map(f => `• ${f}`)
  .join('\n')}
${p.projectUrl ? `Project URL: ${p.projectUrl}` : ''}
${p.githubUrl ? `GitHub: ${p.githubUrl}` : ''}`
  )
  .join('\n\n')}

Technical Expertise:
${skills.selectedSkills.join(', ')}

These projects demonstrate my ability to deliver high-quality solutions, which I understand is crucial for success in this role. I am particularly drawn to ${companyName}'s innovative work.

Thank you for your consideration.

Sincerely,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I am applying for the <strong>${position}</strong> role at <strong style="color:${accent};">${companyName}</strong>, and I am excited to share how my project experience aligns with your needs.</p>

<p style="font-weight:700; margin-top:22px; margin-bottom:4px; color:#111827;">Featured Projects</p>
${topProjects
  .map(
    p => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:14px; border:1px solid #ece9fb; border-radius:10px; overflow:hidden;">
  <tr><td style="height:4px; background-color:${accent}; font-size:1px; line-height:1px;">&nbsp;</td></tr>
  <tr>
    <td style="padding:16px;">
      <p style="margin:0 0 2px 0;"><strong style="font-size:15px;">${
        p.name
      }</strong> <span style="color:#6b7280; font-size:12px;">&middot; ${
      p.role
    } &middot; ${formatDateRange(
      p.startDate,
      p.endDate,
      p.currentlyWorking
    )}</span></p>
      <p style="margin:8px 0;">${p.description || ''}</p>
      <div style="margin:10px 0;">
${p.technologies.map(t => renderPill(t, accent, bg)).join('')}
      </div>
      <ul style="margin:8px 0; padding-left:18px;">
${p.keyFeatures
  .filter(f => f)
  .slice(0, 3)
  .map(f => `<li style="margin-bottom:4px;">${f}</li>`)
  .join('')}
      </ul>
      ${
        p.projectUrl || p.githubUrl
          ? `<p style="margin:10px 0 0 0;">${
              p.projectUrl
                ? `<a href="${p.projectUrl}" style="color:${accent}; font-weight:600; text-decoration:none;">View Project &rarr;</a>`
                : ''
            }${p.projectUrl && p.githubUrl ? '&nbsp;&nbsp;&middot;&nbsp;&nbsp;' : ''}${
              p.githubUrl
                ? `<a href="${p.githubUrl}" style="color:${accent}; font-weight:600; text-decoration:none;">Source Code &rarr;</a>`
                : ''
            }</p>`
          : ''
      }
    </td>
  </tr>
</table>`
  )
  .join('')}

<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">Technical Expertise</p>
<div>${skills.selectedSkills.map(s => renderPill(s, accent, bg)).join('')}</div>

<p style="margin-top:22px;">These projects demonstrate my ability to deliver high-quality solutions, which I understand is crucial for success in this role. I am particularly drawn to <strong style="color:${accent};">${companyName}</strong>'s innovative work.</p>

<p>Thank you for your consideration.</p>

${renderClosingHtml(fullName, 'Sincerely', accent, bg)}`);

  return {
    subject: `Application for ${position} - Portfolio Included`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 5: Career Transition
 * Amber accent, with a "from -> to" banner framing the transition narrative.
 */
function generateCareerTransition(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, education, socialLinks } =
    resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#d97706';
  const bg = '#fffbeb';

  const fullName = personalInfo.fullName || 'Your Name';
  const previousField = workExperiences[0]?.position || 'my previous field';
  const transferableSkills = skills.selectedSkills.slice(0, 6);
  const recentEducation = education.filter(edu => edu.degree).slice(0, 2);

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

I am writing to express my interest in the ${position} position at ${companyName}. While my background includes experience as ${previousField}, I have developed strong transferable skills that make me an excellent candidate for this role.

${previousField} -> ${position}

Transferable Skills:
${transferableSkills.map(skill => `• ${skill}`).join('\n')}

${
  recentEducation.length > 0
    ? `Recent Training & Development:
${recentEducation
  .map(edu => `• ${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution}`)
  .join('\n')}`
    : ''
}

Why This Opportunity:
${
  personalInfo.summary ||
  'I am passionate about this field and eager to apply my diverse background to new challenges.'
}

I am particularly excited about ${companyName} because of your innovative approach. My unique perspective combined with my skills would bring fresh insights to your team.

Thank you for considering my application.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I am writing to express my interest in the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. While my background includes experience as <strong>${previousField}</strong>, I have developed strong transferable skills that make me an excellent candidate for this role.</p>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin:18px 0;">
  <tr>
    <td style="background-color:${bg}; border-radius:8px; padding:14px 16px; text-align:center; font-family:${FONT};">
      <span style="font-size:14px; color:#6b7280; font-weight:600;">${previousField}</span>
      <span style="color:${accent}; font-weight:700; margin:0 10px;">&rarr;</span>
      <span style="font-size:14px; color:${accent}; font-weight:700;">${position}</span>
    </td>
  </tr>
</table>

<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">Transferable Skills</p>
<div>${transferableSkills.map(skill => renderPill(skill, accent, bg)).join('')}</div>

${
  recentEducation.length > 0
    ? `<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">Recent Training &amp; Development</p>
<ul style="margin-top:0; padding-left:20px;">
${recentEducation
  .map(
    edu =>
      `<li style="margin-bottom:6px;"><strong>${edu.degree}</strong> in ${edu.fieldOfStudy} - ${edu.institution}</li>`
  )
  .join('')}
</ul>`
    : ''
}

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:22px;">
  <tr>
    <td style="border-left:3px solid ${accent}; padding:4px 16px; font-style:italic; color:#4b5563;">
      ${
        personalInfo.summary ||
        'I am passionate about this field and eager to apply my diverse background to new challenges.'
      }
    </td>
  </tr>
</table>

<p style="margin-top:22px;">I am particularly excited about <strong style="color:${accent};">${companyName}</strong> because of your innovative approach. My unique perspective combined with my skills would bring fresh insights to your team.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Transitioning Professional Applying for ${position}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 6: Comprehensive Profile
 * The full report - every section, blue accent, sectioned like a one-page portfolio.
 */
function generateComprehensiveProfile(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const {
    personalInfo,
    skills,
    workExperiences,
    education,
    projects,
    socialLinks,
  } = resumeData;
  const { companyName, position } = jobDetails;
  const accent = '#2563eb';
  const bg = '#eff6ff';

  const fullName = personalInfo.fullName || 'Your Name';
  const linksText = formatSocialLinks(socialLinks);
  const allSkills = skills.selectedSkills;

  const bodyText = `${fullName}
${personalInfo.phone || ''} | ${personalInfo.email || ''}${
    linksText ? `\n${linksText}` : ''
  }

Dear Hiring Manager,

I am writing to express my interest in the ${position} position at ${companyName}. ${
    personalInfo.summary ||
    `As a ${
      skills.position || 'professional'
    } with comprehensive experience across multiple domains, I bring hands-on expertise in modern technologies, agile methodologies, and full-stack development that align with your team's needs.`
  }

Technical Proficiency

${
  allSkills.length > 0
    ? allSkills.map(skill => `• ${skill}`).join('\n')
    : '• Your technical skills'
}

${
  workExperiences.length > 0
    ? `Professional Experience & Key Projects

${workExperiences
  .slice(0, 3)
  .map(
    exp => `${exp.position} | ${exp.company} | ${formatDateRange(
      exp.startDate,
      exp.endDate,
      exp.currentlyWorking
    )}
${exp.description || ''}
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `• ${r}`)
  .join('\n')}`
  )
  .join('\n\n')}`
    : ''
}

${
  projects.length > 0
    ? `Featured Projects:

${projects
  .slice(0, 3)
  .map(
    p => `${p.name}
${p.description || ''}
Technologies: ${p.technologies.join(', ')}
${p.keyFeatures
  .filter(f => f)
  .slice(0, 2)
  .map(f => `• ${f}`)
  .join('\n')}
${p.projectUrl ? `Project URL: ${p.projectUrl}` : ''}
${p.githubUrl ? `GitHub: ${p.githubUrl}` : ''}`
  )
  .join('\n\n')}`
    : ''
}

${
  education.length > 0
    ? `Education

${education
  .slice(0, 2)
  .map(
    edu => `${edu.degree} in ${edu.fieldOfStudy}
${edu.institution} | ${formatDateRange(
      edu.startDate,
      edu.endDate,
      edu.currentlyStudying
    )}`
  )
  .join('\n\n')}`
    : ''
}

What I Bring to Your Team

• Problem-Solving: Strong analytical skills with ability to debug complex issues and optimize application performance
• Collaboration: Experience working in team environments, participating in code reviews, and contributing to technical discussions
• Learning Agility: Quick learner passionate about emerging technologies, best practices, and continuous skill development
• Clean Code Advocate: Commitment to writing maintainable, well-documented code following industry standards
• Initiative: Self-starter with proven ability to manage multiple projects and deliver results in fast-paced environments

I am excited about the opportunity to contribute to ${companyName}'s innovative projects while learning from your experienced engineering team. My combination of academic foundation, practical experience, and enthusiasm for software development positions me to make meaningful contributions from day one.

I would welcome the opportunity to discuss how my technical skills, project experience, and passion align with your team's objectives. Thank you for considering my application.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I am writing to express my interest in the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. ${
    personalInfo.summary ||
    `As a ${
      skills.position || 'professional'
    } with comprehensive experience across multiple domains, I bring hands-on expertise in modern technologies, agile methodologies, and full-stack development that align with your team's needs.`
  }</p>

<h3 style="color:#0f172a; font-size:15px; margin-top:26px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${bg};">Technical Proficiency</h3>
<div>
${
  allSkills.length > 0
    ? allSkills.map(skill => renderPill(skill, accent, bg)).join('')
    : renderPill('Your technical skills', accent, bg)
}
</div>

${
  workExperiences.length > 0
    ? `<h3 style="color:#0f172a; font-size:15px; margin-top:26px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${bg};">Professional Experience &amp; Key Projects</h3>
${workExperiences
  .slice(0, 3)
  .map(
    exp => `<div style="margin-bottom:16px;">
<p style="margin:0 0 2px 0;"><strong>${exp.position}</strong> &middot; ${
      exp.company
    } <span style="color:#6b7280; font-size:12px; font-weight:600;">&middot; ${formatDateRange(
      exp.startDate,
      exp.endDate,
      exp.currentlyWorking
    )}</span></p>
<p style="margin:6px 0;">${exp.description || ''}</p>
<ul style="margin:6px 0; padding-left:18px;">
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `<li style="margin-bottom:4px;">${r}</li>`)
  .join('')}
</ul>
</div>`
  )
  .join('')}`
    : ''
}

${
  projects.length > 0
    ? `<h3 style="color:#0f172a; font-size:15px; margin-top:26px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${bg};">Featured Projects</h3>
${projects
  .slice(0, 3)
  .map(
    p => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-bottom:14px; background-color:#f8fafc; border-radius:8px;">
  <tr>
    <td style="padding:14px 16px;">
      <p style="margin:0 0 4px 0;"><strong>${p.name}</strong></p>
      <p style="margin:0 0 8px 0;">${p.description || ''}</p>
      <p style="margin:0 0 8px 0; font-size:13px;"><strong>Technologies:</strong> ${p.technologies.join(
        ', '
      )}</p>
      <ul style="margin:0 0 8px 0; padding-left:18px;">
${p.keyFeatures
  .filter(f => f)
  .slice(0, 2)
  .map(f => `<li style="margin-bottom:4px;">${f}</li>`)
  .join('')}
      </ul>
      ${
        p.projectUrl
          ? `<p style="margin:0 0 2px 0; font-size:13px;"><strong>Project URL:</strong> <a href="${p.projectUrl}" style="color:${accent};">${p.projectUrl}</a></p>`
          : ''
      }
      ${
        p.githubUrl
          ? `<p style="margin:0; font-size:13px;"><strong>GitHub:</strong> <a href="${p.githubUrl}" style="color:${accent};">${p.githubUrl}</a></p>`
          : ''
      }
    </td>
  </tr>
</table>`
  )
  .join('')}`
    : ''
}

${
  education.length > 0
    ? `<h3 style="color:#0f172a; font-size:15px; margin-top:26px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${bg};">Education</h3>
${education
  .slice(0, 2)
  .map(
    edu => `<p style="margin:0 0 10px 0;"><strong>${edu.degree}</strong> in ${
      edu.fieldOfStudy
    }<br>
<span style="color:#6b7280; font-size:13px;">${
      edu.institution
    } &middot; ${formatDateRange(
      edu.startDate,
      edu.endDate,
      edu.currentlyStudying
    )}</span></p>`
  )
  .join('')}`
    : ''
}

<h3 style="color:#0f172a; font-size:15px; margin-top:26px; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${bg};">What I Bring to Your Team</h3>
<ul style="padding-left:18px;">
<li style="margin-bottom:6px;"><strong>Problem-Solving:</strong> Strong analytical skills with ability to debug complex issues and optimize application performance</li>
<li style="margin-bottom:6px;"><strong>Collaboration:</strong> Experience working in team environments, participating in code reviews, and contributing to technical discussions</li>
<li style="margin-bottom:6px;"><strong>Learning Agility:</strong> Quick learner passionate about emerging technologies, best practices, and continuous skill development</li>
<li style="margin-bottom:6px;"><strong>Clean Code Advocate:</strong> Commitment to writing maintainable, well-documented code following industry standards</li>
<li style="margin-bottom:6px;"><strong>Initiative:</strong> Self-starter with proven ability to manage multiple projects and deliver results in fast-paced environments</li>
</ul>

<p style="margin-top:22px;">I am excited about the opportunity to contribute to <strong style="color:${accent};">${companyName}</strong>'s innovative projects while learning from your experienced engineering team. My combination of academic foundation, practical experience, and enthusiasm for software development positions me to make meaningful contributions from day one.</p>

<p>I would welcome the opportunity to discuss how my technical skills, project experience, and passion align with your team's objectives.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Application for ${position} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 7: Cold Outreach to Recruiter
 * Rose accent - proactive introduction sent with no open posting in hand.
 */
function generateColdOutreach(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, socialLinks } = resumeData;
  const { companyName, position, recruiterName } = jobDetails;
  const accent = '#e11d48';
  const bg = '#fff1f2';

  const fullName = personalInfo.fullName || 'Your Name';
  const greetingName = recruiterName || 'Hiring Team';
  const topSkills = skills.selectedSkills.slice(0, 6);
  const latestExperience = workExperiences[0];

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear ${greetingName},

My name is ${fullName}, and I'm a ${
    skills.position || 'professional'
  } with a strong interest in joining ${companyName}. I don't see a specific posting that's an exact match right now, but I wanted to introduce myself directly in case a ${position} opportunity - or something similar - is on your radar.

A quick snapshot of what I bring:
${
  topSkills.length > 0
    ? topSkills.map(skill => `• ${skill}`).join('\n')
    : '• A strong, adaptable skill set'
}

${
  latestExperience
    ? `Most recently, I've been working as a ${latestExperience.position} at ${
        latestExperience.company
      }, where I ${
        latestExperience.description ||
        'have grown my skills and delivered meaningful results'
      }.`
    : ''
}

I'd welcome the chance to share more about my background, or simply to stay on your radar for future openings at ${companyName}. Would you be open to a short conversation?

Thank you for your time and consideration.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear ${greetingName},</p>

<p>My name is ${fullName}, and I'm a <strong>${
    skills.position || 'professional'
  }</strong> with a strong interest in joining <strong style="color:${accent};">${companyName}</strong>. I don't see a specific posting that's an exact match right now, but I wanted to introduce myself directly in case a <strong>${position}</strong> opportunity - or something similar - is on your radar.</p>

<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">What I Bring</p>
<div>
${
  topSkills.length > 0
    ? topSkills.map(skill => renderPill(skill, accent, bg)).join('')
    : renderPill('A strong, adaptable skill set', accent, bg)
}
</div>

${
  latestExperience
    ? `<p style="margin-top:18px;">Most recently, I've been working as a <strong>${
        latestExperience.position
      }</strong> at <strong>${
        latestExperience.company
      }</strong>, where I ${
        latestExperience.description ||
        'have grown my skills and delivered meaningful results'
      }.</p>`
    : ''
}

<p>I'd welcome the chance to share more about my background, or simply to stay on your radar for future openings at <strong style="color:${accent};">${companyName}</strong>. Would you be open to a short conversation?</p>

<p>Thank you for your time and consideration.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Interested in Opportunities at ${companyName} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 8: Referral Application
 * Emerald accent - opens with a referral callout banner for instant credibility.
 */
function generateReferralApplication(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, socialLinks } = resumeData;
  const { companyName, position, referralName, referralRole } = jobDetails;
  const accent = '#059669';
  const bg = '#ecfdf5';

  const fullName = personalInfo.fullName || 'Your Name';
  const topSkills = skills.selectedSkills.slice(0, 5).join(', ') || 'my skills';
  const latestExperience = workExperiences[0];
  const referralIntro = referralName
    ? `${referralName}${
        referralRole ? `, ${referralRole} at ${companyName},` : ` at ${companyName}`
      } suggested I reach out about the ${position} role, and after learning more about the team, I'm excited to apply.`
    : `I'm applying for the ${position} role at ${companyName} on the recommendation of someone on your team.`;

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

${
  referralName
    ? `Referred by: ${referralName}${referralRole ? ` (${referralRole})` : ''}`
    : 'Referred by a member of your team'
}

${referralIntro}

My background includes ${topSkills}${
    latestExperience
      ? `, most recently as a ${latestExperience.position} at ${latestExperience.company}`
      : ''
  }.

I'd love the opportunity to bring the same qualities ${
    referralName ? `${referralName} vouched for` : 'my colleagues recognize'
  } to your team.

Thank you for considering my application.

Best regards,
${fullName}
${attachmentNoteText()}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

${renderBannerHtml(
  `🤝 Referred by ${referralName || 'a member of your team'}${
    referralRole ? ` &middot; ${referralRole}` : ''
  }`,
  accent,
  bg
)}

<p>${referralIntro}</p>

<p>My background includes <strong>${topSkills}</strong>${
    latestExperience
      ? `, most recently as a <strong>${latestExperience.position}</strong> at <strong>${latestExperience.company}</strong>`
      : ''
  }.</p>

<p>I'd love the opportunity to bring the same qualities ${
    referralName ? `${referralName} vouched for` : 'my colleagues recognize'
  } to your team.</p>

<p>Thank you for considering my application.</p>

${renderClosingHtml(fullName, 'Best regards', accent, bg)}`);

  return {
    subject: `Referred by ${referralName || 'a Colleague'} for ${position} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 9: Interview Thank You
 * Cyan accent - sent within a day of an interview, no resume attachment note.
 */
function generateInterviewThankYou(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, socialLinks } = resumeData;
  const { companyName, position, interviewerName, interviewDate } =
    jobDetails;
  const accent = '#0891b2';
  const bg = '#ecfeff';

  const fullName = personalInfo.fullName || 'Your Name';
  const greetingName = interviewerName || 'Hiring Team';
  const topSkills =
    skills.selectedSkills.slice(0, 5).join(', ') || 'my background';
  const latestExperience = workExperiences[0];

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear ${greetingName},

Thank you for taking the time to speak with me${
    interviewDate ? ` on ${interviewDate}` : ' recently'
  } about the ${position} role at ${companyName}. I really enjoyed our conversation and learning more about the team's work.

Our discussion reinforced how well my background in ${topSkills} aligns with what you're looking for, and I left even more excited about the opportunity to contribute.

${
  latestExperience
    ? `In particular, I think my experience as a ${latestExperience.position} at ${latestExperience.company} would translate directly to the challenges we discussed.`
    : ''
}

Please don't hesitate to reach out if you need any additional information from me. I look forward to hearing about the next steps.

Thank you again for your time and consideration.

Best regards,
${fullName}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear ${greetingName},</p>

<p>Thank you for taking the time to speak with me${
    interviewDate
      ? ` on <span style="background-color:${bg}; color:${accent}; font-weight:700; padding:2px 8px; border-radius:6px;">${interviewDate}</span>`
      : ' recently'
  } about the <strong>${position}</strong> role at <strong style="color:${accent};">${companyName}</strong>. I really enjoyed our conversation and learning more about the team's work.</p>

<p>Our discussion reinforced how well my background in <strong>${topSkills}</strong> aligns with what you're looking for, and I left even more excited about the opportunity to contribute.</p>

${
  latestExperience
    ? `<p>In particular, I think my experience as a <strong>${latestExperience.position}</strong> at <strong>${latestExperience.company}</strong> would translate directly to the challenges we discussed.</p>`
    : ''
}

<p>Please don't hesitate to reach out if you need any additional information from me. I look forward to hearing about the next steps.</p>

<p>Thank you again for your time and consideration.</p>

${renderSimpleClosingHtml(fullName, 'Best regards', accent)}`);

  return {
    subject: `Thank You - ${position} Interview`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 10: Application Follow-Up / Check-In
 * Slate accent - low-key, polite nudge, no resume attachment note.
 */
function generateFollowUpCheckIn(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, socialLinks } = resumeData;
  const { companyName, position, daysSinceApplied } = jobDetails;
  const accent = '#475569';
  const bg = '#f8fafc';

  const fullName = personalInfo.fullName || 'Your Name';
  const topSkills =
    skills.selectedSkills.slice(0, 5).join(', ') || 'my key skills';
  const latestExperience = workExperiences[0];

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Dear Hiring Manager,

I hope you're doing well. I wanted to follow up on my application for the ${position} position at ${companyName}${
    daysSinceApplied ? `, submitted ${daysSinceApplied} ago` : ''
  }. I remain very enthusiastic about the opportunity and wanted to check in on its status.

To briefly recap, I bring ${topSkills}${
    latestExperience
      ? `, most recently as a ${latestExperience.position} at ${latestExperience.company}`
      : ''
  }.

I understand you're likely reviewing many applications, and I appreciate the time this takes. Please let me know if there's any additional information I can provide to support my candidacy.

Thank you again for your consideration - I look forward to hearing from you.

Best regards,
${fullName}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear Hiring Manager,</p>

<p>I hope you're doing well. I wanted to follow up on my application for the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. I remain very enthusiastic about the opportunity and wanted to check in on its status.</p>

${
  daysSinceApplied
    ? renderBannerHtml(`⏱ Applied ${daysSinceApplied} ago`, accent, bg)
    : ''
}

<p>To briefly recap, I bring <strong>${topSkills}</strong>${
    latestExperience
      ? `, most recently as a <strong>${latestExperience.position}</strong> at <strong>${latestExperience.company}</strong>`
      : ''
  }.</p>

<p>I understand you're likely reviewing many applications, and I appreciate the time this takes. Please let me know if there's any additional information I can provide to support my candidacy.</p>

<p>Thank you again for your consideration - I look forward to hearing from you.</p>

${renderSimpleClosingHtml(fullName, 'Best regards', accent)}`);

  return {
    subject: `Following Up: ${position} Application - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 11: Networking / Informational Interview Request
 * Fuchsia accent - explicitly not a job application, no resume attachment note.
 */
function generateNetworkingInformational(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, socialLinks } = resumeData;
  const { companyName, position, recruiterName } = jobDetails;
  const accent = '#a21caf';
  const bg = '#fdf4ff';

  const fullName = personalInfo.fullName || 'Your Name';
  const greetingName = recruiterName ? ` ${recruiterName}` : '';
  const topSkills =
    skills.selectedSkills.slice(0, 5).join(', ') || 'a varied technical background';

  const bodyText = `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }

Hi${greetingName},

My name is ${fullName}, and I'm a ${
    skills.position || 'professional'
  } exploring opportunities in ${position} roles. I've been following ${companyName}'s work and would love to learn more about your experience there.

Would you be open to a brief 15-20 minute call sometime in the next couple of weeks? I'm not looking for a referral or interview - just hoping to learn more about your day-to-day and any advice you'd offer someone hoping to grow into a role like yours.

A little about my background: ${topSkills}.

I know your time is valuable, so I'm happy to work around your schedule. Thank you for considering, and I hope to connect soon.

Best,
${fullName}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Hi${greetingName},</p>

<p>My name is ${fullName}, and I'm a <strong>${
    skills.position || 'professional'
  }</strong> exploring opportunities in <strong>${position}</strong> roles. I've been following <strong style="color:${accent};">${companyName}</strong>'s work and would love to learn more about your experience there.</p>

<p>Would you be open to a brief 15-20 minute call sometime in the next couple of weeks? I'm not looking for a referral or interview - just hoping to learn more about your day-to-day and any advice you'd offer someone hoping to grow into a role like yours.</p>

<p style="font-weight:700; margin-top:22px; margin-bottom:8px; color:#111827;">A Little About Me</p>
<div>${skills.selectedSkills
    .slice(0, 6)
    .map(s => renderPill(s, accent, bg))
    .join('') || renderPill(topSkills, accent, bg)}</div>

<p style="margin-top:18px;">I know your time is valuable, so I'm happy to work around your schedule. Thank you for considering, and I hope to connect soon.</p>

${renderSimpleClosingHtml(fullName, 'Best', accent)}`);

  return {
    subject: `Quick Question About ${companyName} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 12: Offer Response (Accept / Decline)
 * Accent flips green/slate based on jobDetails.decision - no resume attachment note.
 */
function generateOfferResponse(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, socialLinks } = resumeData;
  const { companyName, position, recruiterName, offerDeadline, decision } =
    jobDetails;
  const isAccept = decision !== 'decline';
  const accent = isAccept ? '#16a34a' : '#52525b';
  const bg = isAccept ? '#f0fdf4' : '#f4f4f5';

  const fullName = personalInfo.fullName || 'Your Name';
  const greetingName = recruiterName || 'Hiring Team';
  const deadlineClause = offerDeadline ? ` ahead of the ${offerDeadline} deadline` : '';

  const bodyText = isAccept
    ? `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
        personalInfo.location || ''
      }

Dear ${greetingName},

Thank you so much for offering me the ${position} position at ${companyName}. I'm thrilled to accept the offer${deadlineClause}.

Please let me know the next steps, including any paperwork or onboarding details I should prepare. I'm looking forward to getting started and contributing to ${companyName}'s continued success.

Thank you again for this opportunity.

Best regards,
${fullName}`
    : `${fullName}
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
        personalInfo.location || ''
      }

Dear ${greetingName},

Thank you so much for offering me the ${position} position at ${companyName}, and for the time you and the team invested throughout the process. After careful consideration, I've decided to decline the offer${deadlineClause}.

This was not an easy decision, and I have great respect for ${companyName} and the team I met along the way. I hope our paths cross again in the future.

Thank you again for your understanding, and best wishes to the team.

Best regards,
${fullName}`;

  const bodyHtml = wrapHtml(`${renderHeaderHtml(
    fullName,
    personalInfo,
    socialLinks,
    accent
  )}

<p>Dear ${greetingName},</p>

${renderBannerHtml(
  isAccept ? '✅ Accepting the Offer' : '🙏 Declining the Offer',
  accent,
  bg
)}

${
  isAccept
    ? `<p>Thank you so much for offering me the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>. I'm thrilled to accept the offer${deadlineClause}.</p>

<p>Please let me know the next steps, including any paperwork or onboarding details I should prepare. I'm looking forward to getting started and contributing to ${companyName}'s continued success.</p>

<p>Thank you again for this opportunity.</p>`
    : `<p>Thank you so much for offering me the <strong>${position}</strong> position at <strong style="color:${accent};">${companyName}</strong>, and for the time you and the team invested throughout the process. After careful consideration, I've decided to decline the offer${deadlineClause}.</p>

<p>This was not an easy decision, and I have great respect for ${companyName} and the team I met along the way. I hope our paths cross again in the future.</p>

<p>Thank you again for your understanding, and best wishes to the team.</p>`
}

${renderSimpleClosingHtml(fullName, 'Best regards', accent)}`);

  return {
    subject: `Re: Offer for ${position} at ${companyName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Main function to generate email from template
 */
export function generateEmailFromTemplate(
  templateId: TemplateType,
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  switch (templateId) {
    case TemplateType.PROFESSIONAL_INTRO:
      return generateProfessionalIntroduction(resumeData, jobDetails);
    case TemplateType.SKILLS_HIGHLIGHT:
      return generateSkillsHighlight(resumeData, jobDetails);
    case TemplateType.EXPERIENCE_FOCUSED:
      return generateExperienceFocused(resumeData, jobDetails);
    case TemplateType.PROJECT_SHOWCASE:
      return generateProjectShowcase(resumeData, jobDetails);
    case TemplateType.CAREER_TRANSITION:
      return generateCareerTransition(resumeData, jobDetails);
    case TemplateType.COMPREHENSIVE_PROFILE:
      return generateComprehensiveProfile(resumeData, jobDetails);
    case TemplateType.COLD_OUTREACH:
      return generateColdOutreach(resumeData, jobDetails);
    case TemplateType.REFERRAL_APPLICATION:
      return generateReferralApplication(resumeData, jobDetails);
    case TemplateType.INTERVIEW_THANK_YOU:
      return generateInterviewThankYou(resumeData, jobDetails);
    case TemplateType.FOLLOW_UP_CHECK_IN:
      return generateFollowUpCheckIn(resumeData, jobDetails);
    case TemplateType.NETWORKING_INFORMATIONAL:
      return generateNetworkingInformational(resumeData, jobDetails);
    case TemplateType.OFFER_RESPONSE:
      return generateOfferResponse(resumeData, jobDetails);
    default:
      return generateProfessionalIntroduction(resumeData, jobDetails);
  }
}
