import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useSubmitLock } from '../../hooks/useSubmitLock';

interface DayModalProps {
  onCreate: (description: string) => Promise<void>;
  onClose: () => void;
}

const DayModal = ({ onCreate, onClose }: DayModalProps) => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [description, setDescription] = useState('');
  const { isSubmitting, submitOnce } = useSubmitLock();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedDescription = description.trim();

    if (!trimmedDescription) return;

    try {
      await submitOnce(() => onCreate(trimmedDescription));
    } catch { /* Global error notification remains visible. */ }
  };

  return (
    <dialog className="modal" open onCancel={onClose}>
      <section className="modal-content day-modal" aria-labelledby="new-day-title">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label={t('cancel')}
        >
          ×
        </button>
        <h2 id="new-day-title">{t('addDayFull')}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="day-description">{t('describeNewDay')}</label>
          <textarea
            id="day-description"
            rows={3}
            maxLength={80}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('describeNewDayPlaceholder')}
            autoFocus
            required
          />
          <p className="field-hint">{t('describeNewDayHint')}</p>
          <div className="day-modal-actions">
            <button type="button" className="secondary-modal-btn" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={isSubmitting || !description.trim()}>
              {isSubmitting ? t('saving') : t('createDay')}
            </button>
          </div>
        </form>
      </section>
    </dialog>
  );
};

export default DayModal;
