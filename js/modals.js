/**
 * Modals Module
 * Handles all modal dialogs
 */

const Modals = {
    // Modal elements
    elements: {},

    /**
     * Initialize modal elements and event listeners
     */
    init() {
        this.elements = {
            // Activity modal
            activityModal: document.getElementById('activityModal'),
            activityForm: document.getElementById('activityForm'),
            closeActivityModal: document.getElementById('closeModal'),

            // Accommodation modal
            accommodationModal: document.getElementById('accommodationModal'),
            accommodationForm: document.getElementById('accommodationForm'),
            closeAccommodationModal: document.getElementById('closeAccommodationModal'),
            fromDaySelect: document.getElementById('fromDaySelect'),
            toDaySelect: document.getElementById('toDaySelect'),

            // Shopping modal
            shoppingModal: document.getElementById('shoppingModal'),
            shoppingForm: document.getElementById('shoppingForm'),
            closeShoppingModal: document.getElementById('closeShoppingModal')
        };

        this._setupEventListeners();
    },

    /**
     * Setup all modal event listeners
     * @private
     */
    _setupEventListeners() {
        // Close buttons
        this.elements.closeActivityModal.addEventListener('click', () => this.closeActivity());
        this.elements.closeAccommodationModal.addEventListener('click', () => this.closeAccommodation());
        this.elements.closeShoppingModal.addEventListener('click', () => this.closeShopping());

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.activityModal) this.closeActivity();
            if (e.target === this.elements.accommodationModal) this.closeAccommodation();
            if (e.target === this.elements.shoppingModal) this.closeShopping();
        });

        // Optional checkbox changes time requirement
        document.getElementById('isOptionalCheckbox').addEventListener('change', function() {
            const timeInput = document.getElementById('timeInput');
            if (this.checked) {
                timeInput.required = false;
                timeInput.placeholder = "Opcional para actividades opcionales";
            } else {
                timeInput.required = true;
                timeInput.placeholder = "";
            }
        });

        // Validate toDay >= fromDay
        this.elements.fromDaySelect.addEventListener('change', () => {
            const fromDay = parseInt(this.elements.fromDaySelect.value);
            const toDay = parseInt(this.elements.toDaySelect.value);
            if (toDay < fromDay) {
                this.elements.toDaySelect.value = fromDay;
            }
        });

        // Form submissions
        this.elements.activityForm.addEventListener('submit', (e) => this._handleActivitySubmit(e));
        this.elements.accommodationForm.addEventListener('submit', (e) => this._handleAccommodationSubmit(e));
        this.elements.shoppingForm.addEventListener('submit', (e) => this._handleShoppingSubmit(e));
    },

    // ==================== ACTIVITY MODAL ====================

    /**
     * Open activity modal for adding
     */
    openActivity() {
        this.elements.activityForm.reset();
        State.editingActivity = null;
        document.getElementById('timeInput').required = true;
        document.getElementById('activityTypeSelect').value = 'normal';
        this._setActivitySubmitText('Añadir Actividad');
        this.elements.activityModal.style.display = 'block';
    },

    /**
     * Edit an existing activity
     * @param {number} dayIndex - Day index
     * @param {number} activityIndex - Activity index
     */
    editActivity(dayIndex, activityIndex) {
        const activity = Activities.get(dayIndex, activityIndex);
        if (!activity) return;

        State.editingActivity = { dayIndex, activityIndex };

        const form = this.elements.activityForm;
        form.time.value = activity.time || '';
        form.name.value = activity.name || '';
        form.description.value = activity.description || '';
        form.importantInfo.value = activity.importantInfo || '';
        form.price.value = activity.price || '';
        form.currency.value = activity.currency || 'EUR';
        form.isOptional.checked = activity.isOptional || false;
        form.activityType.value = activity.type || 'normal';
        form.lat.value = activity.coordinates ? activity.coordinates[0] : '';
        form.lng.value = activity.coordinates ? activity.coordinates[1] : '';

        const timeInput = document.getElementById('timeInput');
        if (activity.isOptional) {
            timeInput.required = false;
            timeInput.placeholder = "Opcional para actividades opcionales";
        } else {
            timeInput.required = true;
            timeInput.placeholder = "";
        }

        this._setActivitySubmitText('Actualizar Actividad');
        this.elements.activityModal.style.display = 'block';
    },

    /**
     * Close activity modal
     */
    closeActivity() {
        this.elements.activityModal.style.display = 'none';
        State.editingActivity = null;
        this._setActivitySubmitText('Añadir Actividad');
    },

    /**
     * Handle activity form submission
     * @private
     */
    _handleActivitySubmit(e) {
        e.preventDefault();

        const form = this.elements.activityForm;
        const isOptional = form.isOptional.checked;
        const time = form.time.value;
        const name = form.name.value.trim();
        const description = form.description.value.trim();

        if ((!isOptional && !time) || !name || !description) {
            alert('Por favor completa todos los campos obligatorios correctamente.');
            return;
        }

        const activityData = Activities.createFromForm({
            time,
            name,
            description,
            type: form.activityType.value || 'normal',
            importantInfo: form.importantInfo.value.trim(),
            price: form.price.value.trim(),
            currency: form.currency.value,
            isOptional,
            coordinates: Utils.parseCoordinates(form.lat.value, form.lng.value)
        });

        if (State.editingActivity) {
            Activities.update(State.editingActivity.dayIndex, State.editingActivity.activityIndex, activityData);
            State.editingActivity = null;
        } else {
            Activities.add(State.currentDay, activityData);
        }

        this.closeActivity();
        Views.refresh();
    },

    /**
     * Set activity submit button text
     * @private
     */
    _setActivitySubmitText(text) {
        const btn = this.elements.activityForm.querySelector('button[type="submit"]');
        if (btn) btn.textContent = text;
    },

    // ==================== ACCOMMODATION MODAL ====================

    /**
     * Open accommodation modal for adding
     */
    openAccommodation() {
        this.elements.accommodationForm.reset();
        State.editingAccommodation = null;
        this._populateDaySelects();
        this._setAccommodationSubmitText('Añadir Alojamiento');
        this.elements.accommodationModal.style.display = 'block';
    },

    /**
     * Edit an existing accommodation
     * @param {number} id - Accommodation ID
     */
    editAccommodation(id) {
        const accommodation = Accommodations.get(id);
        if (!accommodation) return;

        State.editingAccommodation = id;
        this._populateDaySelects();

        const form = this.elements.accommodationForm;
        form.name.value = accommodation.name || '';
        form.fromDay.value = accommodation.fromDay;
        form.toDay.value = accommodation.toDay;
        form.price.value = accommodation.price || 0;
        form.link.value = accommodation.link || '';
        form.accLat.value = accommodation.coordinates ? accommodation.coordinates[0] : '';
        form.accLng.value = accommodation.coordinates ? accommodation.coordinates[1] : '';

        this._setAccommodationSubmitText('Actualizar Alojamiento');
        this.elements.accommodationModal.style.display = 'block';
    },

    /**
     * Close accommodation modal
     */
    closeAccommodation() {
        this.elements.accommodationModal.style.display = 'none';
        State.editingAccommodation = null;
        this._setAccommodationSubmitText('Añadir Alojamiento');
    },

    /**
     * Handle accommodation form submission
     * @private
     */
    _handleAccommodationSubmit(e) {
        e.preventDefault();

        const form = this.elements.accommodationForm;
        const data = Accommodations.createFromForm({
            name: form.name.value,
            fromDay: form.fromDay.value,
            toDay: form.toDay.value,
            price: form.price.value,
            link: form.link.value,
            lat: form.accLat.value,
            lng: form.accLng.value
        });

        const validation = Accommodations.validate(data);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        if (State.editingAccommodation) {
            Accommodations.update(State.editingAccommodation, data);
            State.editingAccommodation = null;
        } else {
            Accommodations.add(data);
        }

        this.closeAccommodation();
        Views.refresh();
    },

    /**
     * Populate day select options
     * @private
     */
    _populateDaySelects() {
        const fromSelect = this.elements.fromDaySelect;
        const toSelect = this.elements.toDaySelect;

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        State.daysData.forEach((day, index) => {
            const optionFrom = document.createElement('option');
            optionFrom.value = index;
            optionFrom.textContent = `Día ${index + 1}: ${day.title}`;
            fromSelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = index;
            optionTo.textContent = `Día ${index + 1}: ${day.title}`;
            toSelect.appendChild(optionTo);
        });

        fromSelect.value = State.currentDay;
        toSelect.value = State.currentDay;
    },

    /**
     * Set accommodation submit button text
     * @private
     */
    _setAccommodationSubmitText(text) {
        const btn = this.elements.accommodationForm.querySelector('button[type="submit"]');
        if (btn) btn.textContent = text;
    },

    // ==================== SHOPPING MODAL ====================

    /**
     * Open shopping modal for adding
     */
    openShopping() {
        this.elements.shoppingForm.reset();
        State.editingShoppingItem = null;
        document.getElementById('shoppingCategory').value = 'otros';
        document.getElementById('shoppingCurrency').value = 'EUR';
        this._setShoppingSubmitText('Añadir');
        this.elements.shoppingModal.style.display = 'block';
    },

    /**
     * Edit an existing shopping item
     * @param {number} id - Shopping item ID
     */
    editShopping(id) {
        const item = Shopping.get(id);
        if (!item) return;

        State.editingShoppingItem = id;

        document.getElementById('shoppingName').value = item.name;
        document.getElementById('shoppingCategory').value = item.category || 'otros';
        document.getElementById('shoppingPrice').value = item.price || '';
        document.getElementById('shoppingCurrency').value = item.currency || 'EUR';
        document.getElementById('shoppingLink').value = item.link || '';

        this._setShoppingSubmitText('Actualizar');
        this.elements.shoppingModal.style.display = 'block';
    },

    /**
     * Close shopping modal
     */
    closeShopping() {
        this.elements.shoppingModal.style.display = 'none';
        State.editingShoppingItem = null;
    },

    /**
     * Handle shopping form submission
     * @private
     */
    _handleShoppingSubmit(e) {
        e.preventDefault();

        const data = Shopping.createFromForm({
            name: document.getElementById('shoppingName').value,
            category: document.getElementById('shoppingCategory').value,
            price: document.getElementById('shoppingPrice').value,
            currency: document.getElementById('shoppingCurrency').value,
            link: document.getElementById('shoppingLink').value
        });

        const validation = Shopping.validate(data);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        if (State.editingShoppingItem) {
            Shopping.update(State.editingShoppingItem, data);
            State.editingShoppingItem = null;
        } else {
            Shopping.add(data);
        }

        this.closeShopping();
        Views.showBudget();
    },

    /**
     * Set shopping submit button text
     * @private
     */
    _setShoppingSubmitText(text) {
        const btn = this.elements.shoppingForm.querySelector('button[type="submit"]');
        if (btn) btn.textContent = text;
    }
};
