import { FormEvent, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '../i18n/translations';
import type { TripRole } from '../types';
import ConfirmDialog from './ConfirmDialog';
import '../styles/account.css';
import PublicTripsExplorer from './PublicTripsExplorer';
import UserSearch from './UserSearch';
import UserRating from './UserRating';

const AccountView = () => {
  const {
    state, saveStatus, members, invitations, logout, updateProfile, createTrip, openPublicPreview, deleteTrip,
    switchTrip, setCurrentView, loadCollaboration, inviteMember, updateMemberRole,
    removeMember, acceptInvitation, declineInvitation
  } = useApp();
  const { t } = useTranslation(state.language);
  const [activeSection, setActiveSection] = useState<'trips' | 'explore' | 'create' | 'profile' | 'invitations'>('trips');
  const accountSections: { id: typeof activeSection; label: TranslationKey; icon: string }[] = [
    { id: 'trips', label: 'myTrips', icon: '▦' },
    { id: 'explore', label: 'accountExplore', icon: '◎' },
    ...(state.isAuthenticated ? [
      { id: 'create' as const, label: 'newTrip' as const, icon: '+' },
      { id: 'invitations' as const, label: 'accountInvitations' as const, icon: '↗' },
      { id: 'profile' as const, label: 'accountProfile' as const, icon: '○' }
    ] : [])
  ];
  const [tripQuery, setTripQuery] = useState('');
  const [accessTripId, setAccessTripId] = useState<string | null>(null);
  const [tripForm, setTripForm] = useState({ name: '', description: '', currency: 'EUR' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'editor' as Exclude<TripRole, 'owner'> });
  const [pendingDeleteTrip, setPendingDeleteTrip] = useState<string | null>(null);
  const [pendingRemoveMember, setPendingRemoveMember] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ firstName: state.user?.firstName ?? '', lastName: state.user?.lastName ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [ratingMember, setRatingMember] = useState<string | null>(null);
  const activeTrip = state.trips.find(trip => trip.id === state.activeTripId);

  useEffect(() => {
    if (state.isAuthenticated) void loadCollaboration();
  }, [loadCollaboration, state.isAuthenticated, state.activeTripId]);

  useEffect(() => {
    setProfileForm({ firstName: state.user?.firstName ?? '', lastName: state.user?.lastName ?? '' });
  }, [state.user?.firstName, state.user?.lastName]);

  const handleCreateTrip = async (event: FormEvent) => {
    event.preventDefault();
    if (!tripForm.name.trim() || saveStatus === 'saving') return;
    try { await createTrip(tripForm.name.trim(), tripForm.description.trim() || undefined, tripForm.currency); setTripForm({ name: '', description: '', currency: 'EUR' }); }
    catch { /* displayed from state.error */ }
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (saveStatus === 'saving') return;
    try { await inviteMember(inviteForm.email, inviteForm.role); setInviteForm(prev => ({ ...prev, email: '' })); }
    catch { /* displayed from state.error */ }
  };

  const handleProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (profileSaving) return;
    setProfileSaving(true);
    try { await updateProfile(profileForm.firstName, profileForm.lastName); }
    catch { /* displayed from state.error */ }
    finally { setProfileSaving(false); }
  };

  return (
    <div className="account-view">
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-sidebar-user">
            <div className="user-avatar">{state.user?.username[0]?.toUpperCase() ?? 'T'}</div>
            <div><strong>{state.user?.username ?? t('demoMode')}</strong><span>{state.user?.email}</span></div>
          </div>
          <nav className="account-navigation" aria-label={t('connectedAccount')}>
            {accountSections.map(section => <button key={section.id} type="button" className={`account-nav-item ${activeSection === section.id ? 'active' : ''}`} aria-current={activeSection === section.id ? 'page' : undefined} aria-controls="account-detail" onClick={() => setActiveSection(section.id)}>
              <span className="account-nav-icon" aria-hidden="true">{section.icon}</span><span>{t(section.label)}</span>
              {section.id === 'trips' && <span className="account-nav-count">{state.trips.length}</span>}
              {section.id === 'invitations' && invitations.length > 0 && <span className="account-nav-count">{invitations.length}</span>}
            </button>)}
          </nav>
          {state.isAuthenticated && <button className="account-sidebar-logout secondary-button" onClick={() => void logout()}>{t('logout')}</button>}
        </aside>
        <div className="account-content" id="account-detail">
        {activeSection === 'profile' && <section className="account-section auth-section">
          <div className="signed-user">
            <div className="user-avatar">{state.user?.username[0]?.toUpperCase()}</div>
            <div><span className="section-kicker">{t('connectedAccount')}</span><h2>{t('accountProfile')}</h2><p>{state.user?.email}</p></div>

          </div>
          <form className="account-form" onSubmit={handleProfile}>
            <p className="account-helper">{t('optionalProfileHint')}</p>
            <label>{t('firstName')}<input maxLength={100} autoComplete="given-name" value={profileForm.firstName} onChange={event => setProfileForm({ ...profileForm, firstName: event.target.value })} /></label>
            <label>{t('lastName')}<input maxLength={100} autoComplete="family-name" value={profileForm.lastName} onChange={event => setProfileForm({ ...profileForm, lastName: event.target.value })} /></label>
            <button disabled={profileSaving}>{profileSaving ? t('saving') : t('saveProfile')}</button>
          </form>
        </section>}

        {state.isAuthenticated && activeSection === 'create' && (
          <section className="account-section">
            <div className="account-section-heading"><div><span className="section-kicker">{t('newTrip')}</span><h2>{t('startPlanning')}</h2></div></div>
            <form className="account-form" onSubmit={handleCreateTrip}>
              <label>{t('tripNameLabel')}<input required maxLength={200} value={tripForm.name} onChange={e => setTripForm({ ...tripForm, name: e.target.value })} placeholder={t('tripNamePlaceholder')} /></label>
              <label>{t('description')}<textarea rows={2} value={tripForm.description} onChange={e => setTripForm({ ...tripForm, description: e.target.value })} /></label>
              <label>{t('currency')}<select value={tripForm.currency} onChange={e => setTripForm({ ...tripForm, currency: e.target.value })}><option>EUR</option><option>USD</option><option>GBP</option><option>CHF</option><option>JPY</option><option>CNY</option><option>CAD</option><option>AUD</option></select></label>
              <button disabled={saveStatus === 'saving'}>{saveStatus === 'saving' ? t('saving') : t('createTrip')}</button>
            </form>
          </section>
        )}

        {activeSection === 'trips' && <section className="account-section saved-trips-section">
          <div className="account-section-heading"><div><span className="section-kicker">{state.isAuthenticated ? t('synced') : t('demoMode')}</span><h2>{t('myTrips')}</h2></div><input className="saved-trip-search" type="search" value={tripQuery} onChange={event => setTripQuery(event.target.value)} placeholder={t('searchTrips')} aria-label={t('searchTrips')} /></div>
          {state.trips.length === 0 && <p className="account-helper">{t('noTripsYet')}</p>}
          <div className="saved-trip-grid">
          {state.trips.filter(trip => `${trip.tripName} ${trip.description ?? ''}`.toLocaleLowerCase().includes(tripQuery.trim().toLocaleLowerCase())).map(trip => (
            <article key={trip.id} className={`trip-card ${trip.id === state.activeTripId ? 'current' : ''}`}>
              <div className="trip-info"><h3>{trip.tripName}</h3><p>{trip.days.length} {t('days')} · {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} {t('activitiesCount')}</p>{trip.description && <p className="saved-trip-description">{trip.description.split('\n')[0]}</p>}{trip.currentUserRole && <span className="role-badge">{t(trip.currentUserRole === 'owner' ? 'roleOwner' : trip.currentUserRole === 'editor' ? 'roleEditor' : 'roleViewer')}</span>}</div>
              <div className="trip-actions">
                <button onClick={() => { switchTrip(trip.id); setCurrentView('planning'); }}>{t('open')}</button>
                {state.isAuthenticated && !state.publicPreview && <button className="secondary-button" aria-expanded={accessTripId === trip.id} onClick={() => { setInviteForm({ email: '', role: 'editor' }); setRatingMember(null); setPendingRemoveMember(null); if (accessTripId === trip.id) setAccessTripId(null); else { switchTrip(trip.id); setCurrentView('account'); setAccessTripId(trip.id); } }}>{t('tripMembers')}</button>}
                {trip.capabilities?.canDelete && <button className="danger-button" onClick={() => setPendingDeleteTrip(trip.id)}>{t('delete')}</button>}
              </div>
        {state.isAuthenticated && activeTrip && trip.id === state.activeTripId && accessTripId === trip.id && !state.publicPreview && (
          <section className="trip-access-panel" aria-label={`${t('tripMembers')}: ${trip.tripName}`}><h4>{t('tripMembers')}</h4>
            {activeTrip.capabilities?.canManageMembers && <form className="invite-form" onSubmit={handleInvite}><input type="email" required placeholder={t('inviteEmailPlaceholder')} value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} /><select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as Exclude<TripRole, 'owner'> })}><option value="editor">{t('roleEditor')}</option><option value="viewer">{t('roleViewer')}</option></select><button disabled={saveStatus === 'saving'}>{saveStatus === 'saving' ? t('saving') : t('invite')}</button></form>}
            <div className="members-list">{members.map(member => <div className="member-rating-card" key={member.userId}><div className="collaboration-row"><div className="member-identity"><strong>@{member.username || t('traveler')}</strong><span className="member-score">★ {member.ratingCount ? member.averageRating.toFixed(1) : '—'} · {member.ratingCount}</span></div><div>{member.userId !== state.user?.userId && <button className="secondary-button" onClick={() => setRatingMember(ratingMember === member.userId ? null : member.userId)}>{t('rateTraveler')}</button>}{activeTrip.capabilities?.canManageMembers && member.role !== 'owner' ? <><select value={member.role} onChange={e => void updateMemberRole(member.userId, e.target.value as Exclude<TripRole, 'owner'>).catch(() => undefined)}><option value="editor">{t('roleEditor')}</option><option value="viewer">{t('roleViewer')}</option></select><button className="danger-button" onClick={() => setPendingRemoveMember(member.userId)}>{t('remove')}</button></> : <span className="role-badge">{member.userId === state.user?.userId ? t('you') : t(member.role === 'owner' ? 'roleOwner' : member.role === 'editor' ? 'roleEditor' : 'roleViewer')}</span>}</div></div>{ratingMember === member.userId && <UserRating tripId={activeTrip.id} userId={member.userId} language={state.language} initialAverage={member.averageRating} initialCount={member.ratingCount} />}</div>)}</div>
          </section>
        )}
            </article>
          ))}
          </div>
        </section>}

        {activeSection === 'explore' && <section className="account-section discovery-section"><PublicTripsExplorer authenticated={state.isAuthenticated} onOpen={openPublicPreview} /><UserSearch /></section>}

        {state.isAuthenticated && activeSection === 'invitations' && (
          <section className="account-section"><h2>{t('pendingInvitations')}</h2>{invitations.length === 0 && <p className="account-helper">{t('accountNoInvitations')}</p>}{invitations.map(invitation => (
            <div className="collaboration-row" key={invitation.id}><div><strong>{t('tripInvitation')}</strong><span>{t(invitation.role === 'editor' ? 'roleEditor' : 'roleViewer')}</span></div><div><button onClick={() => void acceptInvitation(invitation.id).catch(() => undefined)}>{t('accept')}</button><button className="secondary-button" onClick={() => void declineInvitation(invitation.id).catch(() => undefined)}>{t('decline')}</button></div></div>
          ))}</section>
        )}
        </div>
      </div>
      <ConfirmDialog open={pendingRemoveMember !== null} message={t('confirmRemoveMember')} confirmLabel={t('remove')} cancelLabel={t('cancel')} onCancel={() => setPendingRemoveMember(null)} onConfirm={async () => {
        if (!pendingRemoveMember) return;
        try { await removeMember(pendingRemoveMember); setPendingRemoveMember(null); }
        catch { /* The shared error notice explains the failure. */ }
      }} />
      <ConfirmDialog open={pendingDeleteTrip !== null} message={t('confirmDeleteTrip')} confirmLabel={t('delete')} cancelLabel={t('cancel')} onCancel={() => setPendingDeleteTrip(null)} onConfirm={async () => {
        if (!pendingDeleteTrip) return;
        try { await deleteTrip(pendingDeleteTrip); setPendingDeleteTrip(null); }
        catch { /* Global error notification remains visible. */ }
      }} />
    </div>
  );
};

export default AccountView;
