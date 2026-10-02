import { useEffect, useRef, useState } from 'react';
import type { TripRatingDto } from '../api/contracts';
import type { Language } from '../types';
import type { TranslationKey } from '../i18n/translations';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';
import ReviewReport from './ReviewReport';
import '../styles/ratings.css';

interface Props {
  tripId: string; userId?: string; authenticated: boolean; language: Language; initialAverage: number; initialCount: number; expanded: boolean;
  load: () => Promise<TripRatingDto>; save: (score: number, review?: string) => Promise<TripRatingDto>; remove: () => Promise<TripRatingDto>; onChanged?: () => void;
}
export default function RatingPanel(props: Props) {
  const { t } = useTranslation(props.language), companion = !!props.userId;
  const [value, setValue] = useState<TripRatingDto>({ averageRating: props.initialAverage, ratingCount: props.initialCount, canRate: false, reviews: [] });
  const [score, setScore] = useState(0), [review, setReview] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [retry, setRetry] = useState(0), [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null), [notice, setNotice] = useState<TranslationKey | null>(null);
  const callbacks = useRef(props); callbacks.current = props;
  const mounted = useRef(false), locked = useRef(false);
  const apply = (result: TripRatingDto) => { setValue(result); setScore(result.userRating ?? 0); setReview(result.userReview ?? ''); };
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let active = true; setLoading(true); setError(null);
    void callbacks.current.load().then(result => { if (active) apply(result); }).catch(reason => { if (active) setError(getErrorKey(reason)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const mutate = async (operation: () => Promise<TripRatingDto>, message: TranslationKey) => {
    if (locked.current || loading) return;
    locked.current = true; setBusy(true); setError(null); setNotice(null);
    try { const result = await operation(); if (mounted.current) { apply(result); setNotice(result.isBlocked ? 'ratingRemoved' : message); setConfirmDelete(false); props.onChanged?.(); } }
    catch (problem) { if (mounted.current) setError(getErrorKey(problem)); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  return <div className={`trip-rating ${props.expanded ? 'trip-rating-expanded' : 'trip-rating-compact'} ${companion ? 'user-rating-panel' : ''}`} onClick={event => event.stopPropagation()} aria-busy={loading || busy}>
    <div className="trip-rating-summary" aria-label={`${t('tripRating')}: ${value.averageRating.toFixed(1)}`}><span aria-hidden="true">★</span><strong>{value.ratingCount ? value.averageRating.toFixed(1) : '—'}</strong><small>{value.ratingCount} {value.ratingCount === 1 ? t('rating') : t('ratings')}</small></div>
    {loading && <p role="status">{t('loading')}</p>}
    {!loading && value.canRate && <>
      <fieldset className="rating-stars" disabled={busy}><legend>{value.userRating ? t('yourRating') : t(companion ? 'rateThisUser' : 'rateThisTrip')}</legend>{[1,2,3,4,5].map(item => <button type="button" key={item} aria-label={`${item} ${t('stars')}`} aria-pressed={(props.expanded ? score : value.userRating) === item} className={item <= (props.expanded ? score : value.userRating ?? 0) ? 'selected' : ''} onClick={() => props.expanded ? setScore(item) : void mutate(() => props.save(item), 'ratingSaved')}>★</button>)}</fieldset>
      {props.expanded && <div className="review-editor"><label>{t('writeReview')}<textarea maxLength={2000} rows={companion ? 3 : 5} disabled={busy} value={review} onChange={event => setReview(event.target.value)} placeholder={t(companion ? 'userReviewPlaceholder' : 'reviewPlaceholder')} /></label><div><small>{review.length}/2000</small><button disabled={!score || busy} type="button" onClick={() => void mutate(() => props.save(score, review), 'ratingSaved')}>{busy ? t('saving') : t(companion ? 'publishUserRating' : 'publishReview')}</button></div></div>}
      {value.userRating != null && !confirmDelete && <button className="secondary-button" type="button" disabled={busy} onClick={() => setConfirmDelete(true)}>{t('deleteOwnRating')}</button>}
      {confirmDelete && <div className="rating-delete-confirm"><p>{t('confirmDeleteRating')}</p><div className="rating-actions"><button className="danger-button" type="button" disabled={busy} onClick={() => void mutate(props.remove, 'ratingDeleted')}>{t('delete')}</button><button className="secondary-button" type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>{t('cancel')}</button></div></div>}
    </>}
    {!props.authenticated && <small>{t('loginToRate')}</small>}
    {!loading && !error && props.authenticated && !value.canRate && <small>{t(value.isBlocked ? 'ratingRemoved' : companion ? 'cannotRateOwnUser' : 'cannotRateOwnTrip')}</small>}
    {notice && <p role="status">{t(notice)}</p>}
    {error && <p role="alert" className="form-error">{t(error)} {!value.canRate && <button type="button" disabled={loading} onClick={() => setRetry(n => n + 1)}>{t('retry')}</button>}</p>}
    {props.expanded && !loading && <section className="reviews-list"><h2>{t(companion ? 'travelerReviews' : 'travelerOpinions')}</h2><p className="account-helper">{t(companion ? 'companionRatingRules' : 'tripRatingRules')}</p>{value.reviews.length === 0 ? <p className="empty-state">{t('noReviewsYet')}</p> : value.reviews.map(item => <article key={`${item.authorId ?? item.username}-${item.updatedAt}`}><header><strong>@{item.username}</strong><span aria-label={`${item.score} ${t('stars')}`}>{'★'.repeat(item.score)}</span></header><p>{item.review}</p>{props.authenticated && item.authorId && !item.isOwn && <ReviewReport key={item.updatedAt} target={{ kind: companion ? 'user' : 'trip', tripId: props.tripId, ratedUserId: props.userId, authorId: item.authorId }} language={props.language} />}</article>)}</section>}
  </div>;
}
