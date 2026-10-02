import { useCallback, useRef, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { TripInvitation, TripMember, TripRole } from '../types';
import { getErrorKey } from './useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';

type RemoteRunner = (operation: () => Promise<void>) => Promise<void>;

export const useCollaboration = (
  isAuthenticated: boolean,
  tripId: string,
  run: RemoteRunner,
  loadTrips: () => Promise<void>,
  setError: (message: TranslationKey | null) => void
) => {
  const [memberState, setMemberState] = useState<{ tripId: string; members: TripMember[] }>({ tripId: '', members: [] });
  const requestId = useRef(0);
  const members = memberState.tripId === tripId ? memberState.members : [];
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);

  const loadCollaboration = useCallback(async () => {
    if (!isAuthenticated) return;
    const request = ++requestId.current;
    setError(null);
    try {
      const [pending, currentMembers] = await Promise.all([
        travelsApi.getInvitations(),
        tripId ? travelsApi.getMembers(tripId) : Promise.resolve([])
      ]);
      if (request !== requestId.current) return;
      setInvitations(pending);
      setMemberState({ tripId, members: currentMembers });
    } catch (reason) {
      if (request === requestId.current) setError(getErrorKey(reason));
    }
  }, [isAuthenticated, setError, tripId]);

  const inviteMember = useCallback((email: string, role: Exclude<TripRole, 'owner'>) =>
    run(async () => { await travelsApi.invite(tripId, email, role); await loadCollaboration(); }),
  [loadCollaboration, run, tripId]);

  const updateMemberRole = useCallback((userId: string, role: Exclude<TripRole, 'owner'>) =>
    run(async () => { await travelsApi.updateMember(tripId, userId, role); await loadCollaboration(); }),
  [loadCollaboration, run, tripId]);

  const removeMember = useCallback((userId: string) =>
    run(async () => { await travelsApi.removeMember(tripId, userId); await loadCollaboration(); }),
  [loadCollaboration, run, tripId]);

  const acceptInvitation = useCallback((id: string) => run(async () => {
    await travelsApi.acceptInvitation(id);
    await Promise.all([loadTrips(), loadCollaboration()]);
  }), [loadCollaboration, loadTrips, run]);

  const declineInvitation = useCallback((id: string) => run(async () => {
    await travelsApi.declineInvitation(id);
    await loadCollaboration();
  }), [loadCollaboration, run]);

  const resetCollaboration = useCallback(() => { requestId.current++; setMemberState({ tripId: '', members: [] }); setInvitations([]); }, []);

  return { members, invitations, loadCollaboration, inviteMember, updateMemberRole, removeMember, acceptInvitation, declineInvitation, resetCollaboration };
};
