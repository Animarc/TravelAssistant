import type { ActivityType, DocumentType, ShoppingCategory, Trip, TripRole } from '../types';
import type { TripDetailDto } from './contracts';

const role = (value: string | number): TripRole =>
  typeof value === 'string' ? value.toLowerCase() as TripRole : (['viewer', 'editor', 'owner'][value] ?? 'viewer') as TripRole;
const optional = (value: string | null) => value ?? undefined;
const coordinates = (value: (string | number)[] | null): [number, number] | undefined =>
  value?.length === 2 ? [Number(value[0]), Number(value[1])] : undefined;

export const mapTrip = (dto: TripDetailDto, currentDay = 0): Trip => ({
  id: dto.id,
  tripName: dto.name,
  description: optional(dto.description),
  coverImageUrl: optional(dto.coverImageUrl),
  isPublic: dto.isPublic,
  currency: dto.currency || 'EUR',
  currentUserRole: role(dto.currentUserRole),
  capabilities: dto.capabilities,
  currentDay: dto.days.length ? Math.min(currentDay, dto.days.length - 1) : 0,
  days: dto.days.map(day => ({
    id: day.id,
    title: day.title,
    activities: day.activities.map(activity => ({
      ...activity,
      order: undefined,
      time: activity.time ?? '',
      importantInfo: optional(activity.importantInfo),
      price: activity.price === null ? undefined : Number(activity.price),
      currency: optional(activity.currency),
      coordinates: coordinates(activity.coordinates),
      type: activity.type as ActivityType
    }))
  })),
  accommodations: dto.accommodations.map(item => ({
    id: item.id, name: item.name, price: Number(item.price), link: optional(item.link),
    fromDay: Number(item.fromDay), toDay: Number(item.toDay), coordinates: coordinates(item.coordinates)
  })),
  shoppingItems: dto.shoppingItems.map(item => ({
    ...item, price: Number(item.price), link: optional(item.link), category: item.category as ShoppingCategory
  })),
  travelers: dto.travelers.map(traveler => ({
    ...traveler,
    age: Number(traveler.age),
    email: optional(traveler.email),
    phonePrefix: optional(traveler.phonePrefix),
    phone: optional(traveler.phone),
    documents: traveler.documents.map(document => ({ ...document, type: document.type as DocumentType }))
  }))
});
