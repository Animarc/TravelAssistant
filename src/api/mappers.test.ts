import { describe, expect, it } from 'vitest';
import { mapTrip } from './mappers';
import type { TripDetailDto } from './contracts';

const tripDto: TripDetailDto = {
  id: 'trip-1', name: 'Interlaken', description: 'Alpes', coverImageUrl: null, isPublic: false, currency: 'EUR',
  currentUserRole: 2, capabilities: { canEdit: true, canManageMembers: true, canDelete: true },
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  days: [{ id: 'day-1', order: 0, title: 'Llegada', activities: [{
    id: 'activity-1', order: 0, time: null, name: 'Paseo', description: '', importantInfo: null,
    price: null, currency: null, coordinates: null, type: 'visita',
    isOptional: false, isDone: false
  }] }],
  accommodations: [], shoppingItems: [], travelers: []
};

describe('mapTrip', () => {
  it('maps API data and normalises an absent activity time', () => {
    const trip = mapTrip(tripDto);
    expect(trip.tripName).toBe('Interlaken');
    expect(trip.days[0].activities[0].time).toBe('');
    expect(trip.capabilities?.canManageMembers).toBe(true);
  });

  it('clamps the selected day to the available itinerary', () => {
    expect(mapTrip(tripDto, 99).currentDay).toBe(0);
  });
});
