/**
 * Views Module
 * Handles rendering of all application views
 */

const Views = {
    // DOM element references
    elements: {},

    /**
     * Initialize view elements
     */
    init() {
        this.elements = {
            dayTitle: document.getElementById('dayTitle'),
            activityList: document.getElementById('activityList'),
            pageTitle: document.getElementById('pageTitle'),
            accommodationContainer: document.getElementById('accommodationContainer'),
            toolbar: document.querySelector('.toolbar'),
            rightPanel: document.querySelector('.right-panel'),
            dayHeader: document.querySelector('.day-header'),
            leftPanel: document.querySelector('.left-panel'),
            container: document.querySelector('.container'),
            navButtons: document.querySelectorAll('.nav-btn')
        };
    },

    /**
     * Refresh current view based on state
     */
    refresh() {
        switch (State.currentView) {
            case Config.VIEWS.BUDGET:
                this.showBudget();
                break;
            case Config.VIEWS.OBJECTS:
                this.showObjects();
                break;
            case Config.VIEWS.ACCOUNT:
                this.showAccount();
                break;
            case Config.VIEWS.PLANNING:
            default:
                this.renderDay();
                break;
        }
    },

    /**
     * Show planning view elements
     */
    showPlanningElements() {
        this.elements.toolbar.style.display = 'flex';
        this.elements.rightPanel.style.display = 'block';
        this.elements.dayHeader.style.display = 'flex';
        this.elements.accommodationContainer.style.display = 'block';
        this.elements.activityList.className = 'activity-list';
        this.elements.container.classList.remove('centered-view');
        this._setActiveNavButton('planificacionBtn');
    },

    /**
     * Hide planning view elements
     */
    hidePlanningElements() {
        this.elements.toolbar.style.display = 'none';
        this.elements.rightPanel.style.display = 'none';
        this.elements.dayHeader.style.display = 'none';
        this.elements.accommodationContainer.style.display = 'none';
        this.elements.container.classList.add('centered-view');
    },

    /**
     * Set active navigation button
     * @param {string} buttonId - ID of the button to activate
     */
    _setActiveNavButton(buttonId) {
        this.elements.navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(buttonId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    /**
     * Render the current day (planning view)
     */
    renderDay() {
        State.setView(Config.VIEWS.PLANNING);
        this.showPlanningElements();

        const day = State.getCurrentDayData();
        this.elements.dayTitle.textContent = `${I18n.t('day')} ${State.currentDay + 1}: ${day.title}`;

        // Update page title and trip name
        const tripNameValue = State.tripName || I18n.t('appTitle');
        this.elements.pageTitle.textContent = tripNameValue;
        const tripNameEl = document.getElementById('tripName');
        if (tripNameEl) tripNameEl.textContent = tripNameValue;

        this.elements.activityList.innerHTML = '';
        MapManager.clearAll();

        // Add accommodation marker
        const dayAccommodations = State.getAccommodationsForDay(State.currentDay);
        if (dayAccommodations.length > 0) {
            const acc = dayAccommodations[0];
            if (Utils.isValidCoordinates(acc.coordinates)) {
                MapManager.addAccommodationMarker(acc.coordinates, acc.name);
            }
        }

        // Separate and render activities
        const { mandatory, optional } = Activities.separateByOptional(day.activities);
        this._renderActivityList(mandatory, false);
        this._renderActivityList(optional, true);

        // Render accommodation section
        this._renderAccommodationSection(State.currentDay);

        // Center map on first activity with coordinates
        const firstWithCoords = day.activities.find(a => Utils.isValidCoordinates(a.coordinates));
        if (firstWithCoords) {
            MapManager.addActivityMarker(firstWithCoords.coordinates, false);
            MapManager.setView(firstWithCoords.coordinates);
        }
    },

    /**
     * Render a list of activities
     * @private
     */
    _renderActivityList(activities, isOptional) {
        if (activities.length === 0) return;

        if (isOptional) {
            const header = document.createElement('li');
            header.className = 'optional-activities-header';
            header.innerHTML = `<h3>${I18n.t('optionalActivities')}</h3>`;
            this.elements.activityList.appendChild(header);
        }

        const activitiesWithTransfers = Activities.generateWithTransfers(activities);

        activitiesWithTransfers.forEach(act => {
            const li = document.createElement('li');
            let classNames = ['activity-item'];

            if (isOptional) classNames.push('optional-activity');

            if (act.isTransfer) {
                classNames.push('transfer-item');
                li.className = classNames.join(' ');
                li.innerHTML = this._createTransferHTML(act);
                this._attachTransferListeners(li, act);
            } else {
                classNames.push(`activity-type-${act.type || 'normal'}`);
                if (act.isDone) classNames.push('activity-done');
                li.className = classNames.join(' ');
                li.innerHTML = this._createActivityHTML(act, isOptional);
                this._attachActivityListeners(li, act);
            }

            this.elements.activityList.appendChild(li);
        });
    },

    /**
     * Create transfer HTML
     * @private
     */
    _createTransferHTML(transfer) {
        return `
            <em>${I18n.t('autoTransfer')}:</em> ${I18n.t('from')} <strong>${Utils.sanitizeHTML(transfer.from)}</strong> ${I18n.t('to')} <strong>${Utils.sanitizeHTML(transfer.to)}</strong> (${Utils.sanitizeHTML(transfer.distance)} km)<br>
            <button class="open-gmaps-btn" style="margin-top:5px;">${I18n.t('openGoogleMaps')}</button>
        `;
    },

    /**
     * Create activity HTML
     * @private
     */
    _createActivityHTML(activity, isOptional) {
        const activityIndex = activity.originalIndex;
        return `
            <div class="activity-header ${activity.isDone ? 'activity-done' : ''}">
                <div class="activity-checkbox-container">
                    <input type="checkbox" class="activity-checkbox" ${activity.isDone ? 'checked' : ''} data-day="${State.currentDay}" data-activity="${activityIndex}">
                </div>
                <div class="activity-info" data-day="${State.currentDay}" data-activity="${activityIndex}">
                    <strong>${Utils.sanitizeHTML(activity.time) || I18n.t('noTime')}</strong> - ${Utils.sanitizeHTML(activity.name)}${isOptional ? ` <span class="optional-badge">${I18n.t('optionalBadge')}</span>` : ''}
                </div>
                <div class="activity-actions">
                    <button class="edit-activity-btn" data-day="${State.currentDay}" data-activity="${activityIndex}">✏️</button>
                    <button class="delete-activity-btn" data-day="${State.currentDay}" data-activity="${activityIndex}">🗑️</button>
                </div>
            </div>
            <div class="activity-details" id="details-${State.currentDay}-${activityIndex}" style="display:none;">
                <p>${Utils.sanitizeHTML(activity.description)}</p>
                ${activity.importantInfo ? `<p class="important-info">${Utils.sanitizeHTML(activity.importantInfo)}</p>` : ''}
                ${activity.price ? `<p class="price-info"><strong>${I18n.t('price')}:</strong> ${Utils.sanitizeHTML(activity.price)} ${Utils.sanitizeHTML(activity.currency) || 'EUR'}</p>` : ''}
            </div>
        `;
    },

    /**
     * Attach transfer event listeners
     * @private
     */
    _attachTransferListeners(li, transfer) {
        const gmapsBtn = li.querySelector('.open-gmaps-btn');
        gmapsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const [from, to] = transfer.coordinates;
            const url = Utils.createGoogleMapsUrl(from, to, 'transit');
            window.open(url, '_blank');
        });

        li.addEventListener('click', () => {
            MapManager.showTransferRoute(transfer.coordinates);
        });
    },

    /**
     * Attach activity event listeners
     * @private
     */
    _attachActivityListeners(li, activity) {
        const activityIndex = activity.originalIndex;

        li.querySelector('.edit-activity-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            Modals.editActivity(State.currentDay, activityIndex);
        });

        li.querySelector('.delete-activity-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(I18n.t('confirmDeleteActivity'))) {
                Activities.delete(State.currentDay, activityIndex);
                this.refresh();
            }
        });

        li.querySelector('.activity-checkbox').addEventListener('change', (e) => {
            e.stopPropagation();
            Activities.toggleDone(State.currentDay, activityIndex);
            this.refresh();
        });

        li.querySelector('.activity-info').addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all details
            [...this.elements.activityList.querySelectorAll('.activity-details')].forEach(d => d.style.display = 'none');

            // Toggle current
            const detailEl = document.getElementById(`details-${State.currentDay}-${activityIndex}`);
            if (detailEl) {
                detailEl.style.display = detailEl.style.display === 'block' ? 'none' : 'block';
            }

            // Update map
            if (Utils.isValidCoordinates(activity.coordinates)) {
                MapManager.addActivityMarker(activity.coordinates);
            }
        });
    },

    /**
     * Render accommodation section
     * @private
     */
    _renderAccommodationSection(dayIndex) {
        const dayAccommodations = Accommodations.getForDay(dayIndex);
        const container = this.elements.accommodationContainer;
        container.innerHTML = '';

        const section = document.createElement('div');
        section.className = 'accommodation-section';

        let html = `<div class="accommodation-header"><h3>${I18n.t('whereWeSleep')}</h3></div>`;

        if (dayAccommodations.length === 0) {
            html += `<div class="accommodation-content"><p class="no-accommodation">${I18n.t('noAccommodation')}</p></div>`;
        } else {
            html += '<div class="accommodation-content">';
            dayAccommodations.forEach(acc => {
                const daysRange = Utils.formatDayRange(acc.fromDay, acc.toDay);
                const hasCoords = Utils.isValidCoordinates(acc.coordinates);

                html += `
                    <div class="accommodation-item" data-id="${acc.id}">
                        <div class="accommodation-info">
                            <strong class="accommodation-name">${Utils.sanitizeHTML(acc.name)}</strong>
                            <span class="accommodation-days">${Utils.sanitizeHTML(daysRange)}</span>
                            ${acc.link ? `<a href="${Utils.escapeAttr(acc.link)}" target="_blank" class="accommodation-link">${I18n.t('seeReservation')}</a>` : ''}
                            ${hasCoords ? `<button class="accommodation-gmaps-btn" data-lat="${acc.coordinates[0]}" data-lng="${acc.coordinates[1]}">${I18n.t('goWithMaps')}</button>` : ''}
                        </div>
                        <div class="accommodation-actions">
                            <button class="edit-accommodation-btn" data-id="${acc.id}">✏️</button>
                            <button class="delete-accommodation-btn" data-id="${acc.id}">🗑️</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        section.innerHTML = html;
        container.appendChild(section);

        // Attach event listeners
        section.querySelectorAll('.edit-accommodation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                Modals.editAccommodation(parseInt(btn.dataset.id));
            });
        });

        section.querySelectorAll('.delete-accommodation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(I18n.t('confirmDeleteAccommodation'))) {
                    Accommodations.delete(parseInt(btn.dataset.id));
                    this.refresh();
                }
            });
        });

        section.querySelectorAll('.accommodation-gmaps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const coords = [parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lng)];
                const url = Utils.createGoogleMapsUrl(null, coords, 'transit');
                window.open(url, '_blank');
            });
        });
    },

    /**
     * Show budget view
     */
    showBudget() {
        State.setView(Config.VIEWS.BUDGET);
        this.hidePlanningElements();
        this._setActiveNavButton('presupuestoBtn');
        this.elements.activityList.innerHTML = '';
        this.elements.activityList.className = 'activity-list budget-list';

        const grandTotals = {};
        const activityTotals = {};
        const accommodationTotals = {};
        const shoppingTotals = {};

        // Activities section
        this._renderBudgetActivities(activityTotals, grandTotals);

        // Accommodations section
        this._renderBudgetAccommodations(accommodationTotals, grandTotals);

        // Shopping section
        this._renderBudgetShopping(shoppingTotals, grandTotals);

        // Summary
        this._renderBudgetSummary(activityTotals, accommodationTotals, shoppingTotals, grandTotals);

        // Setup toggles
        this._setupBudgetToggles();
    },

    /**
     * Render budget activities section
     * @private
     */
    _renderBudgetActivities(activityTotals, grandTotals) {
        const section = document.createElement('li');
        section.className = 'budget-section';
        section.innerHTML = `
            <div class="budget-section-header">
                <h3>🎯 ${I18n.t('activities')}</h3>
                <span class="budget-section-toggle">▼</span>
            </div>
            <div class="budget-section-content" id="activitiesContent"></div>
        `;
        this.elements.activityList.appendChild(section);

        const content = section.querySelector('#activitiesContent');
        const activitiesWithPrices = Activities.getWithPrices();

        activitiesWithPrices.forEach(({ dayIndex, dayTitle, activities }) => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'budget-day-header';
            dayHeader.innerHTML = `<h4>Día ${dayIndex + 1}: ${Utils.sanitizeHTML(dayTitle)}</h4>`;
            content.appendChild(dayHeader);

            activities.forEach(({ activity, originalIndex }) => {
                const currency = activity.currency || 'EUR';
                const price = parseFloat(activity.price) || 0;

                activityTotals[currency] = (activityTotals[currency] || 0) + price;
                grandTotals[currency] = (grandTotals[currency] || 0) + price;

                const item = document.createElement('div');
                item.className = 'budget-item';
                item.innerHTML = `
                    <div class="budget-activity">
                        <div class="budget-activity-info">
                            <span class="budget-type-icon">${Utils.getActivityTypeIcon(activity.type)}</span>
                            <span>${Utils.sanitizeHTML(activity.name)}</span>
                        </div>
                        <div class="budget-activity-actions">
                            <span class="budget-price">${price.toFixed(2)} ${Utils.sanitizeHTML(currency)}</span>
                            <button class="edit-activity-btn" data-day="${dayIndex}" data-activity="${originalIndex}">✏️</button>
                        </div>
                    </div>
                `;

                item.querySelector('.edit-activity-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    Modals.editActivity(dayIndex, originalIndex);
                });

                content.appendChild(item);
            });
        });

        // Subtotal
        const subtotal = document.createElement('div');
        subtotal.className = 'budget-subtotal';
        const totalsStr = this._formatTotals(activityTotals);
        subtotal.innerHTML = `<strong>${I18n.t('subtotalActivities')}:</strong> ${totalsStr}`;
        content.appendChild(subtotal);
    },

    /**
     * Render budget accommodations section
     * @private
     */
    _renderBudgetAccommodations(accommodationTotals, grandTotals) {
        const section = document.createElement('li');
        section.className = 'budget-section';
        section.innerHTML = `
            <div class="budget-section-header accommodation-header-color">
                <h3>🏨 ${I18n.t('accommodations')}</h3>
                <span class="budget-section-toggle">▼</span>
            </div>
            <div class="budget-section-content" id="accommodationsContent"></div>
        `;
        this.elements.activityList.appendChild(section);

        const content = section.querySelector('#accommodationsContent');

        State.accommodationsData.forEach(acc => {
            const currency = 'EUR';
            const price = parseFloat(acc.price) || 0;

            accommodationTotals[currency] = (accommodationTotals[currency] || 0) + price;
            grandTotals[currency] = (grandTotals[currency] || 0) + price;

            const daysRange = Utils.formatDayRange(acc.fromDay, acc.toDay);
            const nights = Utils.calculateNights(acc.fromDay, acc.toDay);

            const item = document.createElement('div');
            item.className = 'budget-item';
            item.innerHTML = `
                <div class="budget-activity">
                    <div class="budget-activity-info">
                        <span class="budget-acc-name">${Utils.sanitizeHTML(acc.name)}</span>
                        <span class="budget-acc-days">${daysRange} (${nights} ${nights > 1 ? I18n.t('nights') : I18n.t('night')})</span>
                    </div>
                    <div class="budget-activity-actions">
                        <span class="budget-price accommodation-price">${price.toFixed(2)} ${currency}</span>
                        <button class="edit-accommodation-btn" data-id="${acc.id}">✏️</button>
                    </div>
                </div>
            `;

            item.querySelector('.edit-accommodation-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                Modals.editAccommodation(acc.id);
            });

            content.appendChild(item);
        });

        // Subtotal
        const subtotal = document.createElement('div');
        subtotal.className = 'budget-subtotal';
        subtotal.innerHTML = `<strong>${I18n.t('subtotalAccommodations')}:</strong> ${this._formatTotals(accommodationTotals)}`;
        content.appendChild(subtotal);
    },

    /**
     * Render budget shopping section
     * @private
     */
    _renderBudgetShopping(shoppingTotals, grandTotals) {
        const section = document.createElement('li');
        section.className = 'budget-section';
        section.innerHTML = `
            <div class="budget-section-header shopping-header-color">
                <h3>🛒 ${I18n.t('shoppingAndReservations')}</h3>
                <span class="budget-section-toggle">▼</span>
            </div>
            <div class="budget-section-content" id="shoppingContent"></div>
        `;
        this.elements.activityList.appendChild(section);

        const content = section.querySelector('#shoppingContent');
        const categories = Shopping.getByCategory();

        Object.entries(categories).forEach(([key, cat]) => {
            if (cat.items.length === 0) return;

            const catHeader = document.createElement('div');
            catHeader.className = 'budget-category-header';
            catHeader.innerHTML = `<h4>${cat.icon} ${cat.name}</h4>`;
            content.appendChild(catHeader);

            cat.items.forEach(item => {
                const currency = item.currency || 'EUR';
                const price = parseFloat(item.price) || 0;

                shoppingTotals[currency] = (shoppingTotals[currency] || 0) + price;
                grandTotals[currency] = (grandTotals[currency] || 0) + price;

                const itemDiv = document.createElement('div');
                itemDiv.className = `budget-item ${item.purchased ? 'purchased' : ''}`;
                itemDiv.innerHTML = `
                    <div class="budget-activity">
                        <div class="budget-activity-info">
                            <input type="checkbox" class="shopping-checkbox" data-id="${item.id}" ${item.purchased ? 'checked' : ''}>
                            <span class="${item.purchased ? 'purchased-text' : ''}">${Utils.sanitizeHTML(item.name)}</span>
                            ${item.link ? `<a href="${Utils.escapeAttr(item.link)}" target="_blank" class="shopping-link">🔗</a>` : ''}
                        </div>
                        <div class="budget-activity-actions">
                            <span class="budget-price shopping-price">${price.toFixed(2)} ${currency}</span>
                            <button class="edit-shopping-btn" data-id="${item.id}">✏️</button>
                            <button class="delete-shopping-btn" data-id="${item.id}">🗑️</button>
                        </div>
                    </div>
                `;

                itemDiv.querySelector('.shopping-checkbox').addEventListener('change', () => {
                    Shopping.togglePurchased(item.id);
                    this.showBudget();
                });

                itemDiv.querySelector('.edit-shopping-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    Modals.editShopping(item.id);
                });

                itemDiv.querySelector('.delete-shopping-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(I18n.t('confirmDeleteShopping'))) {
                        Shopping.delete(item.id);
                        this.showBudget();
                    }
                });

                content.appendChild(itemDiv);
            });
        });

        // Add shopping button
        const addBtn = document.createElement('button');
        addBtn.className = 'add-shopping-btn';
        addBtn.innerHTML = I18n.t('addPurchaseBtn');
        addBtn.addEventListener('click', () => Modals.openShopping());
        content.appendChild(addBtn);

        // Subtotal
        const subtotal = document.createElement('div');
        subtotal.className = 'budget-subtotal';
        subtotal.innerHTML = `<strong>${I18n.t('subtotalShopping')}:</strong> ${this._formatTotals(shoppingTotals)}`;
        content.appendChild(subtotal);
    },

    /**
     * Render budget summary
     * @private
     */
    _renderBudgetSummary(activityTotals, accommodationTotals, shoppingTotals, grandTotals) {
        const summary = document.createElement('li');
        summary.className = 'budget-grand-summary';

        const grandTotalsStr = Object.entries(grandTotals)
            .map(([cur, total]) => `<span class="grand-total-amount">${total.toFixed(2)} ${cur}</span>`)
            .join(' + ');

        const stats = Shopping.getStats();

        summary.innerHTML = `
            <div class="budget-grand-total">
                <h3>💰 ${I18n.t('totalBudget')}</h3>
                <div class="grand-total-breakdown">
                    <div class="breakdown-row">
                        <span>🎯 ${I18n.t('activities')}:</span>
                        <span>${this._formatTotals(activityTotals)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>🏨 ${I18n.t('accommodations')}:</span>
                        <span>${this._formatTotals(accommodationTotals)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>🛒 ${I18n.t('shoppingAndReservations')}:</span>
                        <span>${this._formatTotals(shoppingTotals)}</span>
                    </div>
                    <div class="breakdown-divider"></div>
                    <div class="breakdown-row total-row">
                        <span><strong>${I18n.t('total')}:</strong></span>
                        <span>${grandTotalsStr || '0.00 EUR'}</span>
                    </div>
                </div>
                <div class="shopping-status">
                    <span class="status-purchased">✅ ${stats.purchased} ${stats.purchased !== 1 ? I18n.t('purchasedPlural') : I18n.t('purchased')}</span>
                    <span class="status-pending">⏳ ${stats.pending} ${stats.pending !== 1 ? I18n.t('pendingPlural') : I18n.t('pending')}</span>
                </div>
            </div>
        `;

        this.elements.activityList.appendChild(summary);
    },

    /**
     * Format totals object to string
     * @private
     */
    _formatTotals(totals) {
        const entries = Object.entries(totals);
        if (entries.length === 0) return '0.00 EUR';
        return entries.map(([cur, total]) => `${total.toFixed(2)} ${cur}`).join(' + ');
    },

    /**
     * Setup budget section toggles
     * @private
     */
    _setupBudgetToggles() {
        document.querySelectorAll('.budget-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                const content = section.querySelector('.budget-section-content');
                const toggle = header.querySelector('.budget-section-toggle');

                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });
    },

    /**
     * Show objects view
     */
    showObjects() {
        State.setView(Config.VIEWS.OBJECTS);
        this.hidePlanningElements();
        this._setActiveNavButton('objetosBtn');
        this.elements.activityList.innerHTML = '';
        this.elements.activityList.className = 'activity-list objects-list';

        const header = document.createElement('li');
        header.className = 'objects-header';
        header.innerHTML = `<h3>${I18n.t('objectsListTitle')}</h3>`;
        this.elements.activityList.appendChild(header);

        const content = document.createElement('li');
        content.className = 'objects-content';
        content.innerHTML = this._getObjectsListHTML();
        this.elements.activityList.appendChild(content);
    },

    /**
     * Get objects list HTML
     * @private
     */
    _getObjectsListHTML() {
        return `
            <div class="objects-section">
                <h4>📱 ${I18n.t('electronics')}</h4>
                <ul>
                    <li>☐ ${I18n.t('phoneCharger')}</li>
                    <li>☐ ${I18n.t('powerBank')}</li>
                    <li>☐ ${I18n.t('powerAdapter')}</li>
                    <li>☐ ${I18n.t('headphones')}</li>
                    <li>☐ ${I18n.t('camera')}</li>
                </ul>
            </div>
            <div class="objects-section">
                <h4>👕 ${I18n.t('clothing')}</h4>
                <ul>
                    <li>☐ ${I18n.t('underwear')}</li>
                    <li>☐ ${I18n.t('socks')}</li>
                    <li>☐ ${I18n.t('tshirts')}</li>
                    <li>☐ ${I18n.t('pants')}</li>
                    <li>☐ ${I18n.t('jacket')}</li>
                    <li>☐ ${I18n.t('pajamas')}</li>
                </ul>
            </div>
            <div class="objects-section">
                <h4>🧴 ${I18n.t('hygiene')}</h4>
                <ul>
                    <li>☐ ${I18n.t('toothbrush')}</li>
                    <li>☐ ${I18n.t('toothpaste')}</li>
                    <li>☐ ${I18n.t('shampoo')}</li>
                    <li>☐ ${I18n.t('soap')}</li>
                    <li>☐ ${I18n.t('deodorant')}</li>
                    <li>☐ ${I18n.t('towels')}</li>
                </ul>
            </div>
            <div class="objects-section">
                <h4>📄 ${I18n.t('documents')}</h4>
                <ul>
                    <li>☐ ${I18n.t('passportId')}</li>
                    <li>☐ ${I18n.t('flightTickets')}</li>
                    <li>☐ ${I18n.t('hotelReservations')}</li>
                    <li>☐ ${I18n.t('travelInsurance')}</li>
                    <li>☐ ${I18n.t('cash')}</li>
                    <li>☐ ${I18n.t('creditCards')}</li>
                </ul>
            </div>
            <div class="objects-section">
                <h4>🎒 ${I18n.t('other')}</h4>
                <ul>
                    <li>☐ ${I18n.t('backpack')}</li>
                    <li>☐ ${I18n.t('waterBottle')}</li>
                    <li>☐ ${I18n.t('medications')}</li>
                    <li>☐ ${I18n.t('sunscreen')}</li>
                    <li>☐ ${I18n.t('sunglasses')}</li>
                    <li>☐ ${I18n.t('book')}</li>
                </ul>
            </div>
        `;
    },

    /**
     * Show account view
     */
    showAccount() {
        State.setView(Config.VIEWS.ACCOUNT);
        this.hidePlanningElements();
        this.elements.activityList.innerHTML = '';
        this.elements.activityList.className = 'activity-list account-list';

        // Login section
        this._renderAccountLogin();

        // My travels section
        this._renderAccountTravels();

        // Find travels section
        this._renderAccountSearch();

        // Tools section
        this._renderAccountTools();

        // Setup event listeners
        this._setupAccountListeners();
    },

    /**
     * Render account login section
     * @private
     */
    _renderAccountLogin() {
        const section = document.createElement('li');
        section.className = 'account-section';
        section.innerHTML = `
            <div class="account-header">
                <h3>🔐 ${I18n.t('login')}</h3>
            </div>
            <div class="login-content">
                <div class="login-status" id="loginStatus">
                    <p>${I18n.t('notLoggedIn')}</p>
                    <button id="googleLoginBtn" class="google-login-btn">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="google-icon">
                        ${I18n.t('loginWithGoogle')}
                    </button>
                </div>
            </div>
        `;
        this.elements.activityList.appendChild(section);
    },

    /**
     * Render account travels section
     * @private
     */
    _renderAccountTravels() {
        const section = document.createElement('li');
        section.className = 'account-section';
        section.innerHTML = `
            <div class="account-header">
                <h3>✈️ ${I18n.t('myTrips')}</h3>
            </div>
            <div class="my-travels-content">
                <div class="travel-item">
                    <h4>🇯🇵 Viaje a Japón - Julio 2024</h4>
                    <p>25 ${I18n.t('days')} • 27 ${I18n.t('activitiesCount')} • ${I18n.t('budgetLabel')}: €2,500</p>
                    <div class="travel-actions">
                        <button class="travel-btn primary">${I18n.t('open')}</button>
                        <button class="travel-btn secondary">${I18n.t('share')}</button>
                        <button class="travel-btn danger">${I18n.t('delete')}</button>
                    </div>
                </div>
                <button id="createNewTravelBtn" class="create-travel-btn">
                    ➕ ${I18n.t('createNewTrip')}
                </button>
            </div>
        `;
        this.elements.activityList.appendChild(section);
    },

    /**
     * Render account search section
     * @private
     */
    _renderAccountSearch() {
        const section = document.createElement('li');
        section.className = 'account-section';
        section.innerHTML = `
            <div class="account-header">
                <h3>🔍 ${I18n.t('searchTrips')}</h3>
            </div>
            <div class="find-travels-content">
                <div class="search-box">
                    <input type="text" id="travelSearchInput" placeholder="${I18n.t('searchPlaceholder')}">
                    <button id="searchTravelsBtn">🔍</button>
                </div>
                <div class="search-filters">
                    <select id="durationFilter">
                        <option value="">${I18n.t('anyDuration')}</option>
                        <option value="1-3">1-3 ${I18n.t('days')}</option>
                        <option value="4-7">4-7 ${I18n.t('days')}</option>
                        <option value="8-14">8-14 ${I18n.t('days')}</option>
                        <option value="15+">15+ ${I18n.t('days')}</option>
                    </select>
                    <select id="budgetFilter">
                        <option value="">${I18n.t('anyBudget')}</option>
                        <option value="0-500">€0-500</option>
                        <option value="500-1000">€500-1,000</option>
                        <option value="1000-2000">€1,000-2,000</option>
                        <option value="2000+">€2,000+</option>
                    </select>
                </div>
                <div class="search-results" id="searchResults">
                    <p class="search-placeholder">${I18n.t('searchSharedTrips')}</p>
                </div>
            </div>
        `;
        this.elements.activityList.appendChild(section);
    },

    /**
     * Render account tools section
     * @private
     */
    _renderAccountTools() {
        const section = document.createElement('li');
        section.className = 'account-section';
        section.innerHTML = `
            <div class="account-header">
                <h3>⚙️ ${I18n.t('tools')}</h3>
            </div>
            <div class="tools-content">
                <button id="exportJsonBtn" class="tool-btn">
                    📤 ${I18n.t('exportJson')}
                </button>
                <button id="importJsonBtn" class="tool-btn">
                    📥 ${I18n.t('importJson')}
                </button>
                <input type="file" id="jsonFileInput" accept=".json" style="display: none;">
            </div>
        `;
        this.elements.activityList.appendChild(section);
    },

    /**
     * Setup account view event listeners
     * @private
     */
    _setupAccountListeners() {
        // Google Login
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this._handleGoogleLogin());
        }

        // Export JSON
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => {
                const jsonStr = JSON.stringify(State.daysData, null, 2);
                prompt(I18n.t('copyJson'), jsonStr);
            });
        }

        // Import JSON
        const importJsonBtn = document.getElementById('importJsonBtn');
        const jsonFileInput = document.getElementById('jsonFileInput');
        if (importJsonBtn && jsonFileInput) {
            importJsonBtn.addEventListener('click', () => jsonFileInput.click());
            jsonFileInput.addEventListener('change', (e) => this._handleImportJson(e));
        }

        // Create new travel
        const createNewTravelBtn = document.getElementById('createNewTravelBtn');
        if (createNewTravelBtn) {
            createNewTravelBtn.addEventListener('click', () => {
                const title = prompt(I18n.t('enterTripTitle'));
                if (title && title.trim()) {
                    State.daysData = [{ title: title.trim(), activities: [] }];
                    State.currentDay = 0;
                    State.save();
                    this.renderDay();
                }
            });
        }

        // Search travels
        const searchTravelsBtn = document.getElementById('searchTravelsBtn');
        const travelSearchInput = document.getElementById('travelSearchInput');
        if (searchTravelsBtn && travelSearchInput) {
            searchTravelsBtn.addEventListener('click', () => this._handleSearchTravels());
            travelSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this._handleSearchTravels();
            });
        }
    },

    /**
     * Handle Google login
     * @private
     */
    _handleGoogleLogin() {
        const loginStatus = document.getElementById('loginStatus');
        loginStatus.innerHTML = `
            <p>✅ ${I18n.t('loggedInAs')} usuario@ejemplo.com</p>
            <button id="logoutBtn" class="logout-btn">${I18n.t('logout')}</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.showAccount();
        });
    },

    /**
     * Handle JSON import
     * @private
     */
    _handleImportJson(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);

                if (!Array.isArray(imported)) {
                    throw new Error(I18n.t('jsonMustBeArray'));
                }
                if (imported.length === 0) {
                    throw new Error(I18n.t('jsonEmpty'));
                }
                for (const day of imported) {
                    if (typeof day.title !== 'string' || !Array.isArray(day.activities)) {
                        throw new Error(I18n.t('jsonInvalidFormat'));
                    }
                }

                State.importDays(imported);
                this.renderDay();
                alert(I18n.t('jsonImported'));
            } catch (error) {
                alert(I18n.t('jsonImportError') + error.message);
            }
        };
        reader.onerror = () => alert(I18n.t('fileReadError'));
        reader.readAsText(file);
    },

    /**
     * Handle travel search
     * @private
     */
    _handleSearchTravels() {
        const searchInput = document.getElementById('travelSearchInput');
        const durationFilter = document.getElementById('durationFilter');
        const budgetFilter = document.getElementById('budgetFilter');
        const searchResults = document.getElementById('searchResults');

        if (!searchInput || !searchResults) return;

        const query = searchInput.value.toLowerCase();
        const duration = durationFilter?.value || '';
        const budget = budgetFilter?.value || '';

        // Mock results
        const mockResults = [
            { title: "🇯🇵 Aventura en Tokio - 7 días", description: "Descubre la capital de Japón", durationDays: 7, budgetValue: 1200, author: "viajero123", rating: 4.8 },
            { title: "🇪🇸 Ruta por Andalucía - 10 días", description: "Sevilla, Córdoba, Granada y más", durationDays: 10, budgetValue: 800, author: "explorador_es", rating: 4.6 },
            { title: "🇮🇹 Roma y Florencia - 5 días", description: "Lo mejor de Italia", durationDays: 5, budgetValue: 900, author: "italia_lover", rating: 4.9 }
        ];

        let filtered = mockResults;

        if (query) {
            filtered = filtered.filter(r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query));
        }

        if (duration) {
            filtered = filtered.filter(r => {
                const d = r.durationDays;
                switch (duration) {
                    case '1-3': return d >= 1 && d <= 3;
                    case '4-7': return d >= 4 && d <= 7;
                    case '8-14': return d >= 8 && d <= 14;
                    case '15+': return d >= 15;
                    default: return true;
                }
            });
        }

        if (budget) {
            filtered = filtered.filter(r => {
                const v = r.budgetValue;
                switch (budget) {
                    case '0-500': return v <= 500;
                    case '500-1000': return v > 500 && v <= 1000;
                    case '1000-2000': return v > 1000 && v <= 2000;
                    case '2000+': return v > 2000;
                    default: return true;
                }
            });
        }

        if (filtered.length === 0) {
            searchResults.innerHTML = `<p class="no-results">${I18n.t('noResults')}</p>`;
        } else {
            searchResults.innerHTML = filtered.map(r => `
                <div class="search-result-item">
                    <h4>${Utils.sanitizeHTML(r.title)}</h4>
                    <p>${Utils.sanitizeHTML(r.description)}</p>
                    <div class="result-meta">
                        <span>⏱️ ${r.durationDays} ${I18n.t('days')}</span>
                        <span>💰 €${r.budgetValue}</span>
                        <span>👤 ${Utils.sanitizeHTML(r.author)}</span>
                        <span>⭐ ${r.rating}</span>
                    </div>
                    <div class="result-actions">
                        <button class="travel-btn primary">${I18n.t('viewDetails')}</button>
                        <button class="travel-btn secondary">${I18n.t('import')}</button>
                    </div>
                </div>
            `).join('');
        }
    }
};
