import { describe, expect, it } from 'vitest';
import { resolveLanguage } from './language';

describe('resolveLanguage', () => {
  it('uses a previously selected supported language', () => expect(resolveLanguage('ja', ['es-ES'])).toBe('ja'));
  it('uses the browser language on a first visit', () => expect(resolveLanguage(null, ['fr-FR', 'en-US'])).toBe('fr'));
  it('resolves regional variants to their supported base language', () => expect(resolveLanguage(null, ['zh-CN'])).toBe('zh'));
  it('tries the next browser preference', () => expect(resolveLanguage(null, ['ca-ES', 'es-ES'])).toBe('es'));
  it('falls back to English when no browser language is supported', () => expect(resolveLanguage(null, ['ca-ES'])).toBe('en'));
});
