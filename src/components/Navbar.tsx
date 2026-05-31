import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';
import { printItinerary } from '../utils';

const Navbar = () => {
  const { state, setCurrentView, setLanguage } = useApp();
  const { t } = useTranslation(state.language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

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
    <nav className="navbar">
      <div className="navbar-left">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">{t('appTitle')}</span>
      </div>
      <div className="navbar-center">
        <span className="trip-name">{state.tripName}</span>
        <span className="navbar-separator"></span>
        <div className="nav-buttons-scroll">
          <button
            className={`nav-btn ${state.currentView === 'planning' ? 'active' : ''}`}
            onClick={() => setCurrentView('planning')}
          >
            {t('planning')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'budget' ? 'active' : ''}`}
            onClick={() => setCurrentView('budget')}
          >
            {t('budget')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'objects' ? 'active' : ''}`}
            onClick={() => setCurrentView('objects')}
          >
            {t('objects')}
          </button>
          <button
            className={`nav-btn ${state.currentView === 'travelers' ? 'active' : ''}`}
            onClick={() => setCurrentView('travelers')}
          >
            {t('travelers')}
          </button>
        </div>
      </div>
      <div className="navbar-right">
        <button
          className="nav-icon-btn"
          title={t('printItinerary')}
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
          🖨️
        </button>
        <div className="language-dropdown" ref={dropdownRef}>
          <button
            className="nav-icon-btn"
            title={t('language')}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            🌐
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
          className="nav-icon-btn"
          title={t('options')}
          onClick={() => setCurrentView('account')}
        >
          ⚙️
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
