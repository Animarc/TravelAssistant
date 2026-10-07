import startupScript from '../../public/seo-init.js?raw';
import { renderHook, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { afterEach, expect, it } from 'vitest';
import { useSeo } from './useSeo';
import { homeLanguage, resolvePageLanguage } from '../seo';

afterEach(() => { cleanup(); document.head.innerHTML = ''; });
const wrapper = (path: string) => ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
it('makes the Japanese landing canonical and links all language versions', () => {
  renderHook(() => useSeo('ja', false, false), { wrapper: wrapper('/ja/') });
  expect(document.documentElement.lang).toBe('ja');
  expect(document.title).toContain('旅の計画');
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://tabijilog.com/ja/');
  expect(document.querySelectorAll('link[hreflang]')).toHaveLength(8);
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
});
it.each(['/account', '/settings', '/planning', '/missing', '/?reset-password=1&token=secret', '/?verify-email=1&token=secret', '/ja/?forgot-password=1'])('excludes private or token route %s without exposing its query in metadata', path => {
  renderHook(() => useSeo('ja', false, false), { wrapper: wrapper(path) });
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  expect(document.head.innerHTML).not.toContain('secret');
});
it('removes landing metadata when authenticated content or a public preview is displayed', () => {
  const hook = renderHook(({ authenticated, preview }) => useSeo('es', authenticated, preview), { wrapper: wrapper('/'), initialProps: { authenticated: false, preview: false } });
  hook.rerender({ authenticated: true, preview: false });
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  expect(document.title).toBe('Tabiji Log');
  hook.rerender({ authenticated: false, preview: true });
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});
it('only recognises real landing routes as language variants', () => {
  expect(homeLanguage('/ja/')).toBe('ja');
  expect(homeLanguage('/')).toBe('es');
  expect(homeLanguage('/account')).toBeNull();
  expect(homeLanguage('/ja/account')).toBeNull();
});

it('preserves user preferences at the root and honours explicit language URLs', () => {
  expect(resolvePageLanguage('/', '', 'ja', ['es'])).toBe('ja');
  expect(resolvePageLanguage('/', '', null, ['ja-JP'])).toBe('ja');
  expect(resolvePageLanguage('/es/', '', 'ja', ['ja-JP'])).toBe('es');
  expect(resolvePageLanguage('/ja/', '', 'es', ['es'])).toBe('ja');
  expect(resolvePageLanguage('/settings', '', 'ja', ['es'])).toBe('ja');
});

it.each([
  ['/ja/', '', 'index, follow'], ['/es/', '', 'index, follow'],
  ['/settings/', '', 'noindex, follow'], ['/', '?token=secret&reset-password=1', 'noindex, follow']
])('protects %s before the application renders', (pathname, search, expected) => {
  const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'index, follow'; document.head.appendChild(robots);
  const initialise = new Function('window', 'document', startupScript);
  initialise({ location: { pathname, search } }, document);
  expect(robots.content).toBe(expected);
  expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
});

it('honours the language of account email links on another device', () => {
  expect(resolvePageLanguage('/', '?reset-password=1&lang=ja', 'es', ['es-ES'])).toBe('ja');
  expect(resolvePageLanguage('/', '?verify-email=1&lang=invalid', 'fr', ['es-ES'])).toBe('fr');
});
