import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import Footer from './components/Footer';
import { useTranslation } from './hooks/useTranslation';
import './styles/main.css';
import './styles/planner-controls.css';
import './styles/trip-navigation.css';
import './styles/theme.css';
import './styles/experience.css';

const PlanningView = lazy(() => import('./components/PlanningView'));
const BudgetView = lazy(() => import('./components/BudgetView'));
const ObjectsView = lazy(() => import('./components/ObjectsView'));
const TravelersView = lazy(() => import('./components/TravelersView'));
const AccountView = lazy(() => import('./components/AccountView'));

const AppContent = () => {
  const { state, clearError } = useApp();
  const { t } = useTranslation(state.language);
  if (state.authLoading && !state.isAuthenticated) {
    return <div className="app auth-restoring"><Navbar /><div className="auth-restoring-mark" role="status"><img src={`${import.meta.env.BASE_URL}tabiji-log-mark.svg`} alt="" /><span>{t('loading')}</span></div></div>;
  }
  if (!state.isAuthenticated && !state.publicPreview) {
    return <div className="app welcome-app"><Navbar /><WelcomeView /></div>;
  }
  const renderView = () => {
    switch (state.currentView) {
      case 'planning':
        return <PlanningView />;
      case 'budget':
        return <BudgetView />;
      case 'objects':
        return <ObjectsView />;
      case 'travelers':
        return <TravelersView />;
      case 'account':
        return <AccountView />;
      default:
        return <PlanningView />;
    }
  };

  return (
    <div className={`app ${state.currentView === 'account' ? 'account-view-active' : ''}`}>
      <Navbar />
      <main className={`container ${state.currentView !== 'planning' ? 'centered-view' : ''}`}>
        <Suspense fallback={<div className="view-loading" role="status"><span className="loading-spinner" aria-hidden="true" />{t('loading')}</div>}>
          {renderView()}
        </Suspense>
      </main>
      <Footer />
      {state.error && <div className="app-notice" role="alert"><span>{t(state.error)}</span><button type="button" onClick={clearError} aria-label={t('close')}>×</button></div>}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
