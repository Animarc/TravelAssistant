import { travelsApi } from '../api/travelsApi';
import type { Language } from '../types';
import RatingPanel from './RatingPanel';
interface Props { tripId: string; userId: string; language: Language; initialAverage: number; initialCount: number; onChanged?: () => void; }
export default function UserRating({ tripId, userId, language, initialAverage, initialCount, onChanged }: Props) {
  return <RatingPanel key={`${tripId}-${userId}`} tripId={tripId} userId={userId} authenticated language={language} initialAverage={initialAverage} initialCount={initialCount} expanded onChanged={onChanged}
    load={() => travelsApi.getUserRating(tripId, userId)} save={(score, review) => travelsApi.rateUser(tripId, userId, score, review)} remove={() => travelsApi.deleteUserRating(tripId, userId)} />;
}
