import { useEffect, useRef, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { RatingReportDto } from '../api/contracts';
import type { Language } from '../types';
import type { TranslationKey } from '../i18n/translations';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';
import '../styles/ratings.css';
export default function RatingModeration({ language }: { language: Language }) {
  const { t } = useTranslation(language);
  const [reports, setReports] = useState<RatingReportDto[]>([]), [busy, setBusy] = useState(true), [more, setMore] = useState(false), [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null), [notice, setNotice] = useState<TranslationKey | null>(null);
  const active = useRef(false), lock = useRef(false);
  const load = async (skip = 0) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try { const page = await travelsApi.ratingReports(skip); if (active.current) { setReports(current => skip ? [...current, ...page.filter(item => !current.some(r => r.id === item.id))] : page); setMore(page.length === 50); } }
    catch (problem) { if (active.current) setError(getErrorKey(problem)); }
    finally { lock.current = false; if (active.current) setBusy(false); }
  };
  useEffect(() => { active.current = true; void load(); return () => { active.current = false; }; }, []);
  const resolve = async (id: string, remove: boolean) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null); setNotice(null);
    try { const result = await travelsApi.resolveRatingReport(id, remove); if (active.current) { setReports(current => current.filter(r => r.id !== id)); setConfirm(null); setNotice(result.status === 'changed' ? 'reportChanged' : 'reportResolved'); } }
    catch (problem) { if (active.current) setError(getErrorKey(problem)); }
    finally { lock.current = false; if (active.current) setBusy(false); }
  };
  return <section className="account-section moderation-panel" aria-busy={busy}>
    <div className="account-section-heading"><h2>{t('moderation')}</h2><button className="secondary-button" disabled={busy} onClick={() => void load()}>{t('refreshReports')}</button></div>
    {busy && <p role="status">{t('loading')}</p>}{error && <p role="alert" className="form-error">{t(error)}</p>}{notice && <p role="status">{t(notice)}</p>}
    {!busy && !error && reports.length === 0 && <p>{t('noReports')}</p>}
    {reports.map(report => <article className="moderation-report" key={report.id}>
      <header><strong>@{report.authorUsername}</strong><span>{'★'.repeat(report.score)}</span><small>{new Date(report.createdAt).toLocaleString(language)}</small></header>
      <small>{t(report.kind === 'trip' ? 'tripRating' : 'rateThisUser')}</small>{report.review && <blockquote>{report.review}</blockquote>}<p><strong>{t('reportReason')}: </strong>{report.reason}</p>
      {confirm === report.id ? <div><p>{t('confirmRemoveRating')}</p><div className="rating-actions"><button className="danger-button" disabled={busy} onClick={() => void resolve(report.id, true)}>{t('removeRating')}</button><button className="secondary-button" disabled={busy} onClick={() => setConfirm(null)}>{t('cancel')}</button></div></div> : <div className="rating-actions"><button className="secondary-button" disabled={busy} onClick={() => void resolve(report.id, false)}>{t('dismissReport')}</button><button className="danger-button" disabled={busy} onClick={() => setConfirm(report.id)}>{t('removeRating')}</button></div>}
    </article>)}
    {more && <button disabled={busy} onClick={() => void load(reports.length)}>{t('moreReports')}</button>}
  </section>;
}
