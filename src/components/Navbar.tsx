import { homeLanguage, homePath } from '../seo';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';
import { printItinerary } from '../utils';
import ThemePicker from './ThemePicker';
import UserMenu from './UserMenu';

type IconName = 'print' | 'language' | 'trips';

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
    trips: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
  const { state, saveStatus, retrySave, canRetrySave, switchTrip, setCurrentView, setLanguage, closePublicPreview, importPublicPreview } = useApp();
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
  const isGlobalView = state.currentView === 'account' || state.currentView === 'settings';
  const hasTripContext = state.isAuthenticated || state.publicPreview;

  return (
    <nav className={`navbar ${isGlobalView ? 'navbar-global-view' : ''} ${!state.isAuthenticated ? 'navbar-auth' : ''}`} aria-label={t('appTitle')}>
      <div className="navbar-primary">
        <a className="navbar-left navbar-home-link" href="/">
          <img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" className="navbar-logo brand-mark" />
          <span className="navbar-title">{t('appTitle')}</span>
        </a>

        {state.isAuthenticated && !state.publicPreview && <div className="navbar-trip-controls">
          {state.trips.length > 0 && <div className="trip-switcher" ref={tripDropdownRef}>
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
                    if (isGlobalView) setCurrentView(state.lastTripView);
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
          </div>}
          <button type="button"
            className={`workspace-home-btn ${state.currentView === 'account' ? 'active' : ''}`}
            aria-current={state.currentView === 'account' ? 'page' : undefined}
            onClick={() => { setShowTripMenu(false); setShowLanguageMenu(false); setCurrentView('account'); }}>
            <InterfaceIcon name="trips" /><span>{t('accountCenter')}</span>
          </button>
        </div>}

        {state.publicPreview && <div className="public-preview-title"><span>{t('publicTrip')}</span><strong>{state.tripName}</strong></div>}

        <div className="navbar-right">
          {state.isAuthenticated && saveStatus !== 'idle' && <button type="button" className={`save-status ${saveStatus}`} role="status" aria-live="polite"
            disabled={!canRetrySave || saveStatus === 'saving'} onClick={() => void retrySave().catch(() => undefined)}>
            <span className="save-status-symbol" aria-hidden="true">
              {saveStatus === 'saving' ? '' : '!'}
            </span>
            <span className="save-status-label">{saveStatus === 'saveError' && canRetrySave ? t('retrySync') : t(saveStatus)}</span>
          </button>}
          {hasTripContext && !isGlobalView && (
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
                  tripName: state.tripName,
                  language: state.language,
                  currency: state.trips.find(trip => trip.id === state.activeTripId)?.currency
                })
              }
            >
              <InterfaceIcon name="print" />
            </button>
          )}
          {state.publicPreview && <>
            <button type="button" className="preview-back-btn" onClick={closePublicPreview}>{t('backToExplore')}</button>
            {state.isAuthenticated
              ? <button type="button" className="preview-copy-btn" onClick={() => void importPublicPreview().catch(() => undefined)}>{t('importToMyTrips')}</button>
              : <button type="button" className="preview-copy-btn" onClick={() => { sessionStorage.setItem('tabiji-log.authMode', 'register'); closePublicPreview(); }}>{t('useThisTrip')}</button>}
          </>}

          <ThemePicker />
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
                  !state.isAuthenticated && homeLanguage(window.location.pathname) && !window.location.search
                    ? <a key={lang.code} href={homePath(lang.code)} hrefLang={lang.code}
                        className={`dropdown-item ${state.language === lang.code ? 'active' : ''}`}
                        onClick={event => { event.preventDefault(); setLanguage(lang.code); setShowLanguageMenu(false); }}>{lang.name}</a>
                    : <button key={lang.code} className={`dropdown-item ${state.language === lang.code ? 'active' : ''}`}
                        onClick={() => { setLanguage(lang.code); setShowLanguageMenu(false); }}>{lang.name}</button>
                ))}
              </div>
            )}
          </div>
          <UserMenu />
        </div>
      </div>

      {hasTripContext && !isGlobalView && <div className="trip-context-nav">
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
          {(state.publicPreview || state.trips.find(trip => trip.id === state.activeTripId)?.isPublic) && <button
            className={`nav-btn ratings-nav ${state.currentView === 'ratings' ? 'active' : ''}`}
            onClick={() => setCurrentView('ratings')}
            aria-current={state.currentView === 'ratings' ? 'page' : undefined}
          >
            {t('opinions')}
          </button>}
        </div>
      </div>}
    </nav>
  );
};

export default Navbar;
