import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EntityId, ShoppingCategory } from '../../types';

interface ShoppingModalProps {
  editId?: EntityId;
  onClose: () => void;
}

const ShoppingModal = ({ editId, onClose }: ShoppingModalProps) => {
  const { state, addShoppingItem, updateShoppingItem } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editId !== undefined;
  const tripCurrency = state.trips.find(trip => trip.id === state.activeTripId)?.currency ?? 'EUR';
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'otros' as ShoppingCategory,
    price: '',
    currency: tripCurrency,
    link: ''
  });

  useEffect(() => {
    if (isEditing) {
      const item = state.shoppingItems.find(i => i.id === editId);
      if (item) {
        setFormData({
          name: item.name,
          category: item.category,
          price: item.price.toString(),
          currency: item.currency,
          link: item.link || ''
        });
      }
    }
  }, [isEditing, editId, state.shoppingItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError(t('enterProductName'));
      return;
    }

    const item = {
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      purchased: isEditing
        ? state.shoppingItems.find(i => i.id === editId)?.purchased || false
        : false,
      link: formData.link || undefined
    };

    setValidationError(null);
    try {
      if (isEditing && editId !== undefined) await updateShoppingItem(editId, item);
      else await addShoppingItem(item);
      onClose();
    } catch { /* Global error notification remains visible. */ }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <dialog className="modal" open>
      <section className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{isEditing ? t('editPurchase') : t('addPurchase')}</h2>
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
        <form onSubmit={handleSubmit}>
          <label>{t('name')}:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('category')}:
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="transporte">🚆 {t('catTransport')}</option>
              <option value="entradas">🎟️ {t('catTickets')}</option>
              <option value="electronica">📱 {t('catElectronics')}</option>
              <option value="documentos">📄 {t('catDocuments')}</option>
              <option value="otros">📦 {t('catOther')}</option>
            </select>
          </label><br />

          <label>{t('price')}:
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

          <label>{t('currency')}:
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
          </label><br />

          <label>{t('link')} ({t('optional')}):<br />
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
            />
          </label><br />

          <button type="submit">
            {isEditing ? t('updateBtn') : t('addBtn')}
          </button>
        </form>
      </section>
    </dialog>
  );
};

export default ShoppingModal;
