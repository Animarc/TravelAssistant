import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import ActivityModal from './modals/ActivityModal';
import AccommodationModal from './modals/AccommodationModal';

const Toolbar = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);

  return (
    <>
      <section className="toolbar">
        <div className="toolbar-buttons">
          <button onClick={() => setShowActivityModal(true)}>
            {t('addActivity')}
          </button>
          <button onClick={() => setShowAccommodationModal(true)}>
            {t('addAccommodation')}
          </button>
        </div>
      </section>

      {showActivityModal && (
        <ActivityModal onClose={() => setShowActivityModal(false)} />
      )}

      {showAccommodationModal && (
        <AccommodationModal onClose={() => setShowAccommodationModal(false)} />
      )}
    </>
  );
};

export default Toolbar;
