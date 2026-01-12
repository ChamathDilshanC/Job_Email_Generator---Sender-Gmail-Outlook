import { ResumeData } from './resumeDataService';
import { GeneratedEmail, JobDetails, TemplateType } from './templateTypes';

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
 * Format social links for email display
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
 * Template 1: Professional Introduction
 * Classic professional approach with emphasis on qualifications and enthusiasm
 */
function generateProfessionalIntroduction(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, education, socialLinks } =
    resumeData;
  const { companyName, position } = jobDetails;

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

I have attached my resume for your review. Thank you for considering my application. I look forward to hearing from you.

Best regards,
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p><strong>${fullName}</strong><br>
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }${
    linksText
      ? `<br>${linksText
          .trim()
          .split(' | ')
          .map(link => {
            if (link.includes('http')) {
              const [label, url] = link.split(': ');
              return `<a href="${url}" style="color: #1a73e8; text-decoration: none;">${label}</a>`;
            }
            return link;
          })
          .join(' | ')}`
      : ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>I am writing to express my strong interest in the <strong>${position}</strong> position at <strong style="color: #1a73e8;">${companyName}</strong>. ${
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

<p>I am particularly drawn to <strong style="color: #1a73e8;">${companyName}</strong> because of your innovative approach and commitment to excellence. I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success.</p>

<p>I have attached my resume for your review. Thank you for considering my application. I look forward to hearing from you.</p>

<p>Best regards,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Application for ${position} - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 2: Skills Highlight
 * Emphasizes technical expertise and specific skill sets
 */
function generateSkillsHighlight(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, projects } = resumeData;
  const { companyName, position } = jobDetails;

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

Please find my resume attached. I would appreciate the opportunity to discuss how my skill set aligns with your needs.

Thank you for your time and consideration.

Sincerely,
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p><strong>${fullName}</strong><br>
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>I am excited to apply for the <strong>${position}</strong> role at <strong style="color: #1a73e8;">${companyName}</strong>. As a professional with expertise in <strong>${
    skills.position || 'software development'
  }</strong>, I am eager to bring my technical capabilities to your innovative team.</p>

<p style="font-weight: bold; margin-top: 20px;">Key Skills & Competencies:</p>
<ul style="margin-top: 10px;">
${skills.selectedSkills.map(skill => `<li>${skill}</li>`).join('')}
</ul>

${
  recentProjects.length > 0
    ? `<p style="font-weight: bold; margin-top: 20px;">Recent Achievements:</p>
<ul>
${recentProjects
  .map(
    p =>
      `<li><strong>${p.name}</strong>: ${
        p.description || 'Successfully delivered project'
      }</li>`
  )
  .join('')}
</ul>`
    : ''
}

<p>I am impressed by <strong style="color: #1a73e8;">${companyName}</strong>'s commitment to innovation, and I am confident that my technical background and problem-solving abilities would make me a strong contributor to your projects.</p>

<p>Please find my resume attached. I would appreciate the opportunity to discuss how my skill set aligns with your needs.</p>

<p>Thank you for your time and consideration.</p>

<p>Sincerely,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Skilled ${position} Ready to Contribute - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 3: Experience-Focused
 * Best for candidates with significant work history
 */
function generateExperienceFocused(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, workExperiences } = resumeData;
  const { companyName, position } = jobDetails;

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

I have attached my detailed resume and would welcome the opportunity to discuss how my background aligns with your requirements.

Thank you for considering my application.

Best regards,
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p><strong>${fullName}</strong><br>
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>With <strong>${experienceYears} years</strong> of professional experience, I am writing to apply for the <strong>${position}</strong> position at <strong style="color: #1a73e8;">${companyName}</strong>. Throughout my career, I have consistently delivered results and driven success in challenging environments.</p>

<p style="font-weight: bold; margin-top: 20px;">Professional Highlights:</p>
${workExperiences
  .slice(0, 3)
  .map(
    exp => `
<div style="margin-bottom: 15px;">
<p style="margin: 5px 0;"><strong>${exp.position}</strong> | ${
      exp.company
    } | <em>${formatDateRange(
      exp.startDate,
      exp.endDate,
      exp.currentlyWorking
    )}</em></p>
<p style="margin: 5px 0;">${exp.description || ''}</p>
<ul style="margin: 5px 0;">
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `<li>${r}</li>`)
  .join('')}
</ul>
</div>`
  )
  .join('')}

<p>I am particularly interested in <strong style="color: #1a73e8;">${companyName}</strong> because of your reputation for excellence. My experience has prepared me to make immediate contributions to your team.</p>

<p>I have attached my detailed resume and would welcome the opportunity to discuss how my background aligns with your requirements.</p>

<p>Thank you for considering my application.</p>

<p>Best regards,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Experienced ${position} Seeking New Opportunity - ${fullName}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 4: Project Showcase
 * Perfect for showcasing concrete work examples
 */
function generateProjectShowcase(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, projects, skills } = resumeData;
  const { companyName, position } = jobDetails;

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

My resume and portfolio are attached for your review. I would love to discuss how my project experience can benefit your team.

Thank you for your consideration.

Sincerely,
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p><strong>${fullName}</strong><br>
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>I am applying for the <strong>${position}</strong> role at <strong style="color: #1a73e8;">${companyName}</strong>, and I am excited to share how my project experience aligns with your needs.</p>

<p style="font-weight: bold; margin-top: 20px;">Featured Projects:</p>
${topProjects
  .map(
    p => `
<div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #1a73e8;">
<p style="margin: 5px 0;"><strong>${p.name}</strong> | ${
      p.role
    } | <em>${formatDateRange(
      p.startDate,
      p.endDate,
      p.currentlyWorking
    )}</em></p>
<p style="margin: 5px 0;">${p.description || ''}</p>
<p style="margin: 5px 0;"><strong>Technologies:</strong> ${p.technologies.join(
      ', '
    )}</p>
<ul style="margin: 5px 0;">
${p.keyFeatures
  .filter(f => f)
  .slice(0, 3)
  .map(f => `<li>${f}</li>`)
  .join('')}
</ul>
${
  p.projectUrl
    ? `<p style="margin: 5px 0;"><strong>Project URL:</strong> <a href="${p.projectUrl}" style="color: #1a73e8;">${p.projectUrl}</a></p>`
    : ''
}
${
  p.githubUrl
    ? `<p style="margin: 5px 0;"><strong>GitHub:</strong> <a href="${p.githubUrl}" style="color: #1a73e8;">${p.githubUrl}</a></p>`
    : ''
}
</div>`
  )
  .join('')}

<p style="font-weight: bold;">Technical Expertise:</p>
<p>${skills.selectedSkills.join(', ')}</p>

<p>These projects demonstrate my ability to deliver high-quality solutions, which I understand is crucial for success in this role. I am particularly drawn to <strong style="color: #1a73e8;">${companyName}</strong>'s innovative work.</p>

<p>My resume and portfolio are attached for your review. I would love to discuss how my project experience can benefit your team.</p>

<p>Thank you for your consideration.</p>

<p>Sincerely,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Application for ${position} - Portfolio Included`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 5: Career Transition
 * Ideal for career changers emphasizing transferable skills
 */
function generateCareerTransition(
  resumeData: ResumeData,
  jobDetails: JobDetails
): GeneratedEmail {
  const { personalInfo, skills, workExperiences, education } = resumeData;
  const { companyName, position } = jobDetails;

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

Please find my resume attached. I would appreciate the opportunity to discuss how my diverse background can add value to your organization.

Thank you for considering my application.

Best regards,
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p><strong>${fullName}</strong><br>
${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${
    personalInfo.location || ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>I am writing to express my interest in the <strong>${position}</strong> position at <strong style="color: #1a73e8;">${companyName}</strong>. While my background includes experience as <strong>${previousField}</strong>, I have developed strong transferable skills that make me an excellent candidate for this role.</p>

<p style="font-weight: bold; margin-top: 20px;">Transferable Skills:</p>
<ul>
${transferableSkills.map(skill => `<li>${skill}</li>`).join('')}
</ul>

${
  recentEducation.length > 0
    ? `<p style="font-weight: bold; margin-top: 20px;">Recent Training & Development:</p>
<ul>
${recentEducation
  .map(
    edu =>
      `<li><strong>${edu.degree}</strong> in ${edu.fieldOfStudy} - ${edu.institution}</li>`
  )
  .join('')}
</ul>`
    : ''
}

<p style="font-weight: bold; margin-top: 20px;">Why This Opportunity:</p>
<p>${
    personalInfo.summary ||
    'I am passionate about this field and eager to apply my diverse background to new challenges.'
  }</p>

<p>I am particularly excited about <strong style="color: #1a73e8;">${companyName}</strong> because of your innovative approach. My unique perspective combined with my skills would bring fresh insights to your team.</p>

<p>Please find my resume attached. I would appreciate the opportunity to discuss how my diverse background can add value to your organization.</p>

<p>Thank you for considering my application.</p>

<p>Best regards,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Transitioning Professional Applying for ${position}`,
    bodyText,
    bodyHtml,
  };
}

/**
 * Template 6: Comprehensive Profile
 * Detailed template showcasing all resume sections
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

  const fullName = personalInfo.fullName || 'Your Name';
  const linksText = formatSocialLinks(socialLinks);

  // Organize skills by category (if possible, otherwise just list them)
  const allSkills = skills.selectedSkills;
  const skillsText =
    allSkills.length > 0 ? allSkills.join(', ') : 'your technical skills';

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
${fullName}`;

  const bodyHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px;">
<p><strong style="font-size: 18px;">${fullName}</strong><br>
${personalInfo.phone || ''} | ${personalInfo.email || ''}${
    linksText
      ? `<br>${linksText
          .trim()
          .split(' | ')
          .map(link => {
            if (link.includes('http')) {
              const [label, url] = link.split(': ');
              return `<a href="${url}" style="color: #1a73e8; text-decoration: none;">${label}</a>`;
            }
            return link;
          })
          .join(' | ')}`
      : ''
  }</p>

<p>Dear Hiring Manager,</p>

<p>I am writing to express my interest in the <strong>${position}</strong> position at <strong style="color: #1a73e8;">${companyName}</strong>. ${
    personalInfo.summary ||
    `As a ${
      skills.position || 'professional'
    } with comprehensive experience across multiple domains, I bring hands-on expertise in modern technologies, agile methodologies, and full-stack development that align with your team's needs.`
  }</p>

<h3 style="color: #1a73e8; margin-top: 25px; margin-bottom: 10px;">Technical Proficiency</h3>
<ul style="columns: 2; -webkit-columns: 2; -moz-columns: 2;">
${
  allSkills.length > 0
    ? allSkills.map(skill => `<li>${skill}</li>`).join('')
    : '<li>Your technical skills</li>'
}
</ul>

${
  workExperiences.length > 0
    ? `<h3 style="color: #1a73e8; margin-top: 25px; margin-bottom: 10px;">Professional Experience & Key Projects</h3>
${workExperiences
  .slice(0, 3)
  .map(
    exp => `<div style="margin-bottom: 20px;">
<p style="margin: 5px 0;"><strong>${exp.position}</strong> | ${
      exp.company
    } | <em>${formatDateRange(
      exp.startDate,
      exp.endDate,
      exp.currentlyWorking
    )}</em></p>
<p style="margin: 5px 0;">${exp.description || ''}</p>
<ul style="margin: 5px 0;">
${exp.responsibilities
  .filter(r => r)
  .slice(0, 3)
  .map(r => `<li>${r}</li>`)
  .join('')}
</ul>
</div>`
  )
  .join('')}`
    : ''
}

${
  projects.length > 0
    ? `<h3 style="color: #1a73e8; margin-top: 25px; margin-bottom: 10px;">Featured Projects</h3>
${projects
  .slice(0, 3)
  .map(
    p => `<div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #1a73e8;">
<p style="margin: 5px 0;"><strong>${p.name}</strong></p>
<p style="margin: 5px 0;">${p.description || ''}</p>
<p style="margin: 5px 0;"><strong>Technologies:</strong> ${p.technologies.join(
      ', '
    )}</p>
<ul style="margin: 5px 0;">
${p.keyFeatures
  .filter(f => f)
  .slice(0, 2)
  .map(f => `<li>${f}</li>`)
  .join('')}
</ul>
${
  p.projectUrl
    ? `<p style="margin: 5px 0;"><strong>Project URL:</strong> <a href="${p.projectUrl}" style="color: #1a73e8;">${p.projectUrl}</a></p>`
    : ''
}
${
  p.githubUrl
    ? `<p style="margin: 5px 0;"><strong>GitHub:</strong> <a href="${p.githubUrl}" style="color: #1a73e8;">${p.githubUrl}</a></p>`
    : ''
}
</div>`
  )
  .join('')}`
    : ''
}

${
  education.length > 0
    ? `<h3 style="color: #1a73e8; margin-top: 25px; margin-bottom: 10px;">Education</h3>
${education
  .slice(0, 2)
  .map(
    edu => `<p style="margin: 5px 0;"><strong>${edu.degree}</strong> in ${
      edu.fieldOfStudy
    }<br>
${edu.institution} | <em>${formatDateRange(
      edu.startDate,
      edu.endDate,
      edu.currentlyStudying
    )}</em></p>`
  )
  .join('')}`
    : ''
}

<h3 style="color: #1a73e8; margin-top: 25px; margin-bottom: 10px;">What I Bring to Your Team</h3>
<ul>
<li><strong>Problem-Solving:</strong> Strong analytical skills with ability to debug complex issues and optimize application performance</li>
<li><strong>Collaboration:</strong> Experience working in team environments, participating in code reviews, and contributing to technical discussions</li>
<li><strong>Learning Agility:</strong> Quick learner passionate about emerging technologies, best practices, and continuous skill development</li>
<li><strong>Clean Code Advocate:</strong> Commitment to writing maintainable, well-documented code following industry standards</li>
<li><strong>Initiative:</strong> Self-starter with proven ability to manage multiple projects and deliver results in fast-paced environments</li>
</ul>

<p>I am excited about the opportunity to contribute to <strong style="color: #1a73e8;">${companyName}</strong>'s innovative projects while learning from your experienced engineering team. My combination of academic foundation, practical experience, and enthusiasm for software development positions me to make meaningful contributions from day one.</p>

<p>I would welcome the opportunity to discuss how my technical skills, project experience, and passion align with your team's objectives. Thank you for considering my application.</p>

<p>Best regards,<br>
${fullName}</p>
</div>`;

  return {
    subject: `Application for ${position} - ${fullName}`,
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
    default:
      return generateProfessionalIntroduction(resumeData, jobDetails);
  }
}
