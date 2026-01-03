import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getActivityTypeIcon, isValidCoordinates, createGoogleMapsUrl } from '../utils';
import ActivityModal from './modals/ActivityModal';
import AccommodationModal from './modals/AccommodationModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PlanningView = () => {
  const {
    state,
    setCurrentDay,
    addDay,
    moveDayBack,
    moveDayForward,
    deleteActivity,
    toggleActivityDone,
    getAccommodationsForDay
  } = useApp();
  const { t } = useTranslation(state.language);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accommodationDrawerOpen, setAccommodationDrawerOpen] = useState(false);

  const currentDay = state.days[state.currentDay];
  const accommodations = getAccommodationsForDay(state.currentDay);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([35.6762, 139.6503], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when day changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const bounds: L.LatLngTuple[] = [];

    // Add activity markers
    currentDay?.activities.forEach((activity, index) => {
      if (isValidCoordinates(activity.coordinates)) {
        const coords = activity.coordinates as [number, number];
        bounds.push(coords);

        const icon = L.divIcon({
          className: 'activity-marker',
          html: `<div class="activity-marker-inner">${index + 1}</div>`,
          iconSize: [30, 30]
        });

        L.marker(coords, { icon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`<b>${activity.name}</b><br>${activity.description || ''}`);
      }
    });

    // Add accommodation marker
    accommodations.forEach(acc => {
      if (isValidCoordinates(acc.coordinates)) {
        const coords = acc.coordinates as [number, number];
        bounds.push(coords);

        const icon = L.divIcon({
          className: 'accommodation-marker',
          html: '<div class="accommodation-marker-inner"></div>',
          iconSize: [36, 36]
        });

        L.marker(coords, { icon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`<b>🏠 ${acc.name}</b>`);
      }
    });

    // Fit bounds if we have markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [state.currentDay, currentDay, accommodations]);

  const handleAddDay = () => {
    const title = prompt(t('enterDayTitle'));
    if (title && title.trim()) {
      addDay(title.trim());
    }
  };

  const handleDeleteActivity = (index: number) => {
    if (confirm(t('confirmDeleteActivity'))) {
      deleteActivity(index);
    }
  };

  const handleOpenMaps = (coords: [number, number]) => {
    const url = createGoogleMapsUrl(null, coords);
    window.open(url, '_blank');
  };

  return (
    <>
      <aside className="left-panel">
        <header className="day-header">
          <div className="day-nav-group">
            <button
              className="day-nav-btn"
              onClick={() => setCurrentDay(state.currentDay - 1)}
              disabled={state.currentDay === 0}
              title={t('prevDay')}
            >
              ←
            </button>
            <button
              className="day-action-btn"
              onClick={moveDayBack}
              disabled={state.currentDay === 0}
              title={t('moveDayBack')}
            >
              {t('moveDayBack')}
            </button>
          </div>
          <div className="day-title-group">
            <h2>{t('day')} {state.currentDay + 1}: {currentDay?.title}</h2>
            <div className="day-action-buttons">
              <button className="add-activity-btn" onClick={() => setShowActivityModal(true)}>
                {t('addActivity')}
              </button>
              <button className="add-accommodation-btn" onClick={() => setShowAccommodationModal(true)}>
                {t('addAccommodation')}
              </button>
              <button className="add-day-btn" onClick={handleAddDay}>
                {t('addDayFull')}
              </button>
            </div>
          </div>
          <div className="day-nav-group">
            <button
              className="day-action-btn"
              onClick={moveDayForward}
              disabled={state.currentDay >= state.days.length - 1}
              title={t('moveDayForward')}
            >
              {t('moveDayForward')}
            </button>
            <button
              className="day-nav-btn"
              onClick={() => setCurrentDay(state.currentDay + 1)}
              disabled={state.currentDay >= state.days.length - 1}
              title={t('nextDay')}
            >
              →
            </button>
          </div>
        </header>

        <ul className="activity-list">
          {currentDay?.activities
            .filter(a => !a.isOptional)
            .map((activity, index) => (
              <li
                key={index}
                className={`activity-item ${activity.isDone ? 'done' : ''}`}
                onClick={() => toggleActivityDone(index)}
              >
                <div className="activity-content">
                  <span className="activity-time">{activity.time || t('noTime')}</span>
                  <span className="activity-type-badge">
                    {getActivityTypeIcon(activity.type)}
                  </span>
                  <div className="activity-details">
                    <strong className="activity-name">{activity.name}</strong>
                    <p className="activity-description">{activity.description}</p>
                    {activity.importantInfo && (
                      <p className="activity-important">⚠️ {activity.importantInfo}</p>
                    )}
                    {activity.price && (
                      <span className="activity-price">
                        {activity.price} {activity.currency || 'EUR'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="activity-actions">
                  {isValidCoordinates(activity.coordinates) && (
                    <button
                      className="activity-maps-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMaps(activity.coordinates as [number, number]);
                      }}
                    >
                      🗺️
                    </button>
                  )}
                  <button
                    className="activity-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingActivity(index);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="activity-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity(index);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}

          {/* Optional activities section */}
          {currentDay?.activities.some(a => a.isOptional) && (
            <>
              <li className="optional-activities-header">
                <h3>{t('optionalActivities')}</h3>
              </li>
              {currentDay.activities
                .filter(a => a.isOptional)
                .map((activity, index) => {
                  const realIndex = currentDay.activities.findIndex(
                    a => a === activity
                  );
                  return (
                    <li
                      key={`optional-${index}`}
                      className={`activity-item optional ${activity.isDone ? 'done' : ''}`}
                      onClick={() => toggleActivityDone(realIndex)}
                    >
                      <div className="activity-content">
                        <span className="activity-time">{activity.time || t('noTime')}</span>
                        <span className="activity-type-badge">
                          {getActivityTypeIcon(activity.type)}
                        </span>
                        <div className="activity-details">
                          <strong className="activity-name">
                            {activity.name} <span className="optional-badge">{t('optionalBadge')}</span>
                          </strong>
                          <p className="activity-description">{activity.description}</p>
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button
                          className="activity-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActivity(realIndex);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  );
                })}
            </>
          )}
        </ul>

        {/* Accommodation section - Desktop */}
        <div className="accommodation-container accommodation-desktop">
          <div className="accommodation-section">
            <div className="accommodation-header">
              <h3>{t('whereWeSleep')}</h3>
            </div>
            <div className="accommodation-content">
              {accommodations.length === 0 ? (
                <p className="no-accommodation">{t('noAccommodation')}</p>
              ) : (
                accommodations.map(acc => (
                  <div key={acc.id} className="accommodation-item">
                    <div className="accommodation-info">
                      <strong className="accommodation-name">{acc.name}</strong>
                      {acc.link && (
                        <a
                          href={acc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="accommodation-link"
                        >
                          {t('seeReservation')}
                        </a>
                      )}
                      {isValidCoordinates(acc.coordinates) && (
                        <button
                          className="accommodation-gmaps-btn"
                          onClick={() => handleOpenMaps(acc.coordinates as [number, number])}
                        >
                          {t('goWithMaps')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Accommodation drawer - Mobile */}
        <div className={`accommodation-drawer ${accommodationDrawerOpen ? 'open' : ''}`}>
          <button
            className="accommodation-drawer-toggle"
            onClick={() => setAccommodationDrawerOpen(!accommodationDrawerOpen)}
          >
            <span className="drawer-toggle-text">{t('whereWeSleepShort')}</span>
            <span className={`drawer-toggle-arrow ${accommodationDrawerOpen ? 'open' : ''}`}>
              {accommodationDrawerOpen ? '▼' : '▲'}
            </span>
          </button>
          <div className="accommodation-drawer-content">
            {accommodations.length === 0 ? (
              <p className="no-accommodation">{t('noAccommodation')}</p>
            ) : (
              accommodations.map(acc => (
                <div key={acc.id} className="accommodation-item">
                  <div className="accommodation-info">
                    <strong className="accommodation-name">{acc.name}</strong>
                    {acc.link && (
                      <a
                        href={acc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="accommodation-link"
                      >
                        {t('seeReservation')}
                      </a>
                    )}
                    {isValidCoordinates(acc.coordinates) && (
                      <button
                        className="accommodation-gmaps-btn"
                        onClick={() => handleOpenMaps(acc.coordinates as [number, number])}
                      >
                        {t('goWithMaps')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="right-panel">
        <div id="map" ref={mapRef}></div>
      </section>

      {editingActivity !== null && (
        <ActivityModal
          editIndex={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {showActivityModal && (
        <ActivityModal onClose={() => setShowActivityModal(false)} />
      )}

      {showAccommodationModal && (
        <AccommodationModal onClose={() => setShowAccommodationModal(false)} />
      )}
    </>
  );
};

export default PlanningView;
