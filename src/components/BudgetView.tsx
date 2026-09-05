import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatPrice, getShoppingCategoryIcon, calculateNights } from '../utils';
import ShoppingModal from './modals/ShoppingModal';
import type { EntityId } from '../types';
import ConfirmDialog from './ConfirmDialog';

const BudgetView = () => {
  const { state, toggleShoppingPurchased, deleteShoppingItem } = useApp();
  const { t } = useTranslation(state.language);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<EntityId | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<EntityId | null>(null);
  const activeTrip = state.trips.find(trip => trip.id === state.activeTripId);
  const baseCurrency = activeTrip?.currency ?? 'EUR';
  const canEdit = !state.publicPreview && activeTrip?.capabilities?.canEdit === true;

  // Calculate paying travelers count
  const payingTravelersCount = useMemo(() => {
    return state.travelers.filter(t => t.paysBudget).length;
  }, [state.travelers]);

  // Calculate budget totals
  const budget = useMemo(() => {
    // Activities total
    let activitiesTotal = 0;
    state.days.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.price && (activity.currency ?? baseCurrency) === baseCurrency) {
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
      (sum, item) => sum + (item.currency === baseCurrency ? item.price : 0),
      0
    );

    const foreignTotals = new Map<string, number>();
    state.days.flatMap(day => day.activities).forEach(item => {
      const currency = item.currency ?? baseCurrency;
      if (item.price && currency !== baseCurrency) foreignTotals.set(currency, (foreignTotals.get(currency) ?? 0) + Number(item.price));
    });
    state.shoppingItems.forEach(item => {
      if (item.currency !== baseCurrency) foreignTotals.set(item.currency, (foreignTotals.get(item.currency) ?? 0) + item.price);
    });

    return {
      activities: activitiesTotal,
      accommodations: accommodationsTotal,
      shopping: shoppingTotal,
      total: activitiesTotal + accommodationsTotal + shoppingTotal,
      foreign: [...foreignTotals.entries()]
    };
  }, [baseCurrency, state.days, state.accommodations, state.shoppingItems]);

  const handleDeleteShopping = (id: EntityId) => {
    setPendingDeleteItem(id);
  };

  return (
    <div className="left-panel budget-view">
      <div className="budget-wrapper">
        <div className="budget-content">
          {/* Activities Section */}
          <section className="budget-section">
            <div className="budget-section-header">
              <h3>{t('activities')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.activities, baseCurrency)}
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
              <h3>{t('accommodations')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.accommodations, baseCurrency)}
              </span>
            </div>
            <div className="budget-section-content">
              {state.accommodations.map(acc => (
                <div key={acc.id} className="budget-item">
                  <div className="budget-item-info">
                    <span className="budget-item-name">{acc.name}</span>
                  </div>
                  <div className="budget-item-actions">
                    <span className="budget-item-nights">
                      {calculateNights(acc.fromDay, acc.toDay)} {calculateNights(acc.fromDay, acc.toDay) === 1 ? t('night') : t('nights')}
                    </span>
                    <span className="budget-item-price">{formatPrice(acc.price, baseCurrency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shopping Section */}
          <section className="budget-section">
            <div className="budget-section-header">
              <h3>{t('shoppingAndReservations')}</h3>
              <span className="budget-section-total">
                {formatPrice(budget.shopping, baseCurrency)}
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
                  </div>
                  <div className="budget-item-actions">
                    <span className={`shopping-status ${item.purchased ? 'purchased' : 'pending'}`}>
                      {item.purchased ? t('purchased') : t('pending')}
                    </span>
                    <span className="budget-item-price">
                      {formatPrice(item.price, item.currency)}
                    </span>
                    <button
                      className="toggle-purchased-btn"
                      disabled={!canEdit}
                      onClick={() => void toggleShoppingPurchased(item.id).catch(() => undefined)}
                    >
                      {item.purchased ? '↩️' : '✅'}
                    </button>
                    <button
                      className="edit-btn"
                      hidden={!canEdit}
                      disabled={!canEdit}
                      onClick={() => {
                        setEditingItemId(item.id);
                        setShowShoppingModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      hidden={!canEdit}
                      disabled={!canEdit}
                      onClick={() => handleDeleteShopping(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="add-shopping-btn"
                hidden={!canEdit}
                disabled={!canEdit}
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
                  <span>{formatPrice(budget.activities, baseCurrency)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('subtotalAccommodations')}</span>
                  <span>{formatPrice(budget.accommodations, baseCurrency)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('subtotalShopping')}</span>
                  <span>{formatPrice(budget.shopping, baseCurrency)}</span>
                </div>
              </div>
              <div className="grand-total">
                <span>{t('total')}</span>
                <span className="grand-total-amount">{formatPrice(budget.total, baseCurrency)}</span>
              </div>
              {budget.foreign.map(([currency, total]) => <div className="breakdown-row" key={currency}><span>{t('unconverted')}</span><span>{formatPrice(total, currency)}</span></div>)}
              {payingTravelersCount > 1 && (
                <div className="per-person-total">
                  <span>{t('perPerson')} ({payingTravelersCount})</span>
                  <span className="per-person-amount">
                    {formatPrice(budget.total / payingTravelersCount, baseCurrency)}
                  </span>
                </div>
              )}
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
      <ConfirmDialog open={pendingDeleteItem !== null} message={t('confirmDeleteShopping')} confirmLabel={t('delete')} cancelLabel={t('cancel')} onCancel={() => setPendingDeleteItem(null)} onConfirm={async () => {
        if (pendingDeleteItem === null) return;
        try { await deleteShoppingItem(pendingDeleteItem); setPendingDeleteItem(null); }
        catch { /* Global error notification remains visible. */ }
      }} />
    </div>
  );
};

export default BudgetView;
