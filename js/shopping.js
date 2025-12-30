/**
 * Shopping Module
 * CRUD operations for shopping items
 */

const Shopping = {
    /**
     * Get next available ID
     * @returns {number} Next ID
     */
    getNextId() {
        return Utils.getNextId(State.shoppingItemsData);
    },

    /**
     * Add a new shopping item
     * @param {Object} data - Shopping item data
     * @returns {number} New item ID
     */
    add(data) {
        const newItem = {
            id: this.getNextId(),
            name: data.name,
            category: data.category || 'otros',
            price: data.price || 0,
            currency: data.currency || 'EUR',
            purchased: false,
            link: data.link || ''
        };
        State.shoppingItemsData.push(newItem);
        State.save();
        return newItem.id;
    },

    /**
     * Update an existing shopping item
     * @param {number} id - Item ID
     * @param {Object} data - New item data
     * @returns {boolean} Success status
     */
    update(id, data) {
        const index = State.shoppingItemsData.findIndex(i => i.id === id);
        if (index !== -1) {
            State.shoppingItemsData[index] = {
                ...State.shoppingItemsData[index],
                name: data.name,
                category: data.category,
                price: data.price || 0,
                currency: data.currency || 'EUR',
                link: data.link || ''
            };
            State.save();
            return true;
        }
        return false;
    },

    /**
     * Delete a shopping item
     * @param {number} id - Item ID
     * @returns {boolean} Success status
     */
    delete(id) {
        const initialLength = State.shoppingItemsData.length;
        State.shoppingItemsData = State.shoppingItemsData.filter(i => i.id !== id);
        if (State.shoppingItemsData.length < initialLength) {
            State.save();
            return true;
        }
        return false;
    },

    /**
     * Toggle purchased status
     * @param {number} id - Item ID
     * @returns {boolean} New purchased status
     */
    togglePurchased(id) {
        const item = State.shoppingItemsData.find(i => i.id === id);
        if (item) {
            item.purchased = !item.purchased;
            State.save();
            return item.purchased;
        }
        return false;
    },

    /**
     * Get shopping item by ID
     * @param {number} id - Item ID
     * @returns {Object|null} Shopping item or null
     */
    get(id) {
        return State.shoppingItemsData.find(i => i.id === id) || null;
    },

    /**
     * Get all shopping items
     * @returns {Array} All shopping items
     */
    getAll() {
        return State.shoppingItemsData;
    },

    /**
     * Get items grouped by category
     * @returns {Object} Object with category keys containing arrays of items
     */
    getByCategory() {
        const categories = {};

        // Initialize categories from config
        Object.keys(Config.SHOPPING_CATEGORIES).forEach(key => {
            categories[key] = {
                ...Config.SHOPPING_CATEGORIES[key],
                items: []
            };
        });

        // Group items
        State.shoppingItemsData.forEach(item => {
            const category = categories[item.category] || categories.otros;
            category.items.push(item);
        });

        return categories;
    },

    /**
     * Calculate total price by currency
     * @returns {Object} Object with currency keys and total values
     */
    getTotalsByCurrency() {
        const totals = {};
        State.shoppingItemsData.forEach(item => {
            const currency = item.currency || 'EUR';
            const price = parseFloat(item.price) || 0;
            if (!totals[currency]) totals[currency] = 0;
            totals[currency] += price;
        });
        return totals;
    },

    /**
     * Get purchase stats
     * @returns {Object} { purchased: number, pending: number, total: number }
     */
    getStats() {
        const purchased = State.shoppingItemsData.filter(i => i.purchased).length;
        const total = State.shoppingItemsData.length;
        return {
            purchased,
            pending: total - purchased,
            total
        };
    },

    /**
     * Create shopping item data from form values
     * @param {Object} formData - Form values
     * @returns {Object} Shopping item data
     */
    createFromForm(formData) {
        return {
            name: formData.name.trim(),
            category: formData.category || 'otros',
            price: parseFloat(formData.price) || 0,
            currency: formData.currency || 'EUR',
            link: formData.link.trim()
        };
    },

    /**
     * Validate shopping item data
     * @param {Object} data - Shopping item data
     * @returns {Object} { valid: boolean, error: string }
     */
    validate(data) {
        if (!data.name || !data.name.trim()) {
            return { valid: false, error: I18n.t('enterProductName') };
        }
        return { valid: true };
    }
};

Object.freeze(Shopping);
