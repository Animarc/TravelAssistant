import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppState, Activity, Accommodation, ShoppingItem, Traveler, ViewType, Language, Trip } from '../types';
import { initialTrips } from '../data';

interface AppStoreState {
  trips: Trip[];
  activeTripId: string;
  currentView: ViewType;
  lastTripView: Exclude<ViewType, 'account'>;
  language: Language;
}

export type SaveStatus = 'saving' | 'saved' | 'saveError';

const STORE_KEY = 'kakomuAppState:v1';
const tripViews: Array<Exclude<ViewType, 'account'>> = ['planning', 'budget', 'objects', 'travelers'];
const languages: Language[] = ['es', 'en', 'fr', 'de', 'zh', 'ru', 'ja'];

const isTripView = (value: unknown): value is Exclude<ViewType, 'account'> =>
  tripViews.includes(value as Exclude<ViewType, 'account'>);

const isView = (value: unknown): value is ViewType => value === 'account' || isTripView(value);
const isLanguage = (value: unknown): value is Language => languages.includes(value as Language);

const isTrip = (value: unknown): value is Trip => {
  if (!value || typeof value !== 'object') return false;
  const trip = value as Partial<Trip>;
  return typeof trip.id === 'string'
    && typeof trip.tripName === 'string'
    && Array.isArray(trip.days)
    && Array.isArray(trip.accommodations)
    && Array.isArray(trip.shoppingItems)
    && Array.isArray(trip.travelers)
    && typeof trip.currentDay === 'number';
};

const normalizeTrip = (trip: Trip): Trip => ({
  ...trip,
  currentDay: trip.days.length === 0
    ? 0
    : Math.min(Math.max(0, trip.currentDay), trip.days.length - 1)
});

const mergeTrips = (savedTrips: Trip[]): Trip[] => [
  ...initialTrips.map(defaultTrip => savedTrips.find(trip => trip.id === defaultTrip.id) ?? defaultTrip),
  ...savedTrips.filter(trip => !initialTrips.some(defaultTrip => defaultTrip.id === trip.id))
].map(normalizeTrip);

const getInitialStore = (): AppStoreState => {
  const savedLang = localStorage.getItem('travelAssistantLang') as Language | null;
  const fallback: AppStoreState = {
    trips: initialTrips.map(normalizeTrip),
    activeTripId: initialTrips[0].id,
    currentView: 'planning',
    lastTripView: 'planning',
    language: isLanguage(savedLang) ? savedLang : 'es'
  };

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return fallback;

    const saved = JSON.parse(raw) as Partial<AppStoreState>;
    const validSavedTrips = Array.isArray(saved.trips) ? saved.trips.filter(isTrip) : [];
    const trips = mergeTrips(validSavedTrips);
    const currentView = isView(saved.currentView) ? saved.currentView : 'planning';
    const lastTripView = isTripView(saved.lastTripView)
      ? saved.lastTripView
      : (isTripView(currentView) ? currentView : 'planning');

    return {
      trips,
      activeTripId: trips.some(trip => trip.id === saved.activeTripId)
        ? saved.activeTripId as string
        : trips[0].id,
      currentView,
      lastTripView,
      language: isLanguage(saved.language) ? saved.language : fallback.language
    };
  } catch {
    return fallback;
  }
};

export const useAppState = () => {
  const [store, setStore] = useState<AppStoreState>(getInitialStore);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const hasMounted = useRef(false);
  const activeTrip = store.trips.find(trip => trip.id === store.activeTripId) ?? store.trips[0];

  const state: AppState = {
    trips: store.trips,
    activeTripId: activeTrip.id,
    tripName: activeTrip.tripName,
    days: activeTrip.days,
    accommodations: activeTrip.accommodations,
    shoppingItems: activeTrip.shoppingItems,
    travelers: activeTrip.travelers,
    currentDay: activeTrip.currentDay,
    currentView: store.currentView,
    lastTripView: store.lastTripView,
    language: store.language
  };

  const updateActiveTrip = useCallback((update: (trip: Trip) => Trip) => {
    setStore(prev => ({
      ...prev,
      trips: prev.trips.map(trip => trip.id === prev.activeTripId ? update(trip) : trip)
    }));
  }, []);

  useEffect(() => {
    let savedTimer: number | undefined;

    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      localStorage.setItem('travelAssistantLang', store.language);

      if (hasMounted.current) {
        setSaveStatus('saving');
        savedTimer = window.setTimeout(() => setSaveStatus('saved'), 450);
      } else {
        hasMounted.current = true;
      }
    } catch {
      setSaveStatus('saveError');
    }

    return () => {
      if (savedTimer) window.clearTimeout(savedTimer);
    };
  }, [store]);

  const switchTrip = useCallback((tripId: string) => {
    setStore(prev => {
      if (!prev.trips.some(trip => trip.id === tripId)) return prev;
      return {
        ...prev,
        activeTripId: tripId,
        currentView: prev.currentView === 'account' ? prev.lastTripView : prev.currentView
      };
    });
  }, []);

  const setCurrentDay = useCallback((day: number) => {
    updateActiveTrip(trip => ({
      ...trip,
      currentDay: Math.max(0, Math.min(day, trip.days.length - 1))
    }));
  }, [updateActiveTrip]);

  const setCurrentView = useCallback((view: ViewType) => {
    setStore(prev => ({
      ...prev,
      currentView: view,
      lastTripView: view === 'account' ? prev.lastTripView : view
    }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setStore(prev => ({ ...prev, language: lang }));
  }, []);

  const addDay = useCallback((title: string) => {
    setStore(prev => ({
      ...prev,
      currentView: 'planning',
      trips: prev.trips.map(trip => {
        if (trip.id !== prev.activeTripId) return trip;
        const newDayIndex = trip.days.length;
        return {
          ...trip,
          days: [...trip.days, { title, activities: [] }],
          currentDay: newDayIndex
        };
      })
    }));
  }, []);

  const moveDay = useCallback((fromIndex: number, toIndex: number) => {
    updateActiveTrip(trip => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= trip.days.length ||
        toIndex >= trip.days.length
      ) {
        return trip;
      }

      const days = [...trip.days];
      const [movedDay] = days.splice(fromIndex, 1);
      days.splice(toIndex, 0, movedDay);

      let currentDay = trip.currentDay;
      if (trip.currentDay === fromIndex) {
        currentDay = toIndex;
      } else if (fromIndex < trip.currentDay && toIndex >= trip.currentDay) {
        currentDay -= 1;
      } else if (fromIndex > trip.currentDay && toIndex <= trip.currentDay) {
        currentDay += 1;
      }

      return { ...trip, days, currentDay };
    });
  }, [updateActiveTrip]);

  const addActivity = useCallback((activity: Activity) => {
    updateActiveTrip(trip => {
      const days = [...trip.days];
      days[trip.currentDay] = {
        ...days[trip.currentDay],
        activities: [...days[trip.currentDay].activities, activity]
          .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      };
      return { ...trip, days };
    });
  }, [updateActiveTrip]);

  const updateActivity = useCallback((index: number, activity: Activity) => {
    updateActiveTrip(trip => {
      const days = [...trip.days];
      const activities = [...days[trip.currentDay].activities];
      activities[index] = activity;
      days[trip.currentDay] = {
        ...days[trip.currentDay],
        activities: activities.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      };
      return { ...trip, days };
    });
  }, [updateActiveTrip]);

  const deleteActivity = useCallback((index: number) => {
    updateActiveTrip(trip => {
      const days = [...trip.days];
      days[trip.currentDay] = {
        ...days[trip.currentDay],
        activities: days[trip.currentDay].activities.filter((_, activityIndex) => activityIndex !== index)
      };
      return { ...trip, days };
    });
  }, [updateActiveTrip]);

  const toggleActivityDone = useCallback((index: number) => {
    updateActiveTrip(trip => {
      const days = [...trip.days];
      const activities = [...days[trip.currentDay].activities];
      activities[index] = { ...activities[index], isDone: !activities[index].isDone };
      days[trip.currentDay] = { ...days[trip.currentDay], activities };
      return { ...trip, days };
    });
  }, [updateActiveTrip]);

  const addAccommodation = useCallback((accommodation: Omit<Accommodation, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      accommodations: [
        ...trip.accommodations,
        { ...accommodation, id: Math.max(0, ...trip.accommodations.map(item => item.id)) + 1 }
      ]
    }));
  }, [updateActiveTrip]);

  const updateAccommodation = useCallback((id: number, accommodation: Omit<Accommodation, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      accommodations: trip.accommodations.map(item => item.id === id ? { ...accommodation, id } : item)
    }));
  }, [updateActiveTrip]);

  const deleteAccommodation = useCallback((id: number) => {
    updateActiveTrip(trip => ({
      ...trip,
      accommodations: trip.accommodations.filter(item => item.id !== id)
    }));
  }, [updateActiveTrip]);

  const getAccommodationsForDay = useCallback((dayIndex: number) => {
    return activeTrip.accommodations.filter(
      accommodation => dayIndex >= accommodation.fromDay && dayIndex <= accommodation.toDay
    );
  }, [activeTrip.accommodations]);

  const addShoppingItem = useCallback((item: Omit<ShoppingItem, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      shoppingItems: [
        ...trip.shoppingItems,
        { ...item, id: Math.max(0, ...trip.shoppingItems.map(current => current.id)) + 1 }
      ]
    }));
  }, [updateActiveTrip]);

  const updateShoppingItem = useCallback((id: number, item: Omit<ShoppingItem, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      shoppingItems: trip.shoppingItems.map(current => current.id === id ? { ...item, id } : current)
    }));
  }, [updateActiveTrip]);

  const deleteShoppingItem = useCallback((id: number) => {
    updateActiveTrip(trip => ({
      ...trip,
      shoppingItems: trip.shoppingItems.filter(item => item.id !== id)
    }));
  }, [updateActiveTrip]);

  const toggleShoppingPurchased = useCallback((id: number) => {
    updateActiveTrip(trip => ({
      ...trip,
      shoppingItems: trip.shoppingItems.map(item =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    }));
  }, [updateActiveTrip]);

  const addTraveler = useCallback((traveler: Omit<Traveler, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      travelers: [
        ...trip.travelers,
        { ...traveler, id: Math.max(0, ...trip.travelers.map(current => current.id)) + 1 }
      ]
    }));
  }, [updateActiveTrip]);

  const updateTraveler = useCallback((id: number, traveler: Omit<Traveler, 'id'>) => {
    updateActiveTrip(trip => ({
      ...trip,
      travelers: trip.travelers.map(current => current.id === id ? { ...traveler, id } : current)
    }));
  }, [updateActiveTrip]);

  const deleteTraveler = useCallback((id: number) => {
    updateActiveTrip(trip => ({
      ...trip,
      travelers: trip.travelers.filter(traveler => traveler.id !== id)
    }));
  }, [updateActiveTrip]);

  return {
    state,
    saveStatus,
    switchTrip,
    setCurrentDay,
    setCurrentView,
    setLanguage,
    addDay,
    moveDay,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleActivityDone,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    getAccommodationsForDay,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingPurchased,
    addTraveler,
    updateTraveler,
    deleteTraveler
  };
};
