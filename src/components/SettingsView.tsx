import { useRef, useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { sessionApi } from '../api/sessionApi';
import { getErrorKey } from '../hooks/useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';
import UserAvatar from './UserAvatar';
import '../styles/account.css';
import '../styles/settings.css';
export default function SettingsView() {
  const { state, updateProfile } = useApp();
  const { t } = useTranslation(state.language);
  const [form, setForm] = useState({ firstName: state.user?.firstName ?? '', lastName: state.user?.lastName ?? '' });
  const [saving, setSaving] = useState(false), [sending, setSending] = useState(false), [saved, setSaved] = useState(false), [sent, setSent] = useState(false);
  const [profileError, setProfileError] = useState<TranslationKey | null>(null), [resetError, setResetError] = useState<TranslationKey | null>(null);
  const saveLock = useRef(false), resetLock = useRef(false);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (saveLock.current) return;
    saveLock.current = true; setSaving(true); setSaved(false); setProfileError(null);
    try { await updateProfile(form.firstName.trim(), form.lastName.trim()); setSaved(true); }
    catch (reason) { setProfileError(getErrorKey(reason)); }
    finally { saveLock.current = false; setSaving(false); }
  };
  const reset = async () => {
    if (resetLock.current || sent || !state.user?.email) return;
    resetLock.current = true; setSending(true); setResetError(null);
    try { await sessionApi.requestPasswordReset(state.user.email); setSent(true); }
    catch (reason) { setResetError(getErrorKey(reason)); }
    finally { resetLock.current = false; setSending(false); }
  };
  return <div className="settings-view">
    <header className="settings-heading"><UserAvatar url={state.user?.avatarUrl} username={state.user?.username} /><div><h1>{t('settings')}</h1><p>{t('accountSettingsIntro')}</p></div></header>
    <section className="settings-section" aria-labelledby="settings-profile"><h2 id="settings-profile">{t('accountProfile')}</h2>
      <dl className="settings-identity"><div><dt>{t('username')}</dt><dd>@{state.user?.username}</dd></div><div><dt>{t('email')}</dt><dd>{state.user?.email}</dd></div></dl>
      <form className="account-form" onSubmit={event => void save(event)}><p className="account-helper">{t('optionalProfileHint')}</p>
        <label>{t('firstName')}<input disabled={saving} maxLength={100} autoComplete="given-name" value={form.firstName} onChange={event => { setSaved(false); setForm({ ...form, firstName: event.target.value }); }} /></label>
        <label>{t('lastName')}<input disabled={saving} maxLength={100} autoComplete="family-name" value={form.lastName} onChange={event => { setSaved(false); setForm({ ...form, lastName: event.target.value }); }} /></label>
        <button disabled={saving}>{saving ? t('saving') : t('saveProfile')}</button>
      </form>{saved && <p role="status">{t('profileSaved')}</p>}{profileError && <p role="alert" className="form-error">{t(profileError)}</p>}
    </section>
    <section className="settings-section" aria-labelledby="settings-security"><h2 id="settings-security">{t('accountSecurity')}</h2><h3>{t('password')}</h3><p>{t('accountPasswordHelp')}</p>
      <button type="button" className="settings-reset-button" disabled={sending || sent} onClick={() => void reset()}>{sending ? t('sending') : t('sendResetLink')}</button>
      {sent && <p role="status">{t('accountResetSent')}</p>}{resetError && <p role="alert" className="form-error">{t(resetError)}</p>}
    </section>
  </div>;
}
