import { useLocation, useNavigate } from 'react-router-dom';
import { homeLanguage, homePath, resolvePageLanguage } from '../seo';
import { useCallback, useEffect, useState } from 'react';
import type { Language } from '../types';
import { useAsyncOperation } from './useAsyncOperation';
import { useAuth } from './useAuth';
import { useCollaboration } from './useCollaboration';
import { useTripState } from './useTripState';

export type { SaveStatus } from './useAsyncOperation';

const initialLanguage = (): Language => {
  const stored = localStorage.getItem('travelAssistantLang');
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return resolvePageLanguage(window.location.pathname, window.location.search, stored, browserLanguages);
};

export const useAppState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const operation = useAsyncOperation();
  const trips = useTripState(operation.run);
  const auth = useAuth(trips.loadRemoteTrips, trips.resetTrips, operation.setError);
  const collaboration = useCollaboration(
    auth.isAuthenticated,
    trips.store.publicPreview ? '' : trips.activeTrip.id,
    operation.run,
    trips.loadRemoteTrips,
    operation.setError
  );

  useEffect(() => {
    const locale = homeLanguage(location.pathname);
    if (location.pathname !== '/' && locale && !location.search) setLanguageState(locale);
  }, [location.pathname, location.search]);

  useEffect(() => {
    localStorage.setItem('travelAssistantLang', language);
  }, [language]);

  const resetCollaboration = collaboration.resetCollaboration;
  useEffect(() => {
    if (!auth.isAuthenticated) resetCollaboration();
  }, [auth.isAuthenticated, resetCollaboration]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (homeLanguage(location.pathname) && !location.search && !auth.isAuthenticated) navigate(homePath(nextLanguage));
  }, [location.pathname, location.search, auth.isAuthenticated, navigate]);
  const { activeTrip, store } = trips;
  const state = {
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
    publicPreview: store.publicPreview,
    language,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.authLoading,
    browserSessionSupport: auth.browserSessionSupport,
    user: auth.user,
    error: operation.error
  };

  return {
    state,
    saveStatus: operation.saveStatus,
    retrySave: operation.retry,
    canRetrySave: operation.canRetry,
    members: collaboration.members,
    invitations: collaboration.invitations,
    login: auth.login,
    register: auth.register,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithApple: auth.loginWithApple,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    sendEmailVerification: auth.sendEmailVerification,
    createTrip: trips.createTrip,
    openPublicPreview: trips.openPublicPreview,
    closePublicPreview: trips.closePublicPreview,
    importPublicPreview: trips.importPublicPreview,
    copyPublicTrip: trips.copyPublicTrip,
    deleteTrip: trips.deleteTrip,
    switchTrip: trips.switchTrip,
    setCurrentDay: trips.setCurrentDay,
    setCurrentView: trips.setCurrentView,
    setLanguage,
    addDay: trips.addDay,
    moveDay: trips.moveDay,
    addActivity: trips.addActivity,
    updateActivity: trips.updateActivity,
    deleteActivity: trips.deleteActivity,
    toggleActivityDone: trips.toggleActivityDone,
    addAccommodation: trips.addAccommodation,
    updateAccommodation: trips.updateAccommodation,
    deleteAccommodation: trips.deleteAccommodation,
    getAccommodationsForDay: trips.getAccommodationsForDay,
    addShoppingItem: trips.addShoppingItem,
    updateShoppingItem: trips.updateShoppingItem,
    deleteShoppingItem: trips.deleteShoppingItem,
    toggleShoppingPurchased: trips.toggleShoppingPurchased,
    addTraveler: trips.addTraveler,
    updateTraveler: trips.updateTraveler,
    deleteTraveler: trips.deleteTraveler,
    loadCollaboration: collaboration.loadCollaboration,
    inviteMember: collaboration.inviteMember,
    updateMemberRole: collaboration.updateMemberRole,
    removeMember: collaboration.removeMember,
    acceptInvitation: collaboration.acceptInvitation,
    declineInvitation: collaboration.declineInvitation,
    clearError: operation.clearError
  };
};
