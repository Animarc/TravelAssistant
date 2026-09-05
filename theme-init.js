/* global localStorage, window, document */
// Apply before the SPA/styles load; keep resolution consistent with src/theme.ts.
(function () {
  var preference = 'system';
  try { preference = localStorage.getItem('kakomu.theme'); } catch { /* Storage is optional. */ }
  var dark = preference === 'dark' || (preference !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  document.documentElement.style.backgroundColor = dark ? '#111820' : '#f3f0e9';
}());
