import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getActivityTypeIcon, isValidCoordinates, createGoogleMapsUrl } from '../utils';
import ActivityModal from './modals/ActivityModal';
import AccommodationModal from './modals/AccommodationModal';
import DayModal from './modals/DayModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DragHandleIcon = () => (
  <svg className="drag-handle-icon" viewBox="0 0 16 20" aria-hidden="true">
    <circle cx="5" cy="4" r="1.4" />
    <circle cx="11" cy="4" r="1.4" />
    <circle cx="5" cy="10" r="1.4" />
    <circle cx="11" cy="10" r="1.4" />
    <circle cx="5" cy="16" r="1.4" />
    <circle cx="11" cy="16" r="1.4" />
  </svg>
);

const PlanningView = () => {
  const {
    state,
    setCurrentDay,
    addDay,
    moveDay,
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
  const [showDayModal, setShowDayModal] = useState(false);
  const [showDayActions, setShowDayActions] = useState(false);
  const [accommodationDrawerOpen, setAccommodationDrawerOpen] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [showDayList, setShowDayList] = useState(false);
  const [focusNewDayList, setFocusNewDayList] = useState(false);
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [focusReorderedDay, setFocusReorderedDay] = useState<number | null>(null);
  const activityListRef = useRef<HTMLUListElement>(null);
  const dayActionsRef = useRef<HTMLDivElement>(null);
  const pointerDayRef = useRef<number | null>(null);

  const handleActivityClick = (index: number) => {
    setExpandedActivity(expandedActivity === index ? null : index);
  };

  const currentDay = state.days[state.currentDay];
  const accommodations = getAccommodationsForDay(state.currentDay);

  useEffect(() => {
    if (!focusNewDayList) return;

    const focusFrame = requestAnimationFrame(() => {
      if (activityListRef.current) {
        activityListRef.current.scrollTop = 0;
        activityListRef.current.focus({ preventScroll: true });
      }
      setFocusNewDayList(false);
    });

    return () => cancelAnimationFrame(focusFrame);
  }, [focusNewDayList, state.currentDay, state.days.length]);

  useEffect(() => {
    if (!showDayActions) return;

    const closeActions = (event: MouseEvent) => {
      if (dayActionsRef.current && !dayActionsRef.current.contains(event.target as Node)) {
        setShowDayActions(false);
      }
    };
    const closeActionsWithEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setShowDayActions(false);
    };

    document.addEventListener('mousedown', closeActions);
    document.addEventListener('keydown', closeActionsWithEscape);
    return () => {
      document.removeEventListener('mousedown', closeActions);
      document.removeEventListener('keydown', closeActionsWithEscape);
    };
  }, [showDayActions]);

  useEffect(() => {
    if (focusReorderedDay === null) return;
    const focusFrame = requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(`[data-day-index="${focusReorderedDay}"] .day-drag-handle`)
        ?.focus();
      setFocusReorderedDay(null);
    });
    return () => cancelAnimationFrame(focusFrame);
  }, [focusReorderedDay, state.days]);

  // Initialize map
  useEffect(() => {
    const mapContainer = mapRef.current;

    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([35.6762, 139.6503], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    let resizeFrame: number | null = null;
    const refreshMapSize = () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(() => mapInstanceRef.current?.invalidateSize());
    };

    const resizeObserver = mapContainer && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(refreshMapSize)
      : null;

    if (mapContainer) {
      resizeObserver?.observe(mapContainer);
      window.addEventListener('resize', refreshMapSize);
      refreshMapSize();
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', refreshMapSize);
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
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

  const handleAddDay = (description: string) => {
    addDay(description);
    setShowDayList(false);
    setShowDayModal(false);
    setFocusNewDayList(true);
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

  const openDayAction = (action: 'day' | 'activity' | 'accommodation') => {
    setShowDayActions(false);
    setShowDayList(false);

    if (action === 'day') setShowDayModal(true);
    if (action === 'activity') setShowActivityModal(true);
    if (action === 'accommodation') setShowAccommodationModal(true);
  };

  const resetDayDrag = () => {
    setDraggedDay(null);
    setDragOverDay(null);
    pointerDayRef.current = null;
  };

  const handleDayDragStart = (event: DragEvent<HTMLButtonElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDraggedDay(index);
    setDragOverDay(index);
  };

  const handleDayDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(sourceIndex)) moveDay(sourceIndex, targetIndex);
    resetDayDrag();
  };

  const handleDayPointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (event.pointerType === 'mouse') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerDayRef.current = index;
    setDraggedDay(index);
    setDragOverDay(index);
  };

  const handleDayPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerDayRef.current === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-day-index]');
    if (!target) return;
    const targetIndex = Number(target.dataset.dayIndex);
    if (!Number.isInteger(targetIndex)) return;

    const sourceIndex = pointerDayRef.current;
    if (targetIndex === sourceIndex) return;

    moveDay(sourceIndex, targetIndex);
    pointerDayRef.current = targetIndex;
    setDraggedDay(targetIndex);
    setDragOverDay(null);
  };

  const handleDayPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerDayRef.current === null) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetDayDrag();
  };

  const handleDayHandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const targetIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < state.days.length) {
      moveDay(index, targetIndex);
      setFocusReorderedDay(targetIndex);
    }
  };

  return (
    <>
      <aside className="left-panel">
        <header className="day-header">
          <div className="day-navigation">
            <button
              className="day-nav-btn"
              onClick={() => setCurrentDay(state.currentDay - 1)}
              disabled={state.currentDay === 0}
              title={t('prevDay')}
              aria-label={t('prevDay')}
            >
              ←
            </button>
            <div className="day-title-group">
              <span className="day-kicker">{t('day')} {state.currentDay + 1}</span>
              <h2>{currentDay?.title}</h2>
            </div>
            <button
              className="day-nav-btn"
              onClick={() => setCurrentDay(state.currentDay + 1)}
              disabled={state.currentDay >= state.days.length - 1}
              title={t('nextDay')}
              aria-label={t('nextDay')}
            >
              →
            </button>
          </div>

          <div className="day-toolbar">
            <div className="day-action-buttons">
              <button
                className={`day-tool-btn list-days-btn ${showDayList ? 'active' : ''}`}
                onClick={() => {
                  setShowDayActions(false);
                  setShowDayList(prev => !prev);
                }}
                aria-pressed={showDayList}
              >
                <span className="button-symbol list-symbol" aria-hidden="true">≡</span>
                {t('listDays')}
              </button>
              <div className="desktop-day-actions">
                <button
                  className="day-tool-btn add-activity-btn"
                  onClick={() => setShowActivityModal(true)}
                  disabled={showDayList}
                >
                  <span className="button-symbol" aria-hidden="true">+</span>
                  {t('addActivity')}
                </button>
                <button
                  className="day-tool-btn add-accommodation-btn"
                  onClick={() => setShowAccommodationModal(true)}
                  disabled={showDayList}
                >
                  <span className="button-symbol" aria-hidden="true">+</span>
                  {t('addAccommodation')}
                </button>
                <button
                  className="day-tool-btn add-day-btn"
                  onClick={() => setShowDayModal(true)}
                >
                  <span className="button-symbol" aria-hidden="true">+</span>
                  {t('addDayFull')}
                </button>
              </div>
              <div className="mobile-day-actions" ref={dayActionsRef}>
                <button
                  className={`day-tool-btn actions-menu-btn ${showDayActions ? 'active' : ''}`}
                  onClick={() => setShowDayActions(prev => !prev)}
                  aria-expanded={showDayActions}
                  aria-haspopup="menu"
                  aria-controls="day-actions-menu"
                >
                  <span className="button-symbol" aria-hidden="true">+</span>
                  {t('dayActions')}
                </button>
                {showDayActions && (
                  <div id="day-actions-menu" className="day-actions-menu" role="menu">
                    <span className="day-actions-menu-title">{t('chooseDayAction')}</span>
                    <button type="button" role="menuitem" onClick={() => openDayAction('activity')}>
                      <span aria-hidden="true">＋</span>{t('addActivity')}
                    </button>
                    <button type="button" role="menuitem" onClick={() => openDayAction('accommodation')}>
                      <span aria-hidden="true">⌂</span>{t('addAccommodation')}
                    </button>
                    <button type="button" role="menuitem" onClick={() => openDayAction('day')}>
                      <span aria-hidden="true">□</span>{t('addDayFull')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {showDayList ? (
          <div className="day-list-panel">
            <div className="day-list-guide">
              <strong>{t('yourDays')}</strong>
              <span><DragHandleIcon />{t('dragDaysHint')}</span>
            </div>
            <ul className="day-list">
              {state.days.map((day, index) => (
                <li
                  key={index}
                  data-day-index={index}
                  className={`day-list-item ${index === state.currentDay ? 'active' : ''} ${draggedDay === index ? 'dragging' : ''} ${dragOverDay === index && draggedDay !== index ? 'drag-over' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDragOverDay(index);
                  }}
                  onDrop={(event) => handleDayDrop(event, index)}
                >
                  <button
                    type="button"
                    className="day-list-select"
                    onClick={() => {
                      setCurrentDay(index);
                      setShowDayList(false);
                    }}
                  >
                    <span className="day-list-index">{t('day')} {index + 1}</span>
                    <span className="day-list-title">{day.title}</span>
                  </button>
                  <button
                    type="button"
                    className="day-drag-handle"
                    draggable
                    onClick={(event) => event.stopPropagation()}
                    onDragStart={(event) => handleDayDragStart(event, index)}
                    onDragEnd={resetDayDrag}
                    onPointerDown={(event) => handleDayPointerDown(event, index)}
                    onPointerMove={handleDayPointerMove}
                    onPointerUp={handleDayPointerUp}
                    onPointerCancel={resetDayDrag}
                    onKeyDown={(event) => handleDayHandleKeyDown(event, index)}
                    aria-label={`${t('reorderDay')}: ${day.title}`}
                    title={t('reorderDay')}
                  >
                    <DragHandleIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <ul
          className="activity-list"
          ref={activityListRef}
          tabIndex={-1}
          aria-label={`${t('activities')}: ${currentDay?.title || ''}`}
        >
          {currentDay?.activities.length === 0 && (
            <li className="empty-day-state">
              <span className="empty-day-mark" aria-hidden="true">+</span>
              <strong>{t('emptyDayTitle')}</strong>
              <p>{t('emptyDayHint')}</p>
              <button type="button" onClick={() => setShowActivityModal(true)}>
                {t('addActivity')}
              </button>
            </li>
          )}
          {currentDay?.activities
            .filter(a => !a.isOptional)
            .map((activity, index) => (
              <li
                key={index}
                className={`activity-item ${activity.isDone ? 'done' : ''} ${expandedActivity === index ? 'expanded' : ''}`}
                onClick={() => handleActivityClick(index)}
              >
                <div className="activity-content">
                  <button
                    className={`activity-checkbox ${activity.isDone ? 'checked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActivityDone(index);
                    }}
                    aria-label={activity.isDone ? 'Mark as not done' : 'Mark as done'}
                  >
                    {activity.isDone && <span className="checkmark">✓</span>}
                  </button>
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
                      className={`activity-item optional ${activity.isDone ? 'done' : ''} ${expandedActivity === realIndex ? 'expanded' : ''}`}
                      onClick={() => handleActivityClick(realIndex)}
                    >
                      <div className="activity-content">
                        <button
                          className={`activity-checkbox ${activity.isDone ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActivityDone(realIndex);
                          }}
                          aria-label={activity.isDone ? 'Mark as not done' : 'Mark as done'}
                        >
                          {activity.isDone && <span className="checkmark">✓</span>}
                        </button>
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
        )}

        {/* Accommodation section - Desktop */}
        {!showDayList && (
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
        )}

        {/* Accommodation drawer - Mobile */}
        {!showDayList && (
        <div className={`accommodation-drawer ${accommodationDrawerOpen ? 'open' : ''}`}>
          <button
            className="accommodation-drawer-toggle"
            onClick={() => setAccommodationDrawerOpen(!accommodationDrawerOpen)}
          >
            <span className="drawer-toggle-text">{t('whereWeSleepShort')}</span>
            <span className={`drawer-toggle-arrow ${accommodationDrawerOpen ? 'open' : ''}`}>
              ▲
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
        )}
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

      {showDayModal && (
        <DayModal
          onCreate={handleAddDay}
          onClose={() => setShowDayModal(false)}
        />
      )}
    </>
  );
};

export default PlanningView;
