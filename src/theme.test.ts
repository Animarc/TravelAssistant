import { afterEach, describe, expect, it } from 'vitest';
import { parseTheme, resolveTheme, setTheme } from './theme';

afterEach(() => { setTheme('system'); localStorage.removeItem('kakomu.theme'); });

describe('appearance', () => {
  it('uses the device theme unless explicitly overridden', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
  it('treats missing or invalid stored preferences as system', () => {
    expect(parseTheme(null)).toBe('system');
    expect(parseTheme('invalid')).toBe('system');
    expect(parseTheme('dark')).toBe('dark');
  });
  it('applies and persists an explicit choice', () => {
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('kakomu.theme')).toBe('dark');
    setTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('syncs a preference changed in another tab', () => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'kakomu.theme', newValue: 'dark' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
