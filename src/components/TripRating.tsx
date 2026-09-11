import { useEffect, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { TripRatingDto } from '../api/contracts';
import { getErrorKey } from '../hooks/useAsyncOperation';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types';

interface Props { tripId: string; authenticated: boolean; language: Language; initialAverage?: number; initialCount?: number; }

const TripRating = ({ tripId, authenticated, language, initialAverage = 0, initialCount = 0 }: Props) => {
  const { t } = useTranslation(language);
  const [rating, setRating] = useState<TripRatingDto>({ averageRating: initialAverage, ratingCount: initialCount, userRating: null, canRate: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void travelsApi.getTripRating(tripId, authenticated).then(value => { if (active) setRating(value); }).catch(() => undefined);
    return () => { active = false; };
  }, [authenticated, tripId]);

  const rate = async (score: number) => {
    if (!rating.canRate || saving) return;
    setSaving(true); setError(null);
    try { setRating(await travelsApi.rateTrip(tripId, score)); }
    catch (reason) { setError(t(getErrorKey(reason))); }
    finally { setSaving(false); }
  };

  return <div className="trip-rating">
    <div className="trip-rating-summary" aria-label={`${t('tripRating')}: ${rating.averageRating.toFixed(1)}`}>
      <span aria-hidden="true">★</span><strong>{rating.ratingCount ? rating.averageRating.toFixed(1) : '—'}</strong>
      <small>{rating.ratingCount} {rating.ratingCount === 1 ? t('rating') : t('ratings')}</small>
    </div>
    {authenticated && rating.canRate && <fieldset disabled={saving} className="rating-stars">
      <legend>{rating.userRating ? t('yourRating') : t('rateThisTrip')}</legend>
      {[1, 2, 3, 4, 5].map(score => <button key={score} type="button" className={score <= (rating.userRating ?? 0) ? 'selected' : ''} onClick={() => void rate(score)} aria-label={`${score} ${t('stars')}`} aria-pressed={rating.userRating === score}>★</button>)}
    </fieldset>}
    {!authenticated && <small>{t('loginToRate')}</small>}
    {authenticated && !rating.canRate && <small>{t('cannotRateOwnTrip')}</small>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
};

export default TripRating;
