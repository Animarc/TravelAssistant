import { resolveLanguage } from './i18n/language';
import copy from './i18n/seo.json';
import type { Language } from './types';

export const SITE_URL = 'https://tabijilog.com';
export const seoCopy = copy;
export const homePath = (language: Language) => `/${language}/`;
export const homeLanguage = (pathname: string): Language | null => {
  if (pathname === '/') return 'es';
  const match = /^\/(es|en|fr|de|zh|ru|ja)\/?$/.exec(pathname);
  return match ? match[1] as Language : null;
};

// The root keeps the user's preference; explicit language URLs always win.
export const resolvePageLanguage = (pathname: string, search: string, stored: string | null, browserLanguages: readonly string[]): Language => {
  const requested = new URLSearchParams(search).get('lang');
  if (requested && Object.prototype.hasOwnProperty.call(copy, requested)) return requested as Language;
  const explicit = pathname === '/' ? null : homeLanguage(pathname);
  return explicit && !search ? explicit : resolveLanguage(stored, browserLanguages);
};
