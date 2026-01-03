import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Traveler, TravelerDocument, DocumentType } from '../../types';

interface TravelerModalProps {
  editId?: number;
  onClose: () => void;
}

const TravelerModal = ({ editId, onClose }: TravelerModalProps) => {
  const { state, addTraveler, updateTraveler } = useApp();
  const { t } = useTranslation(state.language);
  const isEditing = editId !== undefined;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    phonePrefix: '',
    phone: '',
    paysBudget: true
  });

  const [documents, setDocuments] = useState<TravelerDocument[]>([]);
  const [newDocType, setNewDocType] = useState<DocumentType | ''>('');
  const [newDocNumber, setNewDocNumber] = useState('');

  useEffect(() => {
    if (isEditing) {
      const traveler = state.travelers.find(t => t.id === editId);
      if (traveler) {
        setFormData({
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          age: traveler.age.toString(),
          email: traveler.email || '',
          phonePrefix: traveler.phonePrefix || '',
          phone: traveler.phone || '',
          paysBudget: traveler.paysBudget
        });
        setDocuments(traveler.documents || []);
      }
    }
  }, [isEditing, editId, state.travelers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert(t('enterTravelerName'));
      return;
    }

    if (!formData.age || parseInt(formData.age) < 0) {
      alert(t('enterValidAge'));
      return;
    }

    const traveler: Omit<Traveler, 'id'> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      age: parseInt(formData.age),
      email: formData.email || undefined,
      phonePrefix: formData.phonePrefix || undefined,
      phone: formData.phone || undefined,
      documents: documents,
      paysBudget: formData.paysBudget
    };

    if (isEditing && editId !== undefined) {
      updateTraveler(editId, traveler);
    } else {
      addTraveler(traveler);
    }

    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddDocument = () => {
    if (newDocType && newDocNumber.trim()) {
      setDocuments(prev => [...prev, { type: newDocType, number: newDocNumber.trim() }]);
      setNewDocType('');
      setNewDocNumber('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getDocumentTypeName = (type: DocumentType) => {
    switch (type) {
      case 'passport': return t('docPassport');
      case 'id': return t('docId');
      case 'driverLicense': return t('docDriverLicense');
      case 'other': return t('docOther');
      default: return type;
    }
  };

  return (
    <dialog className="modal" open>
      <section className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{isEditing ? t('editTraveler') : t('addNewTraveler')}</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('firstName')}:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('lastName')}:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('age')}:
            <input
              type="number"
              name="age"
              min="0"
              max="120"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </label><br />

          <label>{t('email')}:
            <input
              type="email"
              name="email"
              placeholder={t('optional')}
              value={formData.email}
              onChange={handleChange}
            />
          </label><br />

          <label>{t('phone')}:
            <div className="phone-input-group">
              <input
                type="text"
                name="phonePrefix"
                placeholder={t('prefix')}
                value={formData.phonePrefix}
                onChange={handleChange}
                className="phone-prefix-input"
              />
              <input
                type="tel"
                name="phone"
                placeholder={t('phoneNumber')}
                value={formData.phone}
                onChange={handleChange}
                className="phone-number-input"
              />
            </div>
          </label><br />

          <div className="documents-section">
            <label>{t('documents')}:</label>

            {documents.length > 0 && (
              <ul className="documents-list">
                {documents.map((doc, index) => (
                  <li key={index} className="document-item">
                    <span className="document-info">
                      <strong>{getDocumentTypeName(doc.type)}:</strong> {doc.number}
                    </span>
                    <button
                      type="button"
                      className="remove-document-btn"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="add-document-row">
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as DocumentType | '')}
                className="document-type-select"
              >
                <option value="">{t('selectOption')}</option>
                <option value="passport">{t('docPassport')}</option>
                <option value="id">{t('docId')}</option>
                <option value="driverLicense">{t('docDriverLicense')}</option>
                <option value="other">{t('docOther')}</option>
              </select>
              <input
                type="text"
                value={newDocNumber}
                onChange={(e) => setNewDocNumber(e.target.value)}
                placeholder={t('documentNumber')}
                className="document-number-input"
              />
              <button
                type="button"
                className="add-document-btn"
                onClick={handleAddDocument}
                disabled={!newDocType || !newDocNumber.trim()}
              >
                +
              </button>
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="paysBudget"
              checked={formData.paysBudget}
              onChange={handleChange}
            />
            {t('paysBudget')}
          </label><br />

          <button type="submit">
            {isEditing ? t('updateTravelerBtn') : t('addTravelerBtn')}
          </button>
        </form>
      </section>
    </dialog>
  );
};

export default TravelerModal;
