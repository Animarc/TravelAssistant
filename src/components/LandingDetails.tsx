import { seoCopy } from '../seo';
import type { Language } from '../types';

export default function LandingDetails({ language }: { language: Language }) {
  const copy = seoCopy[language];
  return <section className="welcome-features" aria-labelledby="welcome-features-title">
    <h2 id="welcome-features-title">{copy.heading}</h2>
    <ul>{copy.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
  </section>;
}
