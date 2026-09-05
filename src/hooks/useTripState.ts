import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mapTrip } from '../api/mappers';
import { travelsApi } from '../api/travelsApi';
import type { Accommodation, Activity, EntityId, ShoppingItem, Traveler, Trip, ViewType } from '../types';

type RemoteRunner = (operation: () => Promise<void>) => Promise<void>;
type TripView = Exclude<ViewType, 'account'>;

interface TripUiState {
  trips: Trip[];
  activeTripId: string;
  currentView: ViewType;
  lastTripView: TripView;
  publicPreview: boolean;
}

const emptyTrip: Trip = { id: '', tripName: '', currency: 'EUR', days: [], accommodations: [], shoppingItems: [], travelers: [], currentDay: 0 };
const viewRoutes: Record<ViewType, string> = { planning: '/planning', budget: '/budget', objects: '/objects', travelers: '/travelers', account: '/account' };
const routeViews = new Map(Object.entries(viewRoutes).map(([view, route]) => [route, view as ViewType]));
const remoteId = (id: EntityId | undefined): string | null => typeof id === 'string' ? id : null;

export const useTripState = (run: RemoteRunner) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationPathRef = useRef(location.pathname);
  const previewReturnRef = useRef<TripUiState | null>(null);
  locationPathRef.current = location.pathname;
  const [store, setStore] = useState<TripUiState>({ trips: [], activeTripId: '', currentView: 'planning', lastTripView: 'planning', publicPreview: false });
  const activeTrip = store.trips.find(trip => trip.id === store.activeTripId) ?? store.trips[0] ?? emptyTrip;
  const canEditActiveTrip = activeTrip.capabilities?.canEdit === true && !store.publicPreview;

  useEffect(() => {
    const routeView = routeViews.get(location.pathname);
    if (routeView) setStore(previous => previous.currentView === routeView ? previous : {
      ...previous, currentView: routeView, lastTripView: routeView === 'account' ? previous.lastTripView : routeView
    });
  }, [location.pathname]);

  const setRemoteTrips = useCallback((trips: Trip[]) => {
    setStore(previous => previous.publicPreview ? previous : ({
      ...previous,
      trips,
      activeTripId: trips.some(trip => trip.id === previous.activeTripId) ? previous.activeTripId : (trips[0]?.id ?? ''),
      currentView: trips.length ? previous.currentView : 'account',
      publicPreview: false
    }));
  }, []);

  const loadRemoteTrips = useCallback(async () => {
    const summaries = await travelsApi.listTrips();
    const details = await Promise.all(summaries.map(summary => travelsApi.getTrip(summary.id)));
    setRemoteTrips(details.map(detail => mapTrip(detail)));
    if (locationPathRef.current === '/') navigate(summaries.length ? '/planning' : '/account', { replace: true });
  }, [navigate, setRemoteTrips]);

  const refreshTrip = useCallback(async (tripId: string, requestedDay?: number) => {
    const detail = await travelsApi.getTrip(tripId);
    setStore(previous => ({ ...previous, trips: previous.trips.map(trip => trip.id === tripId ? mapTrip(detail, requestedDay ?? trip.currentDay) : trip) }));
  }, []);

  const updateActiveTrip = useCallback((update: (trip: Trip) => Trip) => {
    setStore(previous => ({ ...previous, trips: previous.trips.map(trip => trip.id === previous.activeTripId ? update(trip) : trip) }));
  }, []);

  const resetTrips = useCallback(() => {
    previewReturnRef.current = null;
    setStore({ trips: [], activeTripId: '', currentView: 'planning', lastTripView: 'planning', publicPreview: false });
    navigate('/', { replace: true });
  }, [navigate]);

  const openPublicPreview = useCallback(async (tripId: string) => {
    const trip = mapTrip(await travelsApi.getPublicTrip(tripId));
    previewReturnRef.current = store;
    setStore({ trips: [trip], activeTripId: trip.id, currentView: 'planning', lastTripView: 'planning', publicPreview: true });
    navigate('/planning');
  }, [navigate, store]);

  const closePublicPreview = useCallback(() => {
    const previous = previewReturnRef.current;
    previewReturnRef.current = null;
    if (previous?.currentView === 'account') {
      setStore({ ...previous, currentView: 'account', publicPreview: false });
      navigate('/account', { replace: true });
    } else {
      setStore({ trips: [], activeTripId: '', currentView: 'planning', lastTripView: 'planning', publicPreview: false });
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const importPublicPreview = useCallback(() => {
    if (!store.publicPreview || !activeTrip.id) return Promise.resolve();
    const publicTripId = activeTrip.id;
    return run(async () => {
      const created = mapTrip(await travelsApi.copyPublicTrip(publicTripId));
      const previousTrips = previewReturnRef.current?.trips ?? [];
      previewReturnRef.current = null;
      setStore(previous => ({ ...previous, trips: [...previousTrips, created], activeTripId: created.id, currentView: 'planning', lastTripView: 'planning', publicPreview: false }));
      navigate('/planning');
    });
  }, [activeTrip.id, navigate, run, store.publicPreview]);

  const createTrip = useCallback((name: string, description?: string, currency = 'EUR') => run(async () => {
    const created = mapTrip(await travelsApi.createTrip(name, description, currency));
    setStore(previous => ({ ...previous, trips: [...previous.trips, created], activeTripId: created.id, currentView: 'planning' }));
    navigate('/planning');
  }), [navigate, run]);

  const copyPublicTrip = useCallback((tripId: string) => run(async () => {
    const created = mapTrip(await travelsApi.copyPublicTrip(tripId));
    setStore(previous => ({ ...previous, trips: [...previous.trips, created], activeTripId: created.id, currentView: 'planning' }));
    navigate('/planning');
  }), [navigate, run]);

  const deleteTrip = useCallback((tripId: string) => run(async () => {
    await travelsApi.deleteTrip(tripId);
    const hasRemainingTrips = store.trips.some(trip => trip.id !== tripId);
    setStore(previous => {
      const trips = previous.trips.filter(trip => trip.id !== tripId);
      return { ...previous, trips, activeTripId: trips[0]?.id ?? '', currentView: trips.length ? previous.currentView : 'account' };
    });
    navigate(hasRemainingTrips ? viewRoutes[store.currentView] : '/account');
  }), [navigate, run, store.currentView, store.trips]);

  const switchTrip = useCallback((tripId: string) => setStore(previous => previous.trips.some(trip => trip.id === tripId) ? {
    ...previous, activeTripId: tripId, currentView: previous.currentView === 'account' ? previous.lastTripView : previous.currentView
  } : previous), []);

  const setCurrentDay = useCallback((day: number) => updateActiveTrip(trip => ({ ...trip, currentDay: Math.max(0, Math.min(day, trip.days.length - 1)) })), [updateActiveTrip]);
  const setCurrentView = useCallback((view: ViewType) => {
    setStore(previous => ({ ...previous, currentView: view, lastTripView: view === 'account' ? previous.lastTripView : view }));
    navigate(viewRoutes[view]);
  }, [navigate]);

  const addDay = useCallback((title: string) => {
    if (!canEditActiveTrip) return Promise.resolve();
    const tripId = activeTrip.id;
    return run(async () => { await travelsApi.createDay(tripId, title); await refreshTrip(tripId, activeTrip.days.length); });
  }, [activeTrip.days.length, activeTrip.id, canEditActiveTrip, refreshTrip, run]);

  const moveDay = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!canEditActiveTrip) return;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= activeTrip.days.length || toIndex >= activeTrip.days.length) return;
    const reordered = [...activeTrip.days];
    const originalDays = activeTrip.days;
    const originalCurrentDay = activeTrip.currentDay;
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updateActiveTrip(trip => ({ ...trip, days: reordered, currentDay: trip.currentDay === fromIndex ? toIndex : trip.currentDay }));
    try {
      await run(async () => {
        await travelsApi.reorderDays(activeTrip.id, reordered.map(day => remoteId(day.id)).filter((id): id is string => Boolean(id)));
        await refreshTrip(activeTrip.id, toIndex);
      });
    } catch (reason) {
      updateActiveTrip(trip => ({ ...trip, days: originalDays, currentDay: originalCurrentDay }));
      throw reason;
    }
  }, [activeTrip, canEditActiveTrip, refreshTrip, run, updateActiveTrip]);

  const addActivity = useCallback((activity: Activity) => {
    if (!canEditActiveTrip) return Promise.resolve();
    const dayId = remoteId(activeTrip.days[activeTrip.currentDay]?.id);
    if (!dayId) return Promise.resolve();
    return run(async () => { await travelsApi.createActivity(activeTrip.id, dayId, activity); await refreshTrip(activeTrip.id); });
  }, [activeTrip, canEditActiveTrip, refreshTrip, run]);

  const updateActivity = useCallback((index: number, activity: Activity) => {
    if (!canEditActiveTrip) return Promise.resolve();
    const day = activeTrip.days[activeTrip.currentDay];
    const existing = day?.activities[index];
    const dayId = remoteId(day?.id), activityId = remoteId(existing?.id);
    if (!dayId || !activityId) return Promise.resolve();
    return run(async () => { await travelsApi.updateActivity(activeTrip.id, dayId, activityId, { ...activity, isDone: existing.isDone }); await refreshTrip(activeTrip.id); });
  }, [activeTrip, canEditActiveTrip, refreshTrip, run]);

  const deleteActivity = useCallback((index: number) => {
    if (!canEditActiveTrip) return Promise.resolve();
    const day = activeTrip.days[activeTrip.currentDay];
    const dayId = remoteId(day?.id), activityId = remoteId(day?.activities[index]?.id);
    if (!dayId || !activityId) return Promise.resolve();
    return run(async () => { await travelsApi.deleteActivity(activeTrip.id, dayId, activityId); await refreshTrip(activeTrip.id); });
  }, [activeTrip, canEditActiveTrip, refreshTrip, run]);

  const toggleActivityDone = useCallback((index: number) => {
    const day = activeTrip.days[activeTrip.currentDay], activity = day?.activities[index];
    if (!activity) return Promise.resolve();
    return updateActivity(index, { ...activity, isDone: !activity.isDone });
  }, [activeTrip, updateActivity]);

  const addAccommodation = useCallback((item: Omit<Accommodation, 'id'>) => canEditActiveTrip ? run(async () => { await travelsApi.createAccommodation(activeTrip.id, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(), [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const updateAccommodation = useCallback((id: EntityId, item: Omit<Accommodation, 'id'>) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.updateAccommodation(activeTrip.id, value, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const deleteAccommodation = useCallback((id: EntityId) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.deleteAccommodation(activeTrip.id, value); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const getAccommodationsForDay = useCallback((day: number) => activeTrip.accommodations.filter(item => day >= item.fromDay && day <= item.toDay), [activeTrip.accommodations]);

  const addShoppingItem = useCallback((item: Omit<ShoppingItem, 'id'>) => canEditActiveTrip ? run(async () => { await travelsApi.createShoppingItem(activeTrip.id, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(), [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const updateShoppingItem = useCallback((id: EntityId, item: Omit<ShoppingItem, 'id'>) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.updateShoppingItem(activeTrip.id, value, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const deleteShoppingItem = useCallback((id: EntityId) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.deleteShoppingItem(activeTrip.id, value); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const toggleShoppingPurchased = useCallback((id: EntityId) => { const item = activeTrip.shoppingItems.find(candidate => candidate.id === id); return item ? updateShoppingItem(id, { ...item, purchased: !item.purchased }) : Promise.resolve(); }, [activeTrip.shoppingItems, updateShoppingItem]);

  const addTraveler = useCallback((item: Omit<Traveler, 'id'>) => canEditActiveTrip ? run(async () => { await travelsApi.createTraveler(activeTrip.id, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(), [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const updateTraveler = useCallback((id: EntityId, item: Omit<Traveler, 'id'>) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.updateTraveler(activeTrip.id, value, item); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);
  const deleteTraveler = useCallback((id: EntityId) => { const value = remoteId(id); return canEditActiveTrip && value ? run(async () => { await travelsApi.deleteTraveler(activeTrip.id, value); await refreshTrip(activeTrip.id); }) : Promise.resolve(); }, [activeTrip.id, canEditActiveTrip, refreshTrip, run]);

  return {
    store, activeTrip, loadRemoteTrips, resetTrips, openPublicPreview, closePublicPreview, importPublicPreview, createTrip, copyPublicTrip, deleteTrip, switchTrip,
    setCurrentDay, setCurrentView, addDay, moveDay, addActivity, updateActivity,
    deleteActivity, toggleActivityDone, addAccommodation, updateAccommodation,
    deleteAccommodation, getAccommodationsForDay, addShoppingItem, updateShoppingItem,
    deleteShoppingItem, toggleShoppingPurchased, addTraveler, updateTraveler, deleteTraveler
  };
};
