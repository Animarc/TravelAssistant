/**
 * Application Configuration
 * Central place for all constants and configuration values
 */

const Config = {
    // Storage keys
    STORAGE_KEYS: {
        TRIP_NAME: 'travelAssistantTripName',
        DAYS: 'travelAssistantData',
        ACCOMMODATIONS: 'travelAssistantAccommodations',
        SHOPPING: 'travelAssistantShoppingItems',
        CURRENT_DAY: 'travelAssistantCurrentDay'
    },

    // Default coordinates (Barcelona)
    DEFAULT_COORDINATES: [41.3851, 2.1734],

    // Map configuration
    MAP: {
        DEFAULT_ZOOM: 13,
        DETAIL_ZOOM: 15,
        TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '&copy; OpenStreetMap contributors'
    },

    // Distance thresholds for transfers (in km)
    TRANSFER: {
        MIN_DISTANCE: 0.2,
        MAX_DISTANCE: 100
    },

    // Activity types with their icons and colors
    ACTIVITY_TYPES: {
        vuelo: { icon: '✈️', name: 'Vuelo' },
        transporte: { icon: '🚆', name: 'Transporte' },
        comida: { icon: '🍽️', name: 'Comida' },
        visita: { icon: '🏛️', name: 'Visita' },
        normal: { icon: '📌', name: 'Normal' }
    },

    // Shopping categories
    SHOPPING_CATEGORIES: {
        transporte: { icon: '🚆', name: 'Transporte' },
        entradas: { icon: '🎟️', name: 'Entradas' },
        electronica: { icon: '📱', name: 'Electrónica' },
        documentos: { icon: '📄', name: 'Documentos' },
        otros: { icon: '📦', name: 'Otros' }
    },

    // View types
    VIEWS: {
        PLANNING: 'planning',
        BUDGET: 'budget',
        OBJECTS: 'objects',
        ACCOUNT: 'account'
    },

    // Validation
    COORDINATES: {
        LAT_MIN: -90,
        LAT_MAX: 90,
        LNG_MIN: -180,
        LNG_MAX: 180
    }
};

// Freeze to prevent modifications
Object.freeze(Config);
Object.freeze(Config.STORAGE_KEYS);
Object.freeze(Config.MAP);
Object.freeze(Config.TRANSFER);
Object.freeze(Config.ACTIVITY_TYPES);
Object.freeze(Config.SHOPPING_CATEGORIES);
Object.freeze(Config.VIEWS);
Object.freeze(Config.COORDINATES);
