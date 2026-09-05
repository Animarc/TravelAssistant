import { useCallback, useEffect, useState } from 'react';
import type { Language } from '../types';
import { resolveLanguage } from '../i18n/language';
import { useAsyncOperation } from './useAsyncOperation';
import { useAuth } from './useAuth';
import { useCollaboration } from './useCollaboration';
import { useTripState } from './useTripState';

export type { SaveStatus } from './useAsyncOperation';

const initialLanguage = (): Language => {
  const stored = localStorage.getItem('travelAssistantLang');
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return resolveLanguage(stored, browserLanguages);
};

export const useAppState = () => {
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
    localStorage.setItem('travelAssistantLang', language);
  }, [language]);

  const resetCollaboration = collaboration.resetCollaboration;
  useEffect(() => {
    if (!auth.isAuthenticated) resetCollaboration();
  }, [auth.isAuthenticated, resetCollaboration]);

  const setLanguage = useCallback((nextLanguage: Language) => setLanguageState(nextLanguage), []);
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
    verificationState: auth.verificationState,
    pendingVerificationEmail: auth.pendingVerificationEmail,
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
    resendVerification: auth.resendVerification,
    dismissVerification: auth.dismissVerification,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithApple: auth.loginWithApple,
    logout: auth.logout,
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
