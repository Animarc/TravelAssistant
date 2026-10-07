import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('dist');
const origin = 'https://tabijilog.com';
const copy = JSON.parse(await readFile('src/i18n/seo.json', 'utf8'));
const translations = JSON.parse(await readFile('src/i18n/resources.json', 'utf8'));
const languages = Object.keys(copy);
const homePath = language => `/${language}/`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const template = (await readFile(resolve(output, 'index.html'), 'utf8'))
  .replace(/\s*<meta name="description"[^>]*>/, '')
  .replace(/\s*<title>.*?<\/title>/, '')
  .replace(/\s*<script src="\/seo-init.js"><\/script>/, '');
const alternates = languages.map(language => `<link rel="alternate" hreflang="${language}" href="${origin}${homePath(language)}" />`).join('\n');
const navigation = languages.map(language => `<a href="${homePath(language)}" hreflang="${language}" lang="${language}">${({es:'Español',en:'English',fr:'Français',de:'Deutsch',zh:'中文',ru:'Русский',ja:'日本語'})[language]}</a>`).join(' · ');
const fallbackStyle = `<style id="landing-fallback-style">#landing-fallback{max-width:960px;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif;line-height:1.6;color:#17324d}#landing-fallback a{color:inherit}#landing-fallback nav{display:flex;flex-wrap:wrap;gap:.5rem}html[data-theme="dark"] #landing-fallback{color:#c4e0f4}</style>`;
const landing = language => {
  const text = copy[language], t = translations[language];
  const url = origin + homePath(language);
  const metadata = `<title>${escape(text.title)}</title>
<meta name="description" content="${escape(text.description)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
${alternates}
<link rel="alternate" hreflang="x-default" href="${origin}/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Tabiji Log" />
<meta property="og:title" content="${escape(text.title)}" />
<meta property="og:description" content="${escape(text.description)}" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escape(text.title)}" />
<meta name="twitter:description" content="${escape(text.description)}" />
<script type="application/ld+json" data-seo>${JSON.stringify({ '@context':'https://schema.org', '@type':'WebApplication', name:'Tabiji Log', url, description:text.description, inLanguage:language, applicationCategory:'TravelApplication', operatingSystem:'Web' }).replace(/</g, '\\u003c')}</script>
${fallbackStyle}
<script src="/seo-init.js"></script>`;
  const content = `<main id="landing-fallback"><a href="/">Tabiji Log</a><h1>${escape(t.welcomeTitle)}</h1><p>${escape(t.welcomeIntro)}</p><section><h2>${escape(text.heading)}</h2><ul>${text.features.map(feature => `<li>${escape(feature)}</li>`).join('')}</ul></section><nav aria-label="${escape(t.language)}">${navigation}</nav><noscript><p>${escape(text.noScript)}</p></noscript></main>`;
  return template.replace('<html lang="es">', `<html lang="${language}">`).replace('</head>', `${metadata}\n</head>`).replace('<div id="root"></div>', `<div id="root">${content}</div>`);
};
for (const language of languages) {
  const directory = resolve(output, homePath(language).slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), landing(language));
}
await writeFile(resolve(output, 'index.html'), landing('es'));
// These are app screens, never copies of an indexable public landing page.
const privateHtml = template.replace('</head>', '<title>Tabiji Log</title>\n<meta name="robots" content="noindex, follow" />\n<script src="/seo-init.js"></script>\n</head>');
for (const route of ['settings', 'account', 'planning', 'budget', 'objects', 'travelers', 'ratings', 'verify-email']) {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), privateHtml);
}
await writeFile(resolve(output, '404.html'), privateHtml);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
const sitemapEntries = languages.map(language => `<url><loc>${origin}${homePath(language)}</loc>${languages.map(locale => `<xhtml:link rel="alternate" hreflang="${locale}" href="${origin}${homePath(locale)}" />`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}/" /></url>`).join('\n');
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries}\n</urlset>\n`);
