/**
 * App Module
 * Main application initialization and event binding
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Initialize state with default data from data.js
        State.init(days, accommodations, shoppingItems);

        // Initialize views
        Views.init();

        // Initialize modals
        Modals.init();

        // Initialize map
        const initialCoords = State.getInitialMapCoordinates();
        MapManager.init('map', initialCoords);

        // Bind navigation events
        this._bindNavigationEvents();

        // Bind control button events
        this._bindControlEvents();

        // Render initial view
        Views.renderDay();
    },

    /**
     * Bind day navigation events
     * @private
     */
    _bindNavigationEvents() {
        // Previous day
        document.getElementById('prevDay').addEventListener('click', () => {
            if (State.prevDay()) {
                Views.renderDay();
            }
        });

        // Next day
        document.getElementById('nextDay').addEventListener('click', () => {
            if (State.nextDay()) {
                Views.renderDay();
            }
        });

        // Move day left
        document.getElementById('moveDayLeftBtn').addEventListener('click', () => {
            if (State.moveDayLeft()) {
                Views.renderDay();
            }
        });

        // Move day right
        document.getElementById('moveDayRightBtn').addEventListener('click', () => {
            if (State.moveDayRight()) {
                Views.renderDay();
            }
        });

        // Add new day
        document.getElementById('addDayBtn').addEventListener('click', () => {
            const title = prompt('Introduce el título del nuevo día:');
            if (title && title.trim()) {
                State.addDay(title);
                Views.renderDay();
            } else if (title !== null) {
                alert('Título inválido');
            }
        });
    },

    /**
     * Bind control button events
     * @private
     */
    _bindControlEvents() {
        // View buttons
        document.getElementById('planificacionBtn').addEventListener('click', () => {
            Views.renderDay();
        });

        document.getElementById('presupuestoBtn').addEventListener('click', () => {
            Views.showBudget();
        });

        document.getElementById('objetosBtn').addEventListener('click', () => {
            Views.showObjects();
        });

        document.getElementById('accountBtn').addEventListener('click', () => {
            Views.showAccount();
        });

        // Add activity button
        document.getElementById('addActivityBtn').addEventListener('click', () => {
            Modals.openActivity();
        });

        // Add accommodation button
        document.getElementById('addAccommodationBtn').addEventListener('click', () => {
            Modals.openAccommodation();
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
