import { AppProvider, useApp } from './context/AppContext';
import { useTranslation } from './hooks/useTranslation';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
import PlanningView from './components/PlanningView';
import BudgetView from './components/BudgetView';
import ObjectsView from './components/ObjectsView';
import AccountView from './components/AccountView';
import Footer from './components/Footer';
import './styles/main.css';

const AppContent = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);

  const renderView = () => {
    switch (state.currentView) {
      case 'planning':
        return <PlanningView />;
      case 'budget':
        return <BudgetView />;
      case 'objects':
        return <ObjectsView />;
      case 'account':
        return <AccountView />;
      default:
        return <PlanningView />;
    }
  };

  return (
    <div className={`app ${state.currentView === 'account' ? 'account-view-active' : ''}`}>
      <Navbar />
      {state.currentView === 'planning' && <Toolbar />}
      <main className={`container ${state.currentView !== 'planning' ? 'centered-view' : ''}`}>
        {renderView()}
      </main>
      <Footer />
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
