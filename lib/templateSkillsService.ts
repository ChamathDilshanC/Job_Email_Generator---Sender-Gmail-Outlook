import { ResumeData } from '@/lib/resumeDataService';
import { TemplateType } from '@/lib/templateTypes';

export type TemplateSkillsMap = Record<string, string[]>;

function storageKey(userId?: string | null, profileId?: string | null): string {
  return `templateSkills:${userId || 'guest'}:${profileId || 'default'}`;
}

function normalizeSkills(skills: string[]): string[] {
  return Array.from(
    new Map(
      skills
        .map(skill => skill.trim())
        .filter(Boolean)
        .map(skill => [skill.toLowerCase(), skill] as const)
    ).values()
  ).slice(0, 50);
}

export function loadTemplateSkills(
  userId?: string | null,
  profileId?: string | null
): TemplateSkillsMap {
  if (typeof window === 'undefined') return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId, profileId)) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([templateId, skills]) =>
        Array.isArray(skills) && skills.every(skill => typeof skill === 'string')
          ? [[templateId, normalizeSkills(skills)]]
          : []
      )
    );
  } catch {
    return {};
  }
}

export function saveTemplateSkills(
  userId: string,
  profileId: string | undefined,
  templateId: TemplateType,
  skills: string[]
): TemplateSkillsMap {
  const current = loadTemplateSkills(userId, profileId);
  const next = {
    ...current,
    [templateId.toString()]: normalizeSkills(skills),
  };
  window.localStorage.setItem(storageKey(userId, profileId), JSON.stringify(next));
  return next;
}

export function getTemplateSkills(
  templateSkills: TemplateSkillsMap,
  templateId: TemplateType,
  fallbackSkills: string[]
): string[] {
  return templateSkills[templateId.toString()] || fallbackSkills;
}

export function withTemplateSkills(
  resumeData: ResumeData,
  templateSkills: TemplateSkillsMap,
  templateId: TemplateType
): ResumeData {
  return {
    ...resumeData,
    skills: {
      ...resumeData.skills,
      selectedSkills: getTemplateSkills(
        templateSkills,
        templateId,
        resumeData.skills?.selectedSkills || []
      ),
    },
  };
}
