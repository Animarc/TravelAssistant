import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const AccountView = () => {
  const { state, switchTrip, setCurrentView } = useApp();
  const { t } = useTranslation(state.language);

  const handleExportJson = () => {
    const data = {
      tripName: state.tripName,
      days: state.days,
      accommodations: state.accommodations,
      shoppingItems: state.shoppingItems
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.tripName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="left-panel account-view">
      <div className="account-content">
        <section className="account-section">
          <h2>{t('login')}</h2>
          <p className="not-logged-in">{t('notLoggedIn')}</p>
          <button className="login-btn" disabled>
            {t('loginWithGoogle')}
          </button>
          <p className="coming-soon">Coming soon...</p>
        </section>

        <section className="account-section">
          <h2>{t('tools')}</h2>
          <div className="tools-buttons">
            <button onClick={handleExportJson}>
              📥 {t('exportJson')}
            </button>
            <button disabled>
              📤 {t('importJson')}
            </button>
          </div>
        </section>

        <section className="account-section">
          <h2>{t('myTrips')}</h2>
          {state.trips.map(trip => (
            <div key={trip.id} className={`trip-card ${trip.id === state.activeTripId ? 'current' : ''}`}>
              <div className="trip-info">
                <h3>{trip.tripName}</h3>
                <p>
                  {trip.days.length} {t('days')} •{' '}
                  {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} {t('activitiesCount')}
                </p>
              </div>
              <div className="trip-actions">
                <button onClick={() => {
                  switchTrip(trip.id);
                  setCurrentView('planning');
                }}>
                  {t('open')}
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AccountView;
