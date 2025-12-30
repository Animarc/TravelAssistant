/**
 * Storage Module
 * Handles all localStorage operations with error handling
 */

const Storage = {
    /**
     * Generic load function with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found or error
     * @returns {*} Parsed data or default value
     */
    _load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Generic save function with error handling
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @returns {boolean} Success status
     */
    _save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    },

    /**
     * Load trip name
     * @returns {string|null} Trip name or null
     */
    loadTripName() {
        return this._load(Config.STORAGE_KEYS.TRIP_NAME);
    },

    /**
     * Load days data
     * @returns {Array|null} Days array or null
     */
    loadDays() {
        return this._load(Config.STORAGE_KEYS.DAYS);
    },

    /**
     * Load current day index
     * @returns {number} Current day index
     */
    loadCurrentDay() {
        try {
            const savedDay = localStorage.getItem(Config.STORAGE_KEYS.CURRENT_DAY);
            return savedDay !== null ? (parseInt(savedDay, 10) || 0) : 0;
        } catch (error) {
            console.error('Error loading currentDay from localStorage:', error);
            return 0;
        }
    },

    /**
     * Load accommodations data
     * @returns {Array|null} Accommodations array or null
     */
    loadAccommodations() {
        return this._load(Config.STORAGE_KEYS.ACCOMMODATIONS);
    },

    /**
     * Load shopping items data
     * @returns {Array|null} Shopping items array or null
     */
    loadShoppingItems() {
        return this._load(Config.STORAGE_KEYS.SHOPPING);
    },

    /**
     * Save all application data
     * @param {Object} data - Object containing tripName, days, accommodations, shopping, currentDay
     * @returns {boolean} Success status
     */
    saveAll(data) {
        try {
            localStorage.setItem(Config.STORAGE_KEYS.TRIP_NAME, JSON.stringify(data.tripName));
            localStorage.setItem(Config.STORAGE_KEYS.DAYS, JSON.stringify(data.days));
            localStorage.setItem(Config.STORAGE_KEYS.ACCOMMODATIONS, JSON.stringify(data.accommodations));
            localStorage.setItem(Config.STORAGE_KEYS.SHOPPING, JSON.stringify(data.shopping));
            localStorage.setItem(Config.STORAGE_KEYS.CURRENT_DAY, data.currentDay.toString());
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all application data
     * @returns {boolean} Success status
     */
    clearAll() {
        try {
            Object.values(Config.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

Object.freeze(Storage);
