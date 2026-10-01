import resources from './resources.json';
import type { Language } from '../types';

export type TranslationKey = keyof typeof resources.es;
export const translations = resources satisfies Record<Language, Record<TranslationKey, string>>;
