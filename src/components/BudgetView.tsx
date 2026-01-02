import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatPrice, getShoppingCategoryIcon, calculateNights } from '../utils';
import ShoppingModal from './modals/ShoppingModal';

const BudgetView = () => {
  const { state, toggleShoppingPurchased, deleteShoppingItem } = useApp();
  const { t } = useTranslation(state.language);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Calculate budget totals
  const budget = useMemo(() => {
    // Activities total
    let activitiesTotal = 0;
    state.days.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.price) {
          activitiesTotal += parseFloat(String(activity.price)) || 0;
        }
      });
    });

    // Accommodations total
    const accommodationsTotal = state.accommodations.reduce(
      (sum, acc) => sum + acc.price,
      0
    );

    // Shopping total
    const shoppingTotal = state.shoppingItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    return {
      activities: activitiesTotal,
      accommodations: accommodationsTotal,
      shopping: shoppingTotal,
      total: activitiesTotal + accommodationsTotal + shoppingTotal
    };
  }, [state.days, state.accommodations, state.shoppingItems]);

  const handleDeleteShopping = (id: number) => {
    if (confirm(t('confirmDeleteShopping'))) {
      deleteShoppingItem(id);
    }
  };

  return (
    <div className="left-panel budget-view">
      <div className="budget-wrapper">
        <div className="budget-content">
          {/* Activities Section */}
          <section className="budget-section">
            <div className="budget-section-header">
              <h3>📋 {t('activities')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.activities)}
              </span>
            </div>
            <div className="budget-section-content">
              {state.days.map((day, dayIndex) => (
                <div key={dayIndex} className="budget-day">
                  <h4>{t('day')} {dayIndex + 1}: {day.title}</h4>
                  {day.activities
                    .filter(a => a.price)
                    .map((activity, actIndex) => (
                      <div key={actIndex} className="budget-item">
                        <span className="budget-item-name">{activity.name}</span>
                        <span className="budget-item-price">
                          {formatPrice(activity.price, activity.currency)}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </section>

          {/* Accommodations Section */}
          <section className="budget-section">
            <div className="budget-section-header">
              <h3>🏨 {t('accommodations')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.accommodations)}
              </span>
            </div>
            <div className="budget-section-content">
              {state.accommodations.map(acc => (
                <div key={acc.id} className="budget-item">
                  <div className="budget-item-info">
                    <span className="budget-item-name">{acc.name}</span>
                    <span className="budget-item-nights">
                      {calculateNights(acc.fromDay, acc.toDay)} {calculateNights(acc.fromDay, acc.toDay) === 1 ? t('night') : t('nights')}
                    </span>
                  </div>
                  <span className="budget-item-price">{formatPrice(acc.price)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Shopping Section */}
          <section className="budget-section">
            <div className="budget-section-header">
              <h3>🛒 {t('shoppingAndReservations')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.shopping)}
              </span>
            </div>
            <div className="budget-section-content">
              {state.shoppingItems.map(item => (
                <div key={item.id} className="budget-item shopping-item">
                  <div className="budget-item-info">
                    <span className="shopping-category">
                      {getShoppingCategoryIcon(item.category)}
                    </span>
                    <span className="budget-item-name">{item.name}</span>
                    <span className={`shopping-status ${item.purchased ? 'purchased' : 'pending'}`}>
                      {item.purchased ? t('purchased') : t('pending')}
                    </span>
                  </div>
                  <div className="budget-item-actions">
                    <span className="budget-item-price">
                      {formatPrice(item.price, item.currency)}
                    </span>
                    <button
                      className="toggle-purchased-btn"
                      onClick={() => toggleShoppingPurchased(item.id)}
                    >
                      {item.purchased ? '↩️' : '✅'}
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setShowShoppingModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteShopping(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="add-shopping-btn"
                onClick={() => {
                  setEditingItemId(null);
                  setShowShoppingModal(true);
                }}
              >
                {t('addPurchaseBtn')}
              </button>
            </div>
          </section>
        </div>

        {/* Total Summary */}
        <aside className="budget-sidebar">
          <div className="budget-grand-summary">
            <div className="budget-grand-total">
              <h3>{t('totalBudget')}</h3>
              <div className="breakdown">
                <div className="breakdown-row">
                  <span>{t('subtotalActivities')}</span>
                  <span>{formatPrice(budget.activities)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('subtotalAccommodations')}</span>
                  <span>{formatPrice(budget.accommodations)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('subtotalShopping')}</span>
                  <span>{formatPrice(budget.shopping)}</span>
                </div>
              </div>
              <div className="grand-total">
                <span>{t('total')}</span>
                <span className="grand-total-amount">{formatPrice(budget.total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showShoppingModal && (
        <ShoppingModal
          editId={editingItemId ?? undefined}
          onClose={() => {
            setShowShoppingModal(false);
            setEditingItemId(null);
          }}
        />
      )}
    </div>
  );
};

export default BudgetView;
