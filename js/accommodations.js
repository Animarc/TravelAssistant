/**
 * Accommodations Module
 * CRUD operations for accommodations
 */

const Accommodations = {
    /**
     * Get next available ID
     * @returns {number} Next ID
     */
    getNextId() {
        return Utils.getNextId(State.accommodationsData);
    },

    /**
     * Add a new accommodation
     * @param {Object} data - Accommodation data
     * @returns {number} New accommodation ID
     */
    add(data) {
        const newAccommodation = {
            id: this.getNextId(),
            name: data.name,
            fromDay: data.fromDay,
            toDay: data.toDay,
            price: data.price || 0,
            link: data.link || '',
            coordinates: data.coordinates
        };
        State.accommodationsData.push(newAccommodation);
        State.save();
        return newAccommodation.id;
    },

    /**
     * Update an existing accommodation
     * @param {number} id - Accommodation ID
     * @param {Object} data - New accommodation data
     * @returns {boolean} Success status
     */
    update(id, data) {
        const index = State.accommodationsData.findIndex(a => a.id === id);
        if (index !== -1) {
            State.accommodationsData[index] = {
                id,
                name: data.name,
                fromDay: data.fromDay,
                toDay: data.toDay,
                price: data.price || 0,
                link: data.link || '',
                coordinates: data.coordinates
            };
            State.save();
            return true;
        }
        return false;
    },

    /**
     * Delete an accommodation
     * @param {number} id - Accommodation ID
     * @returns {boolean} Success status
     */
    delete(id) {
        const initialLength = State.accommodationsData.length;
        State.accommodationsData = State.accommodationsData.filter(a => a.id !== id);
        if (State.accommodationsData.length < initialLength) {
            State.save();
            return true;
        }
        return false;
    },

    /**
     * Get accommodation by ID
     * @param {number} id - Accommodation ID
     * @returns {Object|null} Accommodation or null
     */
    get(id) {
        return State.accommodationsData.find(a => a.id === id) || null;
    },

    /**
     * Get all accommodations
     * @returns {Array} All accommodations
     */
    getAll() {
        return State.accommodationsData;
    },

    /**
     * Get accommodations for a specific day
     * @param {number} dayIndex - Day index
     * @returns {Array} Accommodations for the day
     */
    getForDay(dayIndex) {
        return State.getAccommodationsForDay(dayIndex);
    },

    /**
     * Calculate total price by currency
     * @returns {Object} Object with currency keys and total values
     */
    getTotalsByCurrency() {
        const totals = {};
        State.accommodationsData.forEach(acc => {
            const currency = 'EUR'; // Accommodations are in EUR
            const price = parseFloat(acc.price) || 0;
            if (!totals[currency]) totals[currency] = 0;
            totals[currency] += price;
        });
        return totals;
    },

    /**
     * Create accommodation data from form values
     * @param {Object} formData - Form values
     * @returns {Object} Accommodation data
     */
    createFromForm(formData) {
        return {
            name: formData.name.trim(),
            fromDay: parseInt(formData.fromDay),
            toDay: parseInt(formData.toDay),
            price: parseFloat(formData.price) || 0,
            link: formData.link.trim(),
            coordinates: Utils.parseCoordinates(formData.lat, formData.lng)
        };
    },

    /**
     * Validate accommodation data
     * @param {Object} data - Accommodation data
     * @returns {Object} { valid: boolean, error: string }
     */
    validate(data) {
        if (!data.name || !data.name.trim()) {
            return { valid: false, error: I18n.t('enterAccommodationName') };
        }
        if (data.toDay < data.fromDay) {
            return { valid: false, error: I18n.t('checkoutAfterCheckin') };
        }
        return { valid: true };
    }
};

Object.freeze(Accommodations);
