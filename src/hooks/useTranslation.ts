import { useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';

export const useTranslation = (language: Language) => {
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key];
  }, [language]);

  return { t };
};
