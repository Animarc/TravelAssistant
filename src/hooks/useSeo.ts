import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Language } from '../types';
import { homeLanguage, homePath, seoCopy, SITE_URL } from '../seo';

const meta = (name: string, content: string, property = false) => {
  const attribute = property ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element); }
  element.content = content;
};

export function useSeo(language: Language, authenticated: boolean, publicPreview: boolean) {
  const location = useLocation();
  useEffect(() => {
    const landing = homeLanguage(location.pathname) !== null && !location.search && !authenticated && !publicPreview;
    const copy = seoCopy[language];
    document.documentElement.lang = language;
    document.title = landing ? copy.title : 'Tabiji Log';
    meta('description', landing ? copy.description : 'Tabiji Log');
    meta('robots', landing ? 'index, follow' : 'noindex, follow');
    meta('og:title', landing ? copy.title : 'Tabiji Log', true);
    meta('og:description', landing ? copy.description : 'Tabiji Log', true);
    meta('og:url', SITE_URL + (landing ? homePath(language) : location.pathname), true);
    meta('twitter:title', landing ? copy.title : 'Tabiji Log');
    meta('twitter:description', landing ? copy.description : 'Tabiji Log');
    document.head.querySelectorAll('link[rel="canonical"], link[hreflang], script[data-seo]').forEach(element => element.remove());
    if (landing) {
      const structured = document.createElement('script');
      structured.type = 'application/ld+json'; structured.dataset.seo = '';
      structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Tabiji Log', url: SITE_URL + homePath(language), description: copy.description, inLanguage: language, applicationCategory: 'TravelApplication', operatingSystem: 'Web' });
      document.head.appendChild(structured);
      const canonical = document.createElement('link');
      canonical.rel = 'canonical'; canonical.href = SITE_URL + homePath(language); document.head.appendChild(canonical);
      for (const locale of Object.keys(seoCopy) as Language[]) {
        const alternate = document.createElement('link'); alternate.rel = 'alternate'; alternate.hreflang = locale;
        alternate.href = SITE_URL + homePath(locale); document.head.appendChild(alternate);
      }
      const fallback = document.createElement('link'); fallback.rel = 'alternate'; fallback.hreflang = 'x-default'; fallback.href = SITE_URL + '/'; document.head.appendChild(fallback);
    }
  }, [language, authenticated, publicPreview, location.pathname, location.search]);
}
