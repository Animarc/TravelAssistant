import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { DocumentType } from '../types';
import TravelerModal from './modals/TravelerModal';

const TravelersView = () => {
  const { state, deleteTraveler } = useApp();
  const { t } = useTranslation(state.language);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [expandedTraveler, setExpandedTraveler] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirm(t('confirmDeleteTraveler'))) {
      deleteTraveler(id);
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(undefined);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(undefined);
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

  const payingTravelers = state.travelers.filter(t => t.paysBudget).length;

  return (
    <div className="left-panel travelers-view">
      <div className="travelers-header">
        <h2>{t('travelersTitle')}</h2>
        <div className="travelers-summary">
          <span className="travelers-count">
            {state.travelers.length} {state.travelers.length === 1 ? t('traveler') : t('travelersPlural')}
          </span>
          {state.travelers.length > 0 && (
            <span className="travelers-paying">
              ({payingTravelers} {t('payingBudget')})
            </span>
          )}
        </div>
      </div>

      <div className="travelers-list">
        {state.travelers.length === 0 ? (
          <div className="no-travelers">
            <p>{t('noTravelers')}</p>
          </div>
        ) : (
          state.travelers.map(traveler => (
            <div
              key={traveler.id}
              className={`traveler-card ${expandedTraveler === traveler.id ? 'expanded' : ''}`}
              onClick={() => setExpandedTraveler(expandedTraveler === traveler.id ? null : traveler.id)}
            >
              <div className="traveler-header">
                <div className="traveler-avatar">
                  {traveler.firstName.charAt(0)}{traveler.lastName.charAt(0)}
                </div>
                <div className="traveler-basic-info">
                  <strong className="traveler-name">
                    {traveler.firstName} {traveler.lastName}
                  </strong>
                  <span className="traveler-age">{traveler.age} {t('yearsOld')}</span>
                </div>
                {traveler.paysBudget && (
                  <span className="traveler-pays-badge">{t('paysBudgetShort')}</span>
                )}
                <span className="traveler-expand-icon">
                  {expandedTraveler === traveler.id ? '▲' : '▼'}
                </span>
              </div>

              <div className="traveler-details">
                {traveler.email && (
                  <div className="traveler-detail-row">
                    <span className="detail-label">{t('email')}:</span>
                    <span className="detail-value">{traveler.email}</span>
                  </div>
                )}
                {traveler.phone && (
                  <div className="traveler-detail-row">
                    <span className="detail-label">{t('phone')}:</span>
                    <span className="detail-value">
                      {traveler.phonePrefix && `${traveler.phonePrefix} `}{traveler.phone}
                    </span>
                  </div>
                )}
                {traveler.documents && traveler.documents.length > 0 && (
                  <div className="traveler-documents">
                    <span className="detail-label">{t('documents')}:</span>
                    <ul className="documents-display-list">
                      {traveler.documents.map((doc, index) => (
                        <li key={index} className="document-display-item">
                          <strong>{getDocumentTypeName(doc.type)}:</strong> {doc.number}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="traveler-actions">
                  <button
                    className="traveler-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(traveler.id);
                    }}
                  >
                    {t('edit')}
                  </button>
                  <button
                    className="traveler-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(traveler.id);
                    }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <button className="add-traveler-btn" onClick={handleAdd}>
          + {t('addTraveler')}
        </button>
      </div>

      {showModal && (
        <TravelerModal
          editId={editingId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TravelersView;
