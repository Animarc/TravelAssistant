/**
 * State Module
 * Manages application state and data
 */

const State = {
    // Application data
    daysData: null,
    accommodationsData: null,
    shoppingItemsData: null,

    // UI state
    currentDay: 0,
    currentView: Config.VIEWS.PLANNING,

    // Editing state
    editingActivity: null,
    editingAccommodation: null,
    editingShoppingItem: null,

    /**
     * Initialize state from storage or default data
     * @param {Array} defaultDays - Default days from data.js
     * @param {Array} defaultAccommodations - Default accommodations from data.js
     * @param {Array} defaultShopping - Default shopping items from data.js
     */
    init(defaultDays, defaultAccommodations, defaultShopping) {
        this.daysData = Storage.loadDays() || Utils.deepClone(defaultDays);
        this.accommodationsData = Storage.loadAccommodations() || Utils.deepClone(defaultAccommodations);
        this.shoppingItemsData = Storage.loadShoppingItems() || Utils.deepClone(defaultShopping);
        this.currentDay = Storage.loadCurrentDay();
    },

    /**
     * Save all state to storage
     * @returns {boolean} Success status
     */
    save() {
        return Storage.saveAll({
            days: this.daysData,
            accommodations: this.accommodationsData,
            shopping: this.shoppingItemsData,
            currentDay: this.currentDay
        });
    },

    /**
     * Get current day data
     * @returns {Object} Current day object
     */
    getCurrentDayData() {
        return this.daysData[this.currentDay];
    },

    /**
     * Get accommodations for a specific day
     * @param {number} dayIndex - Day index
     * @returns {Array} Accommodations for the day
     */
    getAccommodationsForDay(dayIndex) {
        return this.accommodationsData.filter(acc =>
            dayIndex >= acc.fromDay && dayIndex <= acc.toDay
        );
    },

    /**
     * Navigate to previous day
     * @returns {boolean} True if navigation occurred
     */
    prevDay() {
        if (this.currentDay > 0) {
            this.currentDay--;
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Navigate to next day
     * @returns {boolean} True if navigation occurred
     */
    nextDay() {
        if (this.currentDay < this.daysData.length - 1) {
            this.currentDay++;
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Add a new day
     * @param {string} title - Day title
     * @returns {number} Index of new day
     */
    addDay(title) {
        this.daysData.push({ title: title.trim(), activities: [] });
        this.currentDay = this.daysData.length - 1;
        this.save();
        return this.currentDay;
    },

    /**
     * Move current day left (swap with previous)
     * @returns {boolean} True if move occurred
     */
    moveDayLeft() {
        if (this.currentDay > 0) {
            const temp = this.daysData[this.currentDay - 1];
            this.daysData[this.currentDay - 1] = this.daysData[this.currentDay];
            this.daysData[this.currentDay] = temp;
            this.currentDay--;
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Move current day right (swap with next)
     * @returns {boolean} True if move occurred
     */
    moveDayRight() {
        if (this.currentDay < this.daysData.length - 1) {
            const temp = this.daysData[this.currentDay + 1];
            this.daysData[this.currentDay + 1] = this.daysData[this.currentDay];
            this.daysData[this.currentDay] = temp;
            this.currentDay++;
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Set current view
     * @param {string} view - View name from Config.VIEWS
     */
    setView(view) {
        this.currentView = view;
    },

    /**
     * Get initial map coordinates from first activity with coordinates
     * @returns {number[]} [lat, lng] coordinates
     */
    getInitialMapCoordinates() {
        for (const day of this.daysData) {
            for (const activity of day.activities) {
                if (Utils.isValidCoordinates(activity.coordinates)) {
                    return activity.coordinates;
                }
            }
        }
        return Config.DEFAULT_COORDINATES;
    },

    /**
     * Reset all data to defaults
     * @param {Array} defaultDays - Default days
     * @param {Array} defaultAccommodations - Default accommodations
     * @param {Array} defaultShopping - Default shopping items
     */
    reset(defaultDays, defaultAccommodations, defaultShopping) {
        Storage.clearAll();
        this.init(defaultDays, defaultAccommodations, defaultShopping);
    },

    /**
     * Import days data from JSON
     * @param {Array} importedDays - Imported days array
     */
    importDays(importedDays) {
        this.daysData = importedDays;
        this.currentDay = 0;
        this.save();
    }
};

// Note: State is NOT frozen because its properties need to be mutable
