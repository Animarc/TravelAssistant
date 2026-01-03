import { useState, useCallback, useEffect } from 'react';
import { AppState, Activity, Accommodation, ShoppingItem, Traveler, ViewType, Language } from '../types';
import { initialData, initialAccommodations, initialShoppingItems, tripName as initialTripName } from '../data';

const getInitialState = (): AppState => {
  const savedLang = localStorage.getItem('travelAssistantLang') as Language | null;

  return {
    tripName: initialTripName,
    days: initialData,
    accommodations: initialAccommodations,
    shoppingItems: initialShoppingItems,
    travelers: [],
    currentDay: 0,
    currentView: 'planning',
    language: savedLang || 'es'
  };
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(getInitialState);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('travelAssistantLang', state.language);
  }, [state.language]);

  // Navigation
  const setCurrentDay = useCallback((day: number) => {
    setState(prev => ({
      ...prev,
      currentDay: Math.max(0, Math.min(day, prev.days.length - 1))
    }));
  }, []);

  const setCurrentView = useCallback((view: ViewType) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  // Day management
  const addDay = useCallback((title: string) => {
    setState(prev => ({
      ...prev,
      days: [...prev.days, { title, activities: [] }]
    }));
  }, []);

  const moveDayBack = useCallback(() => {
    setState(prev => {
      if (prev.currentDay === 0) return prev;
      const newDays = [...prev.days];
      [newDays[prev.currentDay - 1], newDays[prev.currentDay]] =
        [newDays[prev.currentDay], newDays[prev.currentDay - 1]];
      return { ...prev, days: newDays, currentDay: prev.currentDay - 1 };
    });
  }, []);

  const moveDayForward = useCallback(() => {
    setState(prev => {
      if (prev.currentDay >= prev.days.length - 1) return prev;
      const newDays = [...prev.days];
      [newDays[prev.currentDay], newDays[prev.currentDay + 1]] =
        [newDays[prev.currentDay + 1], newDays[prev.currentDay]];
      return { ...prev, days: newDays, currentDay: prev.currentDay + 1 };
    });
  }, []);

  // Activity management
  const addActivity = useCallback((activity: Activity) => {
    setState(prev => {
      const newDays = [...prev.days];
      newDays[prev.currentDay] = {
        ...newDays[prev.currentDay],
        activities: [...newDays[prev.currentDay].activities, activity]
          .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      };
      return { ...prev, days: newDays };
    });
  }, []);

  const updateActivity = useCallback((index: number, activity: Activity) => {
    setState(prev => {
      const newDays = [...prev.days];
      const activities = [...newDays[prev.currentDay].activities];
      activities[index] = activity;
      newDays[prev.currentDay] = {
        ...newDays[prev.currentDay],
        activities: activities.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      };
      return { ...prev, days: newDays };
    });
  }, []);

  const deleteActivity = useCallback((index: number) => {
    setState(prev => {
      const newDays = [...prev.days];
      newDays[prev.currentDay] = {
        ...newDays[prev.currentDay],
        activities: newDays[prev.currentDay].activities.filter((_, i) => i !== index)
      };
      return { ...prev, days: newDays };
    });
  }, []);

  const toggleActivityDone = useCallback((index: number) => {
    setState(prev => {
      const newDays = [...prev.days];
      const activities = [...newDays[prev.currentDay].activities];
      activities[index] = { ...activities[index], isDone: !activities[index].isDone };
      newDays[prev.currentDay] = { ...newDays[prev.currentDay], activities };
      return { ...prev, days: newDays };
    });
  }, []);

  // Accommodation management
  const addAccommodation = useCallback((acc: Omit<Accommodation, 'id'>) => {
    setState(prev => ({
      ...prev,
      accommodations: [
        ...prev.accommodations,
        { ...acc, id: Math.max(0, ...prev.accommodations.map(a => a.id)) + 1 }
      ]
    }));
  }, []);

  const updateAccommodation = useCallback((id: number, acc: Omit<Accommodation, 'id'>) => {
    setState(prev => ({
      ...prev,
      accommodations: prev.accommodations.map(a => a.id === id ? { ...acc, id } : a)
    }));
  }, []);

  const deleteAccommodation = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter(a => a.id !== id)
    }));
  }, []);

  const getAccommodationsForDay = useCallback((dayIndex: number) => {
    return state.accommodations.filter(
      acc => dayIndex >= acc.fromDay && dayIndex <= acc.toDay
    );
  }, [state.accommodations]);

  // Shopping management
  const addShoppingItem = useCallback((item: Omit<ShoppingItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      shoppingItems: [
        ...prev.shoppingItems,
        { ...item, id: Math.max(0, ...prev.shoppingItems.map(i => i.id)) + 1 }
      ]
    }));
  }, []);

  const updateShoppingItem = useCallback((id: number, item: Omit<ShoppingItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      shoppingItems: prev.shoppingItems.map(i => i.id === id ? { ...item, id } : i)
    }));
  }, []);

  const deleteShoppingItem = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      shoppingItems: prev.shoppingItems.filter(i => i.id !== id)
    }));
  }, []);

  const toggleShoppingPurchased = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      shoppingItems: prev.shoppingItems.map(i =>
        i.id === id ? { ...i, purchased: !i.purchased } : i
      )
    }));
  }, []);

  // Traveler management
  const addTraveler = useCallback((traveler: Omit<Traveler, 'id'>) => {
    setState(prev => ({
      ...prev,
      travelers: [
        ...prev.travelers,
        { ...traveler, id: Math.max(0, ...prev.travelers.map(t => t.id)) + 1 }
      ]
    }));
  }, []);

  const updateTraveler = useCallback((id: number, traveler: Omit<Traveler, 'id'>) => {
    setState(prev => ({
      ...prev,
      travelers: prev.travelers.map(t => t.id === id ? { ...traveler, id } : t)
    }));
  }, []);

  const deleteTraveler = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      travelers: prev.travelers.filter(t => t.id !== id)
    }));
  }, []);

  return {
    state,
    setCurrentDay,
    setCurrentView,
    setLanguage,
    addDay,
    moveDayBack,
    moveDayForward,
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
