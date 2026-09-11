import { useEffect, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { UserRatingDto } from '../api/contracts';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types';

interface Props { tripId: string; userId: string; language: Language; initialAverage: number; initialCount: number; }

const UserRating = ({ tripId, userId, language, initialAverage, initialCount }: Props) => {
  const { t } = useTranslation(language);
  const [value, setValue] = useState<UserRatingDto>({ userId, averageRating: initialAverage, ratingCount: initialCount, userRating: null, userReview: null, canRate: false, reviews: [] });
  const [score, setScore] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { void travelsApi.getUserRating(tripId, userId).then(result => { setValue(result); setScore(result.userRating ?? 0); setReview(result.userReview ?? ''); }); }, [tripId, userId]);

  const save = async () => {
    if (!score || saving || !value.canRate) return;
    setSaving(true);
    try { const result = await travelsApi.rateUser(tripId, userId, score, review); setValue(result); setScore(result.userRating ?? 0); setReview(result.userReview ?? ''); }
    finally { setSaving(false); }
  };

  return <div className="user-rating-panel" onClick={event => event.stopPropagation()}>
    <div className="user-rating-summary"><span>★</span><strong>{value.ratingCount ? value.averageRating.toFixed(1) : '—'}</strong><small>{value.ratingCount} {value.ratingCount === 1 ? t('rating') : t('ratings')}</small></div>
    {value.canRate && <>
      <fieldset disabled={saving} className="rating-stars"><legend>{t('rateThisUser')}</legend>{[1,2,3,4,5].map(item => <button type="button" key={item} className={item <= score ? 'selected' : ''} onClick={() => setScore(item)} aria-label={`${item} ${t('stars')}`}>★</button>)}</fieldset>
      <textarea maxLength={2000} rows={3} value={review} onChange={event => setReview(event.target.value)} placeholder={t('userReviewPlaceholder')} />
      <button type="button" disabled={!score || saving} onClick={() => void save()}>{saving ? t('saving') : t('publishUserRating')}</button>
    </>}
    {value.reviews.length > 0 && <div className="user-reviews"><h4>{t('travelerReviews')}</h4>{value.reviews.map(item => <article key={`${item.username}-${item.updatedAt}`}><header><strong>@{item.username}</strong><span>{'★'.repeat(item.score)}</span></header><p>{item.review}</p></article>)}</div>}
  </div>;
};

export default UserRating;
