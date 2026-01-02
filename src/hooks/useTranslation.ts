import { useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

export const useTranslation = (language: Language) => {
  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations.es[key] || key;
  }, [language]);

  return { t };
};
