import { FormEvent, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { TripRole } from '../types';
import ConfirmDialog from './ConfirmDialog';
import '../styles/account.css';
import PublicTripsExplorer from './PublicTripsExplorer';
import UserSearch from './UserSearch';

const AccountView = () => {
  const {
    state, members, invitations, logout, createTrip, openPublicPreview, deleteTrip,
    switchTrip, setCurrentView, loadCollaboration, inviteMember, updateMemberRole,
    removeMember, acceptInvitation, declineInvitation
  } = useApp();
  const { t } = useTranslation(state.language);
  const [tripForm, setTripForm] = useState({ name: '', description: '', currency: 'EUR' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'editor' as Exclude<TripRole, 'owner'> });
  const [pendingDeleteTrip, setPendingDeleteTrip] = useState<string | null>(null);
  const activeTrip = state.trips.find(trip => trip.id === state.activeTripId);

  useEffect(() => {
    if (state.isAuthenticated) void loadCollaboration();
  }, [loadCollaboration, state.isAuthenticated, state.activeTripId]);

  const handleCreateTrip = async (event: FormEvent) => {
    event.preventDefault();
    if (!tripForm.name.trim()) return;
    try { await createTrip(tripForm.name.trim(), tripForm.description.trim() || undefined, tripForm.currency); setTripForm({ name: '', description: '', currency: 'EUR' }); }
    catch { /* displayed from state.error */ }
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    try { await inviteMember(inviteForm.email, inviteForm.role); setInviteForm(prev => ({ ...prev, email: '' })); }
    catch { /* displayed from state.error */ }
  };

  return (
    <div className="left-panel account-view">
      <div className="account-content">
        <section className="account-section auth-section">
          <div className="signed-user">
            <div className="user-avatar">{state.user?.firstName?.[0]}{state.user?.lastName?.[0]}</div>
            <div><span className="section-kicker">{t('connectedAccount')}</span><h2>{state.user?.firstName} {state.user?.lastName}</h2><p>{state.user?.email}</p></div>
            <button className="secondary-button" onClick={() => void logout()}>{t('logout')}</button>
          </div>
        </section>

        {state.isAuthenticated && (
          <section className="account-section">
            <div className="account-section-heading"><div><span className="section-kicker">{t('newTrip')}</span><h2>{t('startPlanning')}</h2></div></div>
            <form className="account-form" onSubmit={handleCreateTrip}>
              <label>{t('tripNameLabel')}<input required maxLength={200} value={tripForm.name} onChange={e => setTripForm({ ...tripForm, name: e.target.value })} placeholder={t('tripNamePlaceholder')} /></label>
              <label>{t('description')}<textarea rows={2} value={tripForm.description} onChange={e => setTripForm({ ...tripForm, description: e.target.value })} /></label>
              <label>{t('currency')}<select value={tripForm.currency} onChange={e => setTripForm({ ...tripForm, currency: e.target.value })}><option>EUR</option><option>USD</option><option>GBP</option><option>CHF</option><option>JPY</option><option>CNY</option><option>CAD</option><option>AUD</option></select></label>
              <button>{t('createTrip')}</button>
            </form>
          </section>
        )}

        <section className="account-section">
          <div className="account-section-heading"><div><span className="section-kicker">{state.isAuthenticated ? t('synced') : t('demoMode')}</span><h2>{t('myTrips')}</h2></div></div>
          {state.trips.length === 0 && <p className="account-helper">{t('noTripsYet')}</p>}
          {state.trips.map(trip => (
            <div key={trip.id} className={`trip-card ${trip.id === state.activeTripId ? 'current' : ''}`}>
              <div className="trip-info"><h3>{trip.tripName}</h3><p>{trip.days.length} {t('days')} · {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} {t('activitiesCount')}</p>{trip.currentUserRole && <span className="role-badge">{trip.currentUserRole}</span>}</div>
              <div className="trip-actions">
                <button onClick={() => { switchTrip(trip.id); setCurrentView('planning'); }}>{t('open')}</button>
                {trip.capabilities?.canDelete && <button className="danger-button" onClick={() => setPendingDeleteTrip(trip.id)}>{t('delete')}</button>}
              </div>
            </div>
          ))}
        </section>

        {state.trips.length === 0 && <section className="account-section discovery-section"><PublicTripsExplorer authenticated onOpen={openPublicPreview} /><UserSearch /></section>}

        {state.isAuthenticated && invitations.length > 0 && (
          <section className="account-section"><h2>{t('pendingInvitations')}</h2>{invitations.map(invitation => (
            <div className="collaboration-row" key={invitation.id}><div><strong>{t('tripInvitation')}</strong><span>{invitation.role}</span></div><div><button onClick={() => void acceptInvitation(invitation.id).catch(() => undefined)}>{t('accept')}</button><button className="secondary-button" onClick={() => void declineInvitation(invitation.id).catch(() => undefined)}>{t('decline')}</button></div></div>
          ))}</section>
        )}

        {state.isAuthenticated && activeTrip?.capabilities?.canManageMembers && (
          <section className="account-section"><h2>{t('tripMembers')}</h2>
            <form className="invite-form" onSubmit={handleInvite}><input type="email" required placeholder={t('inviteEmailPlaceholder')} value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} /><select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as Exclude<TripRole, 'owner'> })}><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button>{t('invite')}</button></form>
            <div className="members-list">{members.map(member => <div className="collaboration-row" key={member.userId}><code>{member.userId === state.user?.userId ? t('you') : member.userId}</code><div>{member.role !== 'owner' ? <><select value={member.role} onChange={e => void updateMemberRole(member.userId, e.target.value as Exclude<TripRole, 'owner'>).catch(() => undefined)}><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button className="danger-button" onClick={() => void removeMember(member.userId).catch(() => undefined)}>{t('remove')}</button></> : <span className="role-badge">Owner</span>}</div></div>)}</div>
          </section>
        )}

      </div>
      <ConfirmDialog open={pendingDeleteTrip !== null} message={t('confirmDeleteTrip')} confirmLabel={t('delete')} cancelLabel={t('cancel')} onCancel={() => setPendingDeleteTrip(null)} onConfirm={async () => {
        if (!pendingDeleteTrip) return;
        try { await deleteTrip(pendingDeleteTrip); setPendingDeleteTrip(null); }
        catch { /* Global error notification remains visible. */ }
      }} />
    </div>
  );
};

export default AccountView;
