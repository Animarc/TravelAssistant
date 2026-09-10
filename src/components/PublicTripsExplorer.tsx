import { useEffect, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { PublicTripDto, TripDetailDto } from '../api/contracts';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getErrorKey } from '../hooks/useAsyncOperation';
import type { TranslationKey } from '../i18n/translations';

interface Props { authenticated?: boolean; onCopy?: (id: string) => Promise<void>; onRegister?: () => void; onOpen?: (id: string) => Promise<void>; }

const PublicTripsExplorer = ({ authenticated = false, onCopy, onRegister, onOpen }: Props) => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [query, setQuery] = useState('');
  const [trips, setTrips] = useState<PublicTripDto[]>([]);
  const [selected, setSelected] = useState<TripDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [opening, setOpening] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true); setError(null);
      void travelsApi.listPublicTrips(query, state.language)
        .then(result => { if (active) setTrips(result); })
        .catch(reason => { if (active) setError(getErrorKey(reason)); })
        .finally(() => { if (active) setLoading(false); });
    }, query ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, state.language, attempt]);

  const open = async (id: string) => {
    if (opening) return;
    setOpening(id); setError(null);
    try { if (onOpen) await onOpen(id); else setSelected(await travelsApi.getPublicTrip(id)); }
    catch (reason) { setError(getErrorKey(reason)); }
    finally { setOpening(null); }
  };

  return <div className="public-explorer">
    <div className="public-explorer-heading"><div><span>{t('getInspired')}</span><h2>{t('publicTripsTitle')}</h2></div>
      <input type="search" value={query} onChange={e => { setQuery(e.target.value); setLoading(true); }} placeholder={t('searchPublicTrips')} aria-label={t('searchPublicTrips')} />
    </div>
    {loading && <p className="catalog-status" role="status"><span className="loading-spinner" aria-hidden="true" />{t('publicTripsLoading')}</p>}
    {error && <div className="catalog-status error" role="alert"><p>{t(error)}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>{t('retry')}</button></div>}
    {!loading && !error && trips.length === 0 && <div className="catalog-status empty-state" role="status"><p>{t('noPublicTrips')}</p>{query && <button type="button" onClick={() => { setQuery(''); setLoading(true); }}>{t('clearSearch')}</button>}</div>}
    <div className="public-trip-grid" aria-busy={loading || opening !== null}>{!loading && trips.map(trip => <button type="button" className="public-trip-card" key={trip.id} disabled={opening !== null} onClick={() => void open(trip.id)}>
      <span className="public-trip-cover" style={trip.coverImageUrl ? { backgroundImage: `url(${trip.coverImageUrl})` } : undefined}><b>{trip.dayCount}</b><small>{t('days')}</small></span>
      <span className="public-trip-copy"><strong>{trip.name}</strong>{opening === trip.id && <span role="status">{t('loading')}</span>}{trip.authorUsername && <small>{trip.authorUsername}</small>}<small>{trip.activityCount} {t('activities')} · {trip.currency}</small><span>{trip.description}</span></span>
    </button>)}</div>
    {selected && <div className="public-trip-dialog" role="dialog" aria-modal="true" aria-labelledby="public-trip-title">
      <div className="public-trip-dialog-card"><button className="dialog-close" disabled={copying} onClick={() => setSelected(null)} aria-label={t('close')}>×</button>
        <span className="welcome-kicker">{t('publicTrip')}</span><h2 id="public-trip-title">{selected.name}</h2><p>{selected.description}</p>
        <ol>{selected.days.slice(0, 7).map((day, index) => <li key={day.id}><b>{t('day')} {index + 1}</b><span>{day.title}</span></li>)}</ol>
        {error && <p role="alert">{t(error)}</p>}
        <button className="welcome-submit" disabled={copying} onClick={async () => {
          if (!authenticated || !onCopy) { onRegister?.(); return; }
          setCopying(true); setError(null);
          try { await onCopy(selected.id); setSelected(null); }
          catch (reason) { setError(getErrorKey(reason)); }
          finally { setCopying(false); }
        }}>{copying ? t('loading') : authenticated ? t('createEditableCopy') : t('registerToUse')}</button>
      </div>
    </div>}
  </div>;
};

export default PublicTripsExplorer;
