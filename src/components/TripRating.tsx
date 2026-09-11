import { useEffect, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { TripRatingDto } from '../api/contracts';
import { getErrorKey } from '../hooks/useAsyncOperation';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types';

interface Props { tripId: string; authenticated: boolean; language: Language; initialAverage?: number; initialCount?: number; expanded?: boolean; }

const TripRating = ({ tripId, authenticated, language, initialAverage = 0, initialCount = 0, expanded = false }: Props) => {
  const { t } = useTranslation(language);
  const [rating, setRating] = useState<TripRatingDto>({ averageRating: initialAverage, ratingCount: initialCount, userRating: null, userReview: null, canRate: false, reviews: [] });
  const [draftScore, setDraftScore] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void travelsApi.getTripRating(tripId, authenticated).then(value => { if (active) { setRating(value); setDraftScore(value.userRating ?? 0); setReview(value.userReview ?? ''); } }).catch(() => undefined);
    return () => { active = false; };
  }, [authenticated, tripId]);

  const rate = async (score: number, opinion?: string) => {
    if (!rating.canRate || saving) return;
    setSaving(true); setError(null);
    try { const value = await travelsApi.rateTrip(tripId, score, opinion); setRating(value); setDraftScore(value.userRating ?? 0); setReview(value.userReview ?? ''); }
    catch (reason) { setError(t(getErrorKey(reason))); }
    finally { setSaving(false); }
  };

  return <div className={`trip-rating ${expanded ? 'trip-rating-expanded' : 'trip-rating-compact'}`}>
    <div className="trip-rating-summary" aria-label={`${t('tripRating')}: ${rating.averageRating.toFixed(1)}`}>
      <span aria-hidden="true">★</span><strong>{rating.ratingCount ? rating.averageRating.toFixed(1) : '—'}</strong>
      <small>{rating.ratingCount} {rating.ratingCount === 1 ? t('rating') : t('ratings')}</small>
    </div>
    {authenticated && rating.canRate && <fieldset disabled={saving} className="rating-stars">
      <legend>{rating.userRating ? t('yourRating') : t('rateThisTrip')}</legend>
      {[1, 2, 3, 4, 5].map(score => <button key={score} type="button" className={score <= (expanded ? draftScore : (rating.userRating ?? 0)) ? 'selected' : ''} onClick={() => expanded ? setDraftScore(score) : void rate(score)} aria-label={`${score} ${t('stars')}`} aria-pressed={(expanded ? draftScore : rating.userRating) === score}>★</button>)}
    </fieldset>}
    {expanded && authenticated && rating.canRate && <div className="review-editor">
      <label>{t('writeReview')}<textarea rows={5} maxLength={2000} value={review} onChange={event => setReview(event.target.value)} placeholder={t('reviewPlaceholder')} /></label>
      <div><small>{review.length}/2000</small><button type="button" disabled={saving || draftScore === 0} onClick={() => void rate(draftScore, review)}>{saving ? t('saving') : t('publishReview')}</button></div>
    </div>}
    {!authenticated && <small>{t('loginToRate')}</small>}
    {authenticated && !rating.canRate && <small>{t('cannotRateOwnTrip')}</small>}
    {error && <p role="alert" className="form-error">{error}</p>}
    {expanded && <section className="reviews-list"><h2>{t('travelerOpinions')}</h2>
      {rating.reviews.length === 0 ? <p className="empty-state">{t('noReviewsYet')}</p> : rating.reviews.map(item => <article key={`${item.username}-${item.updatedAt}`}><header><strong>@{item.username}</strong><span aria-label={`${item.score} ${t('stars')}`}>{'★'.repeat(item.score)}</span></header><p>{item.review}</p></article>)}
    </section>}
  </div>;
};

export default TripRating;
