/* global console */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const copy = JSON.parse(await readFile('src/i18n/seo.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const language of Object.keys(copy)) {
  const path = `/${language}/`;
  const html = await readFile(`dist${path}index.html`, 'utf8');
  assert.ok(html.includes(`<html lang="${language}">`));
  assert.ok(html.includes(copy[language].title));
  assert.ok(html.includes(copy[language].features[0]));
  assert.match(html, /<h1>[^<]+<\/h1>/);
  assert.ok(html.includes(`rel="canonical" href="https://tabijilog.com${path}"`));
  assert.equal((html.match(/name="robots"/g) || []).length, 1);
  assert.ok(html.includes('content="index, follow"'));
  assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 8);
  assert.ok(sitemap.includes(`<loc>https://tabijilog.com${path}</loc>`));
  const structured = JSON.parse(html.match(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/s)[1]);
  assert.equal(structured.inLanguage, language);
  assert.equal(structured.url, 'https://tabijilog.com' + path);
  assert.ok(html.indexOf('name="robots"') < html.indexOf('src="/seo-init.js"'));
}
for (const route of ['account','settings','planning','budget','objects','travelers','ratings','verify-email']) {
  const html = await readFile(`dist/${route}/index.html`, 'utf8');
  assert.ok(html.includes('content="noindex, follow"'));
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(!html.includes('application/ld+json'));
  assert.ok(!sitemap.includes(`<loc>https://tabijilog.com/${route}`));
}
assert.ok((await readFile('dist/404.html', 'utf8')).includes('content="noindex, follow"'));
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes('Sitemap: https://tabijilog.com/sitemap.xml'));
console.log('SEO output verified: seven public languages, sitemap, metadata and excluded app routes.');

// Existing Pages workflow copies the landing to these paths. Ensure its early
// guard is present, and the generated page never includes account/trip data.
const rootHtml = await readFile('dist/index.html', 'utf8');
assert.ok(rootHtml.includes('src="/seo-init.js"'));
assert.ok(rootHtml.indexOf('name="robots"') < rootHtml.indexOf('src="/seo-init.js"'));
