import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

interface PackingItem {
  key: string;
  checked: boolean;
}

interface PackingCategory {
  name: string;
  icon: string;
  items: PackingItem[];
}

const ObjectsView = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);

  const [categories, setCategories] = useState<PackingCategory[]>([
    {
      name: t('electronics'),
      icon: '📱',
      items: [
        { key: 'phoneCharger', checked: false },
        { key: 'powerBank', checked: false },
        { key: 'powerAdapter', checked: false },
        { key: 'headphones', checked: false },
        { key: 'camera', checked: false }
      ]
    },
    {
      name: t('clothing'),
      icon: '👕',
      items: [
        { key: 'underwear', checked: false },
        { key: 'socks', checked: false },
        { key: 'tshirts', checked: false },
        { key: 'pants', checked: false },
        { key: 'jacket', checked: false },
        { key: 'pajamas', checked: false }
      ]
    },
    {
      name: t('hygiene'),
      icon: '🧴',
      items: [
        { key: 'toothbrush', checked: false },
        { key: 'toothpaste', checked: false },
        { key: 'shampoo', checked: false },
        { key: 'soap', checked: false },
        { key: 'deodorant', checked: false },
        { key: 'towels', checked: false }
      ]
    },
    {
      name: t('documents'),
      icon: '📄',
      items: [
        { key: 'passportId', checked: false },
        { key: 'flightTickets', checked: false },
        { key: 'hotelReservations', checked: false },
        { key: 'travelInsurance', checked: false },
        { key: 'cash', checked: false },
        { key: 'creditCards', checked: false }
      ]
    },
    {
      name: t('other'),
      icon: '📦',
      items: [
        { key: 'backpack', checked: false },
        { key: 'waterBottle', checked: false },
        { key: 'medications', checked: false },
        { key: 'sunscreen', checked: false },
        { key: 'sunglasses', checked: false },
        { key: 'book', checked: false }
      ]
    }
  ]);

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    setCategories(prev => {
      const newCategories = [...prev];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: newCategories[categoryIndex].items.map((item, i) =>
          i === itemIndex ? { ...item, checked: !item.checked } : item
        )
      };
      return newCategories;
    });
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.checked).length,
    0
  );

  return (
    <div className="left-panel objects-view">
      <div className="objects-header">
        <h2>{t('objectsListTitle')}</h2>
        <div className="objects-progress">
          <span>{checkedItems} / {totalItems}</span>
          <progress value={checkedItems} max={totalItems} />
        </div>
      </div>

      <div className="objects-list">
        {categories.map((category, catIndex) => (
          <section key={catIndex} className="objects-category">
            <h3>
              <span className="category-icon">{category.icon}</span>
              {category.name}
              <span className="category-count">
                {category.items.filter(i => i.checked).length}/{category.items.length}
              </span>
            </h3>
            <ul>
              {category.items.map((item, itemIndex) => (
                <li
                  key={item.key}
                  className={`object-item ${item.checked ? 'checked' : ''}`}
                  onClick={() => toggleItem(catIndex, itemIndex)}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(catIndex, itemIndex)}
                  />
                  <span>{t(item.key)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ObjectsView;
