import { useEffect, useState } from 'react';
import { travelsApi } from '../api/travelsApi';
import type { PublicTripDto, TripDetailDto } from '../api/contracts';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

interface Props { authenticated?: boolean; onCopy?: (id: string) => Promise<void>; onRegister?: () => void; onOpen?: (id: string) => Promise<void>; }

const PublicTripsExplorer = ({ authenticated = false, onCopy, onRegister, onOpen }: Props) => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [query, setQuery] = useState('');
  const [trips, setTrips] = useState<PublicTripDto[]>([]);
  const [selected, setSelected] = useState<TripDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true); setError(false);
      void travelsApi.listPublicTrips(query).then(setTrips).catch(() => setError(true)).finally(() => setLoading(false));
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  const open = async (id: string) => {
    if (onOpen) { await onOpen(id); return; }
    try { setSelected(await travelsApi.getPublicTrip(id)); } catch { setError(true); }
  };

  return <div className="public-explorer">
    <div className="public-explorer-heading"><div><span>{t('getInspired')}</span><h2>{t('publicTripsTitle')}</h2></div>
      <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchPublicTrips')} aria-label={t('searchPublicTrips')} />
    </div>
    {loading && <p className="catalog-status">{t('publicTripsLoading')}</p>}
    {error && <p className="catalog-status error">{t('publicTripsError')}</p>}
    {!loading && !error && trips.length === 0 && <p className="catalog-status">{t('noPublicTrips')}</p>}
    <div className="public-trip-grid">{trips.map(trip => <button type="button" className="public-trip-card" key={trip.id} onClick={() => void open(trip.id)}>
      <span className="public-trip-cover" style={trip.coverImageUrl ? { backgroundImage: `url(${trip.coverImageUrl})` } : undefined}><b>{trip.dayCount}</b><small>{t('days')}</small></span>
      <span className="public-trip-copy"><strong>{trip.name}</strong><small>{trip.activityCount} {t('activities')} · {trip.currency}</small><span>{trip.description}</span></span>
    </button>)}</div>
    {selected && <div className="public-trip-dialog" role="dialog" aria-modal="true" aria-labelledby="public-trip-title">
      <div className="public-trip-dialog-card"><button className="dialog-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
        <span className="welcome-kicker">{t('publicTrip')}</span><h2 id="public-trip-title">{selected.name}</h2><p>{selected.description}</p>
        <ol>{selected.days.slice(0, 7).map((day, index) => <li key={day.id}><b>{t('day')} {index + 1}</b><span>{day.title}</span></li>)}</ol>
        <button className="welcome-submit" onClick={() => authenticated && onCopy ? void onCopy(selected.id) : onRegister?.()}>{authenticated ? t('createEditableCopy') : t('registerToUse')}</button>
      </div>
    </div>}
  </div>;
};

export default PublicTripsExplorer;
