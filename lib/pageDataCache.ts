/**
 * Minimal in-memory cache shared across page components. The Dashboard
 * fully unmounts each page when you navigate away (see
 * app/components/Dashboard.tsx), so every visit would otherwise refetch
 * from scratch and flash a loading spinner even for data fetched seconds
 * ago. This module persists for the life of the tab, so pages can render
 * a cached value instantly on remount while quietly revalidating.
 */

const cache = new Map<string, unknown>();

export function getCachedData<T>(key: string): T | undefined {
  return cache.has(key) ? (cache.get(key) as T) : undefined;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, data);
}
