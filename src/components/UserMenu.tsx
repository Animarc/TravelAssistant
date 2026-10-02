import { useEffect, useId, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import UserAvatar from './UserAvatar';
import '../styles/settings.css';
export default function UserMenu() {
  const { state, setCurrentView, closePublicPreview, logout } = useApp();
  const { t } = useTranslation(state.language);
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const container = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    items.current[0]?.focus();
    const outside = (event: MouseEvent | FocusEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('mousedown', outside); document.addEventListener('focusin', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('focusin', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  if (!state.isAuthenticated) return null;
  return <div className="profile-menu" ref={container}>
    <button ref={trigger} type="button" className={`profile-menu-trigger ${state.currentView === 'settings' ? 'active' : ''}`} aria-label={t('accountMenu')} title={state.user?.username} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? menuId : undefined} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}>
      <UserAvatar url={state.user?.avatarUrl} username={state.user?.username} />
    </button>
    {open && <div id={menuId} role="menu" className="profile-menu-popover" aria-label={t('accountMenu')} onKeyDown={event => {
      const index = items.current.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'ArrowDown' ? (index + 1) % 2 : event.key === 'ArrowUp' ? (index + 1) % 2 : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null;
      if (next !== null) { event.preventDefault(); items.current[next]?.focus(); }
    }}>
      <button ref={node => { items.current[0] = node; }} type="button" role="menuitem" onClick={() => { setOpen(false); if (state.publicPreview) closePublicPreview(); setCurrentView('settings'); trigger.current?.focus(); }}>{t('settings')}</button>
      <button ref={node => { items.current[1] = node; }} type="button" role="menuitem" disabled={busy} onClick={() => { if (busy) return; setBusy(true); void logout().finally(() => { setBusy(false); setOpen(false); }); }}>{t('logout')}</button>
    </div>}
  </div>;
}
