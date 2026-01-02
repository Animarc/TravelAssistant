import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ShoppingCategory } from '../../types';

interface ShoppingModalProps {
  editId?: number;
  onClose: () => void;
}

const ShoppingModal = ({ editId, onClose }: ShoppingModalProps) => {
  const { state, addShoppingItem, updateShoppingItem } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editId !== undefined;

  const [formData, setFormData] = useState({
    name: '',
    category: 'otros' as ShoppingCategory,
    price: '',
    currency: 'EUR',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert(t('enterProductName'));
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

    if (isEditing && editId !== undefined) {
      updateShoppingItem(editId, item);
    } else {
      addShoppingItem(item);
    }

    onClose();
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
