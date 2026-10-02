import type { TranslationKey } from '../../i18n/translations';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { Activity, ActivityType, TransportMode } from '../../types';

interface ActivityModalProps {
  editIndex?: number;
  onClose: () => void;
}

const ActivityModal = ({ editIndex, onClose }: ActivityModalProps) => {
  const { state, addActivity, updateActivity } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editIndex !== undefined;
  const tripCurrency = state.trips.find(trip => trip.id === state.activeTripId)?.currency ?? 'EUR';
  const [validationError, setValidationError] = useState<TranslationKey | null>(null);
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

  const [route, setRoute] = useState({ startLat: '', startLng: '', endLat: '', endLng: '' });

  useEffect(() => {
    if (isEditing && state.days[state.currentDay]?.activities[editIndex]) {
      const activity = state.days[state.currentDay].activities[editIndex];
      setFormData({
        ...activity,
        type: activity.type === 'vuelo' ? 'transporte' : activity.type,
        transportMode: activity.transportMode ?? (activity.type === 'vuelo' ? 'plane' : 'vehicle'),
        price: activity.price?.toString() || ''
      });
      setRoute({ startLat: activity.startCoordinates?.[0]?.toString() ?? '', startLng: activity.startCoordinates?.[1]?.toString() ?? '', endLat: activity.endCoordinates?.[0]?.toString() ?? '', endLng: activity.endCoordinates?.[1]?.toString() ?? '' });
    }
  }, [isEditing, editIndex, state.currentDay, state.days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setValidationError('fillRequiredFields');
      return;
    }

    const isTransport = formData.type === 'transporte' || formData.type === 'vuelo';
    if (isTransport && (Object.values(route).some(value => value.trim() === '' || !Number.isFinite(Number(value))) || Math.abs(Number(route.startLat)) > 90 || Math.abs(Number(route.endLat)) > 90 || Math.abs(Number(route.startLng)) > 180 || Math.abs(Number(route.endLng)) > 180)) {
      setValidationError('enterTransportCoordinates'); return;
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
      coordinates: isTransport ? [Number(route.endLat), Number(route.endLng)] : formData.coordinates,
      transportMode: isTransport ? formData.transportMode ?? 'vehicle' : undefined,
      startCoordinates: isTransport ? [Number(route.startLat), Number(route.startLng)] : undefined,
      endCoordinates: isTransport ? [Number(route.endLat), Number(route.endLng)] : undefined
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
        {validationError && <p className="form-error" role="alert">{t(validationError)}</p>}
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
              <option value="transporte">🚆 {t('typeTransport')}</option>
              <option value="comida">🍽️ {t('typeFood')}</option>
              <option value="visita">🏛️ {t('typeVisit')}</option>
            </select>
          </label><br />

          {formData.type === 'transporte' && <fieldset className="transport-route-fields">
            <legend>{t('typeTransport')}</legend>
            <label>{t('transportMode')}<select value={formData.transportMode ?? 'vehicle'} onChange={event => setFormData(previous => ({ ...previous, transportMode: event.target.value as TransportMode }))}>
              <option value="vehicle">{t('transportVehicle')}</option><option value="train">{t('transportTrain')}</option><option value="plane">{t('transportPlane')}</option>
            </select></label>
            {(['start', 'end'] as const).map(side => <div className="transport-coordinate-group" key={side}>
              <strong>{t(side === 'start' ? 'transportOrigin' : 'transportDestination')}</strong>
              {(['Lat', 'Lng'] as const).map(axis => { const key = `${side}${axis}` as keyof typeof route; return <label key={key}>{t(axis === 'Lat' ? 'latitude' : 'longitude')}<input type="number" step="any" required min={axis === 'Lat' ? -90 : -180} max={axis === 'Lat' ? 90 : 180} value={route[key]} onChange={event => setRoute(previous => ({ ...previous, [key]: event.target.value }))} /></label>; })}
            </div>)}
          </fieldset>}

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
              {['EUR', 'USD', 'JPY', 'GBP'].map(code => <option key={code} value={code}>{code} - {new Intl.DisplayNames(state.language, { type: 'currency' }).of(code)}</option>)}
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
