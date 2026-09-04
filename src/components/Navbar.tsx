import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';
import { printItinerary } from '../utils';

type IconName = 'print' | 'language' | 'settings';

const InterfaceIcon = ({ name }: { name: IconName }) => {
  const paths: Record<IconName, React.ReactNode> = {
    print: (
      <>
        <path d="M7 9V4.75h10V9" />
        <path d="M7 17H5.75A2.75 2.75 0 0 1 3 14.25v-3.5A2.75 2.75 0 0 1 5.75 8h12.5A2.75 2.75 0 0 1 21 10.75v3.5A2.75 2.75 0 0 1 18.25 17H17" />
        <path d="M7 14h10v6H7z" />
        <path d="M17.5 11.5h.01" />
      </>
    ),
    language: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17" />
        <path d="M12 3c2.15 2.45 3.25 5.45 3.25 9S14.15 18.55 12 21c-2.15-2.45-3.25-5.45-3.25-9S9.85 5.45 12 3Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.12 2.12-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20.25h-3v-.13a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2.12-2.12.06-.06A1.65 1.65 0 0 0 7.2 15a1.65 1.65 0 0 0-1.51-1H5.56v-3h.13a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06L8.93 6l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51v-.13h3v.13a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.12 2.12-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.51 1h.13v3h-.13a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    )
  };

  return (
    <svg className="interface-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const Navbar = () => {
  const { state, saveStatus, switchTrip, setCurrentView, setLanguage } = useApp();
  const { t } = useTranslation(state.language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showTripMenu, setShowTripMenu] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const tripDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (tripDropdownRef.current && !tripDropdownRef.current.contains(event.target as Node)) {
        setShowTripMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLanguageMenu(false);
        setShowTripMenu(false);
      }
    };

    if (showLanguageMenu || showTripMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showLanguageMenu, showTripMenu]);

  const languages: { code: Language; name: string }[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' }
  ];

  return (
    <nav className={`navbar ${state.currentView === 'account' ? 'navbar-global-view' : ''}`} aria-label={t('appTitle')}>
      <div className="navbar-primary">
        <div className="navbar-left">
          <img src={`${import.meta.env.BASE_URL}kakomu-mark.svg`} alt="" className="navbar-logo" />
          <span className="navbar-title">{t('appTitle')}</span>
        </div>

        <div className="trip-switcher" ref={tripDropdownRef}>
          <button
            type="button"
            className={`trip-switcher-trigger ${showTripMenu ? 'open' : ''}`}
            onClick={() => {
              setShowLanguageMenu(false);
              setShowTripMenu(prev => !prev);
            }}
            aria-expanded={showTripMenu}
            aria-haspopup="listbox"
            aria-label={t('switchTrip')}
          >
            <span className="trip-switcher-copy">
              <span className="trip-switcher-eyebrow">{t('currentTrip')}</span>
              <strong className="trip-name">{state.tripName}</strong>
            </span>
            <svg className="trip-switcher-chevron" viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </button>

          {showTripMenu && (
            <div className="trip-dropdown-menu" role="listbox" aria-label={t('myTrips')}>
              <span className="trip-dropdown-title">{t('myTrips')}</span>
              {state.trips.map(trip => (
                <button
                  type="button"
                  key={trip.id}
                  className={`trip-option ${trip.id === state.activeTripId ? 'active' : ''}`}
                  onClick={() => {
                    switchTrip(trip.id);
                    setShowTripMenu(false);
                  }}
                  role="option"
                  aria-selected={trip.id === state.activeTripId}
                >
                  <span className="trip-option-copy">
                    <strong>{trip.tripName}</strong>
                    <small>{trip.days.length} {t('days')} · {trip.travelers.length} {t('travelersPlural')}</small>
                  </span>
                  <span className="trip-option-check" aria-hidden="true">
                    {trip.id === state.activeTripId ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-page-title">
          <button
            type="button"
            className="global-back-btn"
            onClick={() => setCurrentView(state.lastTripView)}
            aria-label={t('backToTrip')}
          >
            ←
          </button>
          <strong>{t('options')}</strong>
        </div>

        <div className="navbar-right">
          <span className={`save-status ${saveStatus}`} role="status" aria-live="polite">
            <span className="save-status-symbol" aria-hidden="true">
              {saveStatus === 'saving' ? '' : saveStatus === 'saved' ? '✓' : '!'}
            </span>
            <span className="save-status-label">{t(saveStatus)}</span>
          </span>
          {state.currentView !== 'account' && (
            <button
              className="nav-icon-btn"
              title={t('printItinerary')}
              aria-label={t('printItinerary')}
              onClick={() =>
                printItinerary(state.days, state.accommodations, {
                  title: t('printItinerary'),
                  day: t('day'),
                  activities: t('activities'),
                  optionalActivities: t('optionalActivities'),
                  accommodation: t('whereWeSleep'),
                  noAccommodation: t('noAccommodation'),
                  importantInfo: t('importantInfo'),
                  noTime: t('noTime'),
                  tripName: state.tripName
                })
              }
            >
              <InterfaceIcon name="print" />
            </button>
          )}
          <div className="language-dropdown" ref={languageDropdownRef}>
            <button
              className="nav-icon-btn"
              title={t('language')}
              aria-label={t('language')}
              onClick={() => {
                setShowTripMenu(false);
                setShowLanguageMenu(prev => !prev);
              }}
            >
              <InterfaceIcon name="language" />
            </button>
            {showLanguageMenu && (
              <div className="dropdown-menu">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`dropdown-item ${state.language === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={`nav-icon-btn ${state.currentView === 'account' ? 'active' : ''}`}
            title={t('options')}
            aria-label={t('options')}
            aria-current={state.currentView === 'account' ? 'page' : undefined}
            onClick={() => {
              setShowTripMenu(false);
              setCurrentView('account');
            }}
          >
            <InterfaceIcon name="settings" />
          </button>
        </div>
      </div>

      {state.currentView !== 'account' && <div className="trip-context-nav">
        <div className="nav-buttons-scroll" aria-label={t('tripNavigation')}>
          <button
            className={`nav-btn ${state.currentView === 'planning' ? 'active' : ''}`}
            onClick={() => setCurrentView('planning')}
            aria-current={state.currentView === 'planning' ? 'page' : undefined}
          >
            {t('planning')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'budget' ? 'active' : ''}`}
            onClick={() => setCurrentView('budget')}
            aria-current={state.currentView === 'budget' ? 'page' : undefined}
          >
            {t('budget')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'objects' ? 'active' : ''}`}
            onClick={() => setCurrentView('objects')}
            aria-current={state.currentView === 'objects' ? 'page' : undefined}
          >
            {t('objects')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'travelers' ? 'active' : ''}`}
            onClick={() => setCurrentView('travelers')}
            aria-current={state.currentView === 'travelers' ? 'page' : undefined}
          >
            {t('travelers')}
          </button>
        </div>
      </div>}
    </nav>
  );
};

export default Navbar;
