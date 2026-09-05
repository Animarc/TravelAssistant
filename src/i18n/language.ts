import type { Language } from '../types';

const supportedLanguages: Language[] = ['es', 'en', 'fr', 'de', 'zh', 'ru', 'ja'];
const isLanguage = (value: unknown): value is Language => supportedLanguages.includes(value as Language);

export const resolveLanguage = (stored: string | null, browserLanguages: readonly string[]): Language => {
  if (isLanguage(stored)) return stored;
  for (const locale of browserLanguages) {
    const baseLanguage = locale.toLowerCase().split('-')[0];
    if (isLanguage(baseLanguage)) return baseLanguage;
  }
  return 'en';
};
