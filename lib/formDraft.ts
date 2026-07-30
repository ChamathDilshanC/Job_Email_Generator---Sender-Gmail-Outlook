/**
 * localStorage-backed draft persistence for in-progress form input. The
 * Dashboard fully unmounts each page when you navigate to another one (see
 * app/components/Dashboard.tsx and the similar note in lib/pageDataCache.ts),
 * which drops any component state that hasn't been saved yet. That's fine
 * for re-fetchable server data, but not for text a user just typed into a
 * form. Pages with meaningful unsaved input mirror it here on change and
 * restore it on mount, then clear it once the input is actually persisted
 * (sent, scheduled, saved to the server, etc).
 */

export function loadDraft<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/serialization errors - the draft is a convenience, not critical data.
  }
}

export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}
