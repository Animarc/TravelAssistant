import type { Accommodation, Activity, ShoppingItem, Traveler, TripInvitation, TripMember, TripRole } from '../types';
import { apiRequest, TRAVELS_API_URL } from './client';
import type { AccommodationDto, ActivityDto, DayDto, PublicTripDto, ShoppingItemDto, TravelerDto, TripDetailDto, TripListDto } from './contracts';

const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
const put = (body: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(body) });
const coordinates = (value?: [number, number]) => ({ latitude: value?.[0] ?? null, longitude: value?.[1] ?? null });

export const travelsApi = {
  listTrips: async () => {
    const trips: TripListDto[] = [];
    for (let skip = 0; ; skip += 100) {
      const page = await apiRequest<TripListDto[]>(TRAVELS_API_URL, `/api/trips?skip=${skip}&take=100`);
      trips.push(...page);
      if (page.length < 100) return trips;
    }
  },
  getTrip: (tripId: string) => apiRequest<TripDetailDto>(TRAVELS_API_URL, `/api/trips/${tripId}`),
  createTrip: (name: string, description?: string, currency = 'EUR') => apiRequest<TripDetailDto>(TRAVELS_API_URL, '/api/trips', json({ name, description, isPublic: false, currency })),
  updateTrip: (tripId: string, name: string, description?: string, coverImageUrl?: string, isPublic = false, currency = 'EUR') =>
    apiRequest<TripDetailDto>(TRAVELS_API_URL, `/api/trips/${tripId}`, put({ name, description, coverImageUrl, isPublic, currency })),
  deleteTrip: (tripId: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}`, { method: 'DELETE' }),
  listPublicTrips: (query = '', language = '') => apiRequest<PublicTripDto[]>(TRAVELS_API_URL, `/api/trips/public?query=${encodeURIComponent(query)}${language ? `&language=${encodeURIComponent(language)}` : ''}`, {}, false),
  getPublicTrip: (tripId: string) => apiRequest<TripDetailDto>(TRAVELS_API_URL, `/api/trips/public/${tripId}`, {}, false),
  copyPublicTrip: (tripId: string) => apiRequest<TripDetailDto>(TRAVELS_API_URL, `/api/trips/public/${tripId}/copy`, { method: 'POST' }),

  createDay: (tripId: string, title: string) => apiRequest<DayDto>(TRAVELS_API_URL, `/api/trips/${tripId}/days`, json({ title })),
  updateDay: (tripId: string, dayId: string, title: string) => apiRequest<DayDto>(TRAVELS_API_URL, `/api/trips/${tripId}/days/${dayId}`, put({ title })),
  deleteDay: (tripId: string, dayId: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/days/${dayId}`, { method: 'DELETE' }),
  reorderDays: (tripId: string, dayIds: string[]) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/days/reorder`, json({ dayIds })),

  createActivity: (tripId: string, dayId: string, activity: Activity) => apiRequest<ActivityDto>(TRAVELS_API_URL, `/api/trips/${tripId}/days/${dayId}/activities`, json({
    time: activity.time || null, name: activity.name, description: activity.description, importantInfo: activity.importantInfo ?? null,
    price: activity.price === undefined || activity.price === '' ? null : Number(activity.price), currency: activity.currency ?? null,
    ...coordinates(activity.coordinates), type: activity.type ?? 'normal', isOptional: activity.isOptional ?? false
  })),
  updateActivity: (tripId: string, dayId: string, activityId: string, activity: Activity) => apiRequest<ActivityDto>(TRAVELS_API_URL, `/api/trips/${tripId}/days/${dayId}/activities/${activityId}`, put({
    time: activity.time || null, name: activity.name, description: activity.description, importantInfo: activity.importantInfo ?? null,
    price: activity.price === undefined || activity.price === '' ? null : Number(activity.price), currency: activity.currency ?? null,
    ...coordinates(activity.coordinates), type: activity.type ?? 'normal', isOptional: activity.isOptional ?? false, isDone: activity.isDone ?? false
  })),
  deleteActivity: (tripId: string, dayId: string, activityId: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/days/${dayId}/activities/${activityId}`, { method: 'DELETE' }),

  createAccommodation: (tripId: string, item: Omit<Accommodation, 'id'>) => apiRequest<AccommodationDto>(TRAVELS_API_URL, `/api/trips/${tripId}/accommodations`, json({ ...item, ...coordinates(item.coordinates) })),
  updateAccommodation: (tripId: string, id: string, item: Omit<Accommodation, 'id'>) => apiRequest<AccommodationDto>(TRAVELS_API_URL, `/api/trips/${tripId}/accommodations/${id}`, put({ ...item, ...coordinates(item.coordinates) })),
  deleteAccommodation: (tripId: string, id: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/accommodations/${id}`, { method: 'DELETE' }),

  createShoppingItem: (tripId: string, item: Omit<ShoppingItem, 'id'>) => apiRequest<ShoppingItemDto>(TRAVELS_API_URL, `/api/trips/${tripId}/shopping`, json(item)),
  updateShoppingItem: (tripId: string, id: string, item: Omit<ShoppingItem, 'id'>) => apiRequest<ShoppingItemDto>(TRAVELS_API_URL, `/api/trips/${tripId}/shopping/${id}`, put(item)),
  deleteShoppingItem: (tripId: string, id: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/shopping/${id}`, { method: 'DELETE' }),

  createTraveler: (tripId: string, item: Omit<Traveler, 'id'>) => apiRequest<TravelerDto>(TRAVELS_API_URL, `/api/trips/${tripId}/travelers`, json(item)),
  updateTraveler: (tripId: string, id: string, item: Omit<Traveler, 'id'>) => apiRequest<TravelerDto>(TRAVELS_API_URL, `/api/trips/${tripId}/travelers/${id}`, put(item)),
  deleteTraveler: (tripId: string, id: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/travelers/${id}`, { method: 'DELETE' }),

  getMembers: (tripId: string) => apiRequest<TripMember[]>(TRAVELS_API_URL, `/api/trips/${tripId}/members`),
  invite: (tripId: string, email: string, role: Exclude<TripRole, 'owner'>) => apiRequest<TripInvitation>(TRAVELS_API_URL, `/api/trips/${tripId}/members/invitations`, json({ email, role })),
  updateMember: (tripId: string, userId: string, role: Exclude<TripRole, 'owner'>) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/members/${userId}`, put({ role })),
  removeMember: (tripId: string, userId: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trips/${tripId}/members/${userId}`, { method: 'DELETE' }),
  getInvitations: () => apiRequest<TripInvitation[]>(TRAVELS_API_URL, '/api/trip-invitations'),
  acceptInvitation: (id: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trip-invitations/${id}/accept`, { method: 'POST' }),
  declineInvitation: (id: string) => apiRequest<void>(TRAVELS_API_URL, `/api/trip-invitations/${id}/decline`, { method: 'POST' })
};
