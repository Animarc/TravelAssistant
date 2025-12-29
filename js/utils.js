/**
 * Utility Functions
 * Pure functions for common operations
 */

const Utils = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {*} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    /**
     * Escape string for use in HTML attributes
     * @param {*} str - String to escape
     * @returns {string} Escaped string
     */
    escapeAttr(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Calculate Haversine distance between two coordinates
     * @param {number[]} coords1 - [lat, lng] of first point
     * @param {number[]} coords2 - [lat, lng] of second point
     * @returns {number} Distance in kilometers
     */
    haversineDistance(coords1, coords2) {
        const toRad = deg => deg * Math.PI / 180;
        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;

        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Parse and validate coordinates
     * @param {string} latStr - Latitude string
     * @param {string} lngStr - Longitude string
     * @returns {number[]|null} [lat, lng] array or null if invalid
     */
    parseCoordinates(latStr, lngStr) {
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }

        const { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } = Config.COORDINATES;
        if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) {
            return null;
        }

        return [lat, lng];
    },

    /**
     * Check if coordinates are valid
     * @param {*} coords - Coordinates to validate
     * @returns {boolean} True if valid
     */
    isValidCoordinates(coords) {
        return coords &&
               Array.isArray(coords) &&
               coords.length === 2 &&
               !isNaN(coords[0]) &&
               !isNaN(coords[1]);
    },

    /**
     * Format price with currency
     * @param {number} price - Price value
     * @param {string} currency - Currency code
     * @returns {string} Formatted price
     */
    formatPrice(price, currency = 'EUR') {
        return `${parseFloat(price || 0).toFixed(2)} ${currency}`;
    },

    /**
     * Format day range
     * @param {number} fromDay - Start day index
     * @param {number} toDay - End day index
     * @returns {string} Formatted range
     */
    formatDayRange(fromDay, toDay) {
        if (fromDay === toDay) {
            return `Día ${fromDay + 1}`;
        }
        return `Días ${fromDay + 1} - ${toDay + 1}`;
    },

    /**
     * Calculate number of nights
     * @param {number} fromDay - Start day index
     * @param {number} toDay - End day index
     * @returns {number} Number of nights
     */
    calculateNights(fromDay, toDay) {
        return toDay - fromDay + 1;
    },

    /**
     * Get activity type icon
     * @param {string} type - Activity type
     * @returns {string} Icon emoji
     */
    getActivityTypeIcon(type) {
        return Config.ACTIVITY_TYPES[type]?.icon || Config.ACTIVITY_TYPES.normal.icon;
    },

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Generate next ID from array of items with id property
     * @param {Array} items - Array of items with id
     * @returns {number} Next available ID
     */
    getNextId(items) {
        if (!items || items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    },

    /**
     * Create Google Maps directions URL
     * @param {number[]} origin - [lat, lng] origin coordinates (optional)
     * @param {number[]} destination - [lat, lng] destination coordinates
     * @param {string} travelMode - Travel mode (transit, driving, walking, bicycling)
     * @returns {string} Google Maps URL
     */
    createGoogleMapsUrl(origin, destination, travelMode = 'transit') {
        let url = 'https://www.google.com/maps/dir/?api=1';

        if (origin) {
            url += `&origin=${encodeURIComponent(origin[0])},${encodeURIComponent(origin[1])}`;
        }

        url += `&destination=${encodeURIComponent(destination[0])},${encodeURIComponent(destination[1])}`;
        url += `&travelmode=${travelMode}`;

        return url;
    }
};

Object.freeze(Utils);
