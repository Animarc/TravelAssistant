import { useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
const key = 'tabiji-log.theme';
const listeners = new Set<() => void>();
let preference: ThemePreference = 'system';
const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export const parseTheme = (value: string | null): ThemePreference =>
  value === 'light' || value === 'dark' ? value : 'system';
export const resolveTheme = (value: ThemePreference, systemDark: boolean) =>
  value === 'system' ? (systemDark ? 'dark' : 'light') : value;

try { preference = parseTheme(localStorage.getItem(key) ?? localStorage.getItem('kakomu.theme')); } catch { /* Private browsing may deny storage. */ }

const applyTheme = () => {
  const theme = resolveTheme(preference, media?.matches ?? false);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = theme === 'dark' ? '#111820' : '#f3f0e9';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111820' : '#17324d');
  listeners.forEach(listener => listener());
};

export const setTheme = (value: ThemePreference) => {
  preference = value;
  try { localStorage.setItem(key, value); } catch { /* The current tab still updates. */ }
  applyTheme();
};
const storageChanged = (event: StorageEvent) => {
  if (event.key === key || event.key === null) {
    preference = parseTheme(event.newValue);
    applyTheme();
  }
};
media?.addEventListener('change', applyTheme);
window.addEventListener('storage', storageChanged);
applyTheme();
if (import.meta.hot) import.meta.hot.dispose(() => {
  media?.removeEventListener('change', applyTheme);
  window.removeEventListener('storage', storageChanged);
});
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const useTheme = () => useSyncExternalStore(subscribe, () => preference);
