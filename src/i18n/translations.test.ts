import { describe, expect, it } from 'vitest';
import { translations } from './translations';
describe('translation catalogues', () => {
  it.each(Object.entries(translations))('%s includes every label with a nonempty translation', (_language, catalogue) => {
    expect(Object.keys(catalogue).sort()).toEqual(Object.keys(translations.es).sort());
    for (const value of Object.values(catalogue)) expect(value.trim()).not.toBe('');
  });
  it('has Japanese text for every translatable Japanese label', () => {
    const invariant = new Set(['prefix', 'appTitle', 'footerBeta', 'prevDay', 'nextDay', 'langEs', 'langEn', 'langFr', 'langDe', 'langZh', 'langRu', 'langJa']);
    for (const [key, value] of Object.entries(translations.ja)) {
      if (!invariant.has(key)) expect(value, key).toMatch(/[\u3040-\u30ff\u3400-\u9fff]/);
    }
  });
});
