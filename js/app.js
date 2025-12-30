/**
 * App Module
 * Main application initialization and event binding
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Load saved language
        I18n.loadSavedLanguage();

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

        // Update UI with current language
        I18n.updateUI();

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
            const title = prompt(I18n.t('enterDayTitle'));
            if (title && title.trim()) {
                State.addDay(title);
                Views.renderDay();
            } else if (title !== null) {
                alert(I18n.t('invalidTitle'));
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

        // Language button
        document.getElementById('languageBtn').addEventListener('click', () => {
            this._showLanguageSelector();
        });

        // Add activity button
        document.getElementById('addActivityBtn').addEventListener('click', () => {
            Modals.openActivity();
        });

        // Add accommodation button
        document.getElementById('addAccommodationBtn').addEventListener('click', () => {
            Modals.openAccommodation();
        });
    },

    /**
     * Show language selector dialog
     * @private
     */
    _showLanguageSelector() {
        const languages = I18n.getAvailableLanguages();
        const currentLang = I18n.currentLang;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'languageModal';
        modal.style.display = 'block';

        const content = document.createElement('div');
        content.className = 'modal-content language-modal-content';

        let html = `
            <span class="close" id="closeLanguageModal">&times;</span>
            <h2>${I18n.t('language')}</h2>
            <div class="language-list">
        `;

        languages.forEach(lang => {
            const isActive = lang.code === currentLang ? 'active' : '';
            html += `
                <button class="language-option ${isActive}" data-lang="${lang.code}">
                    ${lang.name}
                </button>
            `;
        });

        html += '</div>';
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('closeLanguageModal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelectorAll('.language-option').forEach(btn => {
            btn.addEventListener('click', () => {
                I18n.setLanguage(btn.dataset.lang);
                modal.remove();
            });
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
