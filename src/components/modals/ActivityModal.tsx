import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { Activity, ActivityType } from '../../types';

interface ActivityModalProps {
  editIndex?: number;
  onClose: () => void;
}

const ActivityModal = ({ editIndex, onClose }: ActivityModalProps) => {
  const { state, addActivity, updateActivity } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editIndex !== undefined;
  const tripCurrency = state.trips.find(trip => trip.id === state.activeTripId)?.currency ?? 'EUR';
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isSubmitting, submitOnce } = useSubmitLock();

  const [formData, setFormData] = useState<Partial<Activity>>({
    time: '',
    name: '',
    description: '',
    importantInfo: '',
    price: '',
    currency: tripCurrency,
    type: 'normal',
    isOptional: false,
    coordinates: undefined
  });

  useEffect(() => {
    if (isEditing && state.days[state.currentDay]?.activities[editIndex]) {
      const activity = state.days[state.currentDay].activities[editIndex];
      setFormData({
        ...activity,
        price: activity.price?.toString() || ''
      });
    }
  }, [isEditing, editIndex, state.currentDay, state.days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setValidationError(t('fillRequiredFields'));
      return;
    }

    const activity: Activity = {
      time: formData.time || '',
      name: formData.name.trim(),
      description: formData.description || '',
      importantInfo: formData.importantInfo,
      price: formData.price ? parseFloat(formData.price as string) : undefined,
      currency: formData.currency || tripCurrency,
      type: formData.type as ActivityType,
      isOptional: formData.isOptional,
      coordinates: formData.coordinates
    };

    setValidationError(null);
    try {
      const submitted = await submitOnce(async () => {
        if (isEditing) await updateActivity(editIndex, activity);
        else await addActivity(activity);
      });
      if (submitted) onClose();
    } catch { /* Global error notification remains visible. */ }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <dialog className="modal" open>
      <section className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{isEditing ? t('editActivity') : t('addNewActivity')}</h2>
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="checkbox"
              name="isOptional"
              checked={formData.isOptional || false}
              onChange={handleChange}
            /> {t('optionalActivity')}
          </label><br />

          <label>{t('activityType')}:
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="normal">📌 {t('typeNormal')}</option>
              <option value="vuelo">✈️ {t('typeFlight')}</option>
              <option value="transporte">🚆 {t('typeTransport')}</option>
              <option value="comida">🍽️ {t('typeFood')}</option>
              <option value="visita">🏛️ {t('typeVisit')}</option>
            </select>
          </label><br />

          <label>{t('time')}:
            <input
              type="time"
              name="time"
              value={formData.time || ''}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('name')}:
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('description')}:<br />
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('importantInfo')}:<br />
            <textarea
              name="importantInfo"
              rows={2}
              placeholder={t('optional')}
              value={formData.importantInfo || ''}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('price')}:
            <input
              type="text"
              name="price"
              placeholder={t('optional')}
              value={formData.price || ''}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('currency')}:
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
          </label><br />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : isEditing ? t('updateActivityBtn') : t('addActivityBtn')}
          </button>
        </form>
      </section>
    </dialog>
  );
};

export default ActivityModal;
