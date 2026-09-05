import { useCallback, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { TripInvitation, TripMember, TripRole } from '../types';
import { getErrorMessage } from './useAsyncOperation';

type RemoteRunner = (operation: () => Promise<void>) => Promise<void>;

export const useCollaboration = (
  isAuthenticated: boolean,
  tripId: string,
  run: RemoteRunner,
  loadTrips: () => Promise<void>,
  setError: (message: string | null) => void
) => {
  const [members, setMembers] = useState<TripMember[]>([]);
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);

  const loadCollaboration = useCallback(async () => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const [pending, currentMembers] = await Promise.all([
        travelsApi.getInvitations(),
        tripId ? travelsApi.getMembers(tripId) : Promise.resolve([])
      ]);
      setInvitations(pending);
      setMembers(currentMembers);
    } catch (reason) {
      setError(getErrorMessage(reason));
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

  const resetCollaboration = useCallback(() => { setMembers([]); setInvitations([]); }, []);

  return { members, invitations, loadCollaboration, inviteMember, updateMemberRole, removeMember, acceptInvitation, declineInvitation, resetCollaboration };
};
