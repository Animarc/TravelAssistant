import { useEffect, useState } from 'react';
import { sessionApi } from '../api/sessionApi';
import type { UserSearchResult } from '../api/contracts';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';

const UserSearch = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (query.trim().length < 2) { setUsers([]); setLoading(false); setError(null); return; }
    setLoading(true); setError(null); setUsers([]);
    const timer = window.setTimeout(() => {
      void sessionApi.searchUsers(query.trim())
        .then(result => { if (active) setUsers(result); })
        .catch(reason => { if (active) setError(getErrorKey(reason)); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, attempt]);
  return <div className="user-search"><h2>{t('searchPeople')}</h2><p className="account-helper">{t('searchPeopleHint')}</p>
    <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchUsersPlaceholder')} aria-label={t('searchPeople')} />
    {loading && <p role="status">{t('loading')}</p>}
    {error && <div role="alert"><p>{t(error)}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>{t('retry')}</button></div>}
    {!loading && !error && query.trim().length >= 2 && users.length === 0 && <p className="empty-state" role="status">{t('noPeopleResults')}</p>}
    <div className="user-results" aria-busy={loading}>{users.map(user => <div key={user.id} className="user-result"><span className="user-avatar">{user.username[0]?.toUpperCase()}</span><strong>{user.username}</strong></div>)}</div>
  </div>;
};
export default UserSearch;
