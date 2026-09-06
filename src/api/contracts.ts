import type { components as SessionComponents } from './generated/session';
import type { components as TravelsComponents } from './generated/travels';

type SessionSchema = SessionComponents['schemas'];
type TravelsSchema = TravelsComponents['schemas'];

export type AuthResponse = SessionSchema['BrowserAuthResponse'];
export type UserProfileResponse = SessionSchema['UserProfileResponse'];
export type TripListDto = TravelsSchema['TripListDto'] & { currency: string };
export type TripDetailDto = TravelsSchema['TripDetailDto'] & { currency: string };
export interface PublicTripDto { id: string; name: string; description?: string | null; coverImageUrl?: string | null; currency: string; dayCount: number; activityCount: number; updatedAt: string; language?: string | null; authorName?: string | null; }
export interface UserSearchResult { id: string; firstName: string; lastName: string; avatarUrl?: string | null; }
export type DayDto = TravelsSchema['DayDto'];
export type ActivityDto = TravelsSchema['ActivityDto'];
export type AccommodationDto = TravelsSchema['AccommodationDto'];
export type ShoppingItemDto = TravelsSchema['ShoppingItemDto'];
export type TravelerDto = TravelsSchema['TravelerDto'];

export interface ProblemDetails {
  title?: string | null;
  detail?: string | null;
  status?: number | string | null;
  code?: string;
  errors?: Record<string, string[]>;
}
