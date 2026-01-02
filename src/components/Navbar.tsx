import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';

const Navbar = () => {
  const { state, setCurrentView, setLanguage } = useApp();
  const { t } = useTranslation(state.language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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
        <img src="/favicon.svg" alt="Logo" className="navbar-logo" />
        <span className="navbar-title">{t('appTitle')}</span>
      </div>
      <div className="navbar-center">
        <span className="trip-name">{state.tripName}</span>
        <span className="navbar-separator"></span>
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
      </div>
      <div className="navbar-right">
        <div className="language-dropdown">
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
