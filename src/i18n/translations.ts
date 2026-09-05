import resources from './resources.json';

export const translations = resources;
export type TranslationKey = keyof typeof resources.es;
