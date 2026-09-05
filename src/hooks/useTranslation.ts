import { useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';

export const useTranslation = (language: Language) => {
  const t = useCallback((key: TranslationKey): string => {
    const selected = translations[language] as Partial<Record<TranslationKey, string>>;
    return selected[key] || translations.es[key] || key;
  }, [language]);

  return { t };
};
