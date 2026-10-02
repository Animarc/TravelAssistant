import { useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { ReportRatingRequest } from '../api/contracts';
import type { Language } from '../types';
import type { TranslationKey } from '../i18n/translations';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';

export default function ReviewReport({ target, language }: { target: Omit<ReportRatingRequest, 'reason'>; language: Language }) {
  const { t } = useTranslation(language);
  const [open, setOpen] = useState(false), [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const submit = async () => {
    if (busy || reason.trim().length < 3) return;
    setBusy(true); setError(null);
    try { await travelsApi.reportRating({ ...target, reason: reason.trim() }); setSent(true); setOpen(false); }
    catch (problem) { setError(getErrorKey(problem)); }
    finally { setBusy(false); }
  };
  if (sent) return <small role="status">{t('reportSent')}</small>;
  return <div className="review-report">
    {!open ? <button type="button" className="secondary-button" onClick={() => setOpen(true)}>{t('reportReview')}</button> : <form onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label>{t('reportReason')}<textarea required minLength={3} maxLength={1000} rows={3} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
      <small>{t('reportHelp')}</small><div className="rating-actions"><button disabled={busy || reason.trim().length < 3}>{busy ? t('saving') : t('sendReport')}</button><button type="button" className="secondary-button" disabled={busy} onClick={() => { setOpen(false); setError(null); }}>{t('cancel')}</button></div>
    </form>}
    {error && <p role="alert" className="form-error">{t(error)}</p>}
  </div>;
}
