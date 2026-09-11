import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import TripRating from './TripRating';

const RatingsView = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const trip = state.trips.find(item => item.id === state.activeTripId);
  if (!trip) return null;
  return <section className="ratings-view">
    <header><span className="welcome-kicker">{t('community')}</span><h1>{t('ratingsAndReviews')}</h1><p>{t('ratingsIntro')}</p></header>
    <TripRating tripId={trip.id} authenticated={state.isAuthenticated} language={state.language} expanded />
  </section>;
};

export default RatingsView;
