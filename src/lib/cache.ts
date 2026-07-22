const CACHE_KEY = 'studio_cache_version';

export function getCacheVersion(): number {
  return Number(localStorage.getItem(CACHE_KEY)) || 0;
}

export function bumpCacheVersion(): void {
  const next = getCacheVersion() + 1;
  localStorage.setItem(CACHE_KEY, String(next));
}

export function cacheBust(url: string): string {
  if (!url || url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${getCacheVersion()}`;
}
