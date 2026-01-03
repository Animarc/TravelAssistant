import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import PlanningView from './components/PlanningView';
import BudgetView from './components/BudgetView';
import ObjectsView from './components/ObjectsView';
import TravelersView from './components/TravelersView';
import AccountView from './components/AccountView';
import Footer from './components/Footer';
import './styles/main.css';

const AppContent = () => {
  const { state } = useApp();
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
