import { useEffect, useState } from 'react';
import { sessionApi } from '../api/sessionApi';
import type { UserSearchResult } from '../api/contracts';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const UserSearch = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  useEffect(() => {
    if (query.trim().length < 2) { setUsers([]); return; }
    const timer = window.setTimeout(() => void sessionApi.searchUsers(query).then(setUsers).catch(() => setUsers([])), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  return <div className="user-search"><h2>{t('searchPeople')}</h2><p className="account-helper">{t('searchPeopleHint')}</p>
    <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchUsersPlaceholder')} aria-label={t('searchPeople')} />
    <div className="user-results">{users.map(user => <div key={user.id} className="user-result"><span className="user-avatar">{user.firstName[0]}{user.lastName[0]}</span><strong>{user.firstName} {user.lastName}</strong></div>)}</div>
  </div>;
};
export default UserSearch;
