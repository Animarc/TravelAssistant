import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { Accommodation, EntityId } from '../../types';

interface AccommodationModalProps {
  editId?: EntityId;
  onClose: () => void;
}

const AccommodationModal = ({ editId, onClose }: AccommodationModalProps) => {
  const { state, addAccommodation, updateAccommodation } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editId !== undefined;
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isSubmitting, submitOnce } = useSubmitLock();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    link: '',
    fromDay: 0,
    toDay: 0,
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (isEditing) {
      const acc = state.accommodations.find(a => a.id === editId);
      if (acc) {
        setFormData({
          name: acc.name,
          price: acc.price.toString(),
          link: acc.link || '',
          fromDay: acc.fromDay,
          toDay: acc.toDay,
          lat: acc.coordinates?.[0]?.toString() || '',
          lng: acc.coordinates?.[1]?.toString() || ''
        });
      }
    }
  }, [isEditing, editId, state.accommodations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError(t('enterAccommodationName'));
      return;
    }

    if (formData.toDay < formData.fromDay) {
      setValidationError(t('checkoutAfterCheckin'));
      return;
    }

    const accommodation: Omit<Accommodation, 'id'> = {
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      link: formData.link || undefined,
      fromDay: formData.fromDay,
      toDay: formData.toDay,
      coordinates: formData.lat && formData.lng
        ? [parseFloat(formData.lat), parseFloat(formData.lng)]
        : undefined
    };

    setValidationError(null);
    try {
      const submitted = await submitOnce(async () => {
        if (isEditing && editId !== undefined) await updateAccommodation(editId, accommodation);
        else await addAccommodation(accommodation);
      });
      if (submitted) onClose();
    } catch { /* Global error notification remains visible. */ }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fromDay' || name === 'toDay' ? parseInt(value) : value
    }));
  };

  return (
    <dialog className="modal" open>
      <section className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{isEditing ? t('editAccommodation') : t('addNewAccommodation')}</h2>
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
        <form onSubmit={handleSubmit}>
          <label>{t('placeName')}:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('fromDay')}:
            <select name="fromDay" value={formData.fromDay} onChange={handleChange}>
              {state.days.map((day, index) => (
                <option key={index} value={index}>
                  {t('day')} {index + 1}: {day.title}
                </option>
              ))}
            </select>
          </label><br />

          <label>{t('toDay')}:
            <select name="toDay" value={formData.toDay} onChange={handleChange}>
              {state.days.map((day, index) => (
                <option key={index} value={index}>
                  {t('day')} {index + 1}: {day.title}
                </option>
              ))}
            </select>
          </label><br />

          <label>{t('totalPrice')} (€):
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('providerLink')}:<br />
            <input
              type="url"
              name="link"
              placeholder={t('optional')}
              value={formData.link}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('latitude')}:
            <input
              type="number"
              step="any"
              name="lat"
              placeholder={t('optional')}
              value={formData.lat}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('longitude')}:
            <input
              type="number"
              step="any"
              name="lng"
              placeholder={t('optional')}
              value={formData.lng}
              onChange={handleChange}
            />
          </label><br />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : isEditing ? t('updateAccommodationBtn') : t('addAccommodationBtn')}
          </button>
        </form>
      </section>
    </dialog>
  );
};

export default AccommodationModal;
