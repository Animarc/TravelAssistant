import { travelsApi } from '../api/travelsApi';
import type { Language } from '../types';
import RatingPanel from './RatingPanel';
interface Props { tripId: string; authenticated: boolean; language: Language; initialAverage?: number; initialCount?: number; expanded?: boolean; }
export default function TripRating({ tripId, authenticated, language, initialAverage = 0, initialCount = 0, expanded = false }: Props) {
  return <RatingPanel key={`${tripId}-${authenticated}`} tripId={tripId} authenticated={authenticated} language={language} initialAverage={initialAverage} initialCount={initialCount} expanded={expanded}
    load={() => travelsApi.getTripRating(tripId, authenticated)} save={(score, review) => travelsApi.rateTrip(tripId, score, review)} remove={() => travelsApi.deleteTripRating(tripId)} />;
}
