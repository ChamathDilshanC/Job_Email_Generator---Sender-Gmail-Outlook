import { TemplateType } from '@/lib/templateTypes';

function storageKey(userId?: string | null): string {
  return `favoriteEmailTemplates:${userId || 'guest'}`;
}

export function loadFavoriteTemplateIds(userId?: string | null): TemplateType[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(
      window.localStorage.getItem(storageKey(userId)) || '[]'
    );
    return Array.isArray(value)
      ? value.filter((id): id is TemplateType => Number.isInteger(id))
      : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteTemplate(
  userId: string | null | undefined,
  templateId: TemplateType
): TemplateType[] {
  const current = loadFavoriteTemplateIds(userId);
  const next = current.includes(templateId)
    ? current.filter(id => id !== templateId)
    : [templateId, ...current];
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}
