// Utility function to sanitize HTML and prevent XSS
function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// Utility function to escape HTML for attribute values
function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// LocalStorage persistence functions
function loadDaysFromStorage() {
    try {
        const data = localStorage.getItem('travelAssistantData');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

function loadCurrentDayFromStorage() {
    try {
        const savedDay = localStorage.getItem('travelAssistantCurrentDay');
        return savedDay !== null ? (parseInt(savedDay, 10) || 0) : 0;
    } catch (e) {
        console.error('Error loading currentDay from localStorage:', e);
        return 0;
    }
}

function loadAccommodationsFromStorage() {
    try {
        const data = localStorage.getItem('travelAssistantAccommodations');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading accommodations from localStorage:', e);
        return null;
    }
}

// Clonamos la variable global 'days' (de data.js) para no modificarla directamente
// Load from localStorage if available, otherwise use default data
let daysData = loadDaysFromStorage() || JSON.parse(JSON.stringify(days));
let accommodationsData = loadAccommodationsFromStorage() || JSON.parse(JSON.stringify(accommodations));
let currentDay = loadCurrentDayFromStorage();
let currentView = 'planning'; // Track current view: 'planning', 'budget', 'objects', 'account'
let editingActivity = null; // Track editing state: { dayIndex, activityIndex } or null
let editingAccommodation = null; // Track accommodation editing state: accommodationId or null

function saveToStorage() {
    try {
        localStorage.setItem('travelAssistantData', JSON.stringify(daysData));
        localStorage.setItem('travelAssistantAccommodations', JSON.stringify(accommodationsData));
        localStorage.setItem('travelAssistantCurrentDay', currentDay.toString());
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Get accommodations for a specific day
function getAccommodationsForDay(dayIndex) {
    return accommodationsData.filter(acc => dayIndex >= acc.fromDay && dayIndex <= acc.toDay);
}

// Generate next accommodation ID
function getNextAccommodationId() {
    if (accommodationsData.length === 0) return 1;
    return Math.max(...accommodationsData.map(a => a.id)) + 1;
}

// Refresh the current view based on state
function refreshCurrentView() {
    switch (currentView) {
        case 'budget':
            showBudgetView();
            break;
        case 'objects':
            showObjectsView();
            break;
        case 'account':
            showAccountView();
            break;
        case 'planning':
        default:
            renderDay();
            break;
    }
}

// Referencias al DOM
const dayTitleEl = document.getElementById('dayTitle');
const activityListEl = document.getElementById('activityList');
const pageTitleEl = document.getElementById('pageTitle');

const modal = document.getElementById('activityModal');
const closeModalBtn = document.getElementById('closeModal');
const activityForm = document.getElementById('activityForm');
const addActivityBtn = document.getElementById('addActivityBtn');

const moveDayLeftBtn = document.getElementById('moveDayLeftBtn');
const moveDayRightBtn = document.getElementById('moveDayRightBtn');

// Inicialización del mapa Leaflet - get initial coordinates from first activity or default
function getInitialMapCoordinates() {
    for (const day of daysData) {
        for (const activity of day.activities) {
            if (activity.coordinates && Array.isArray(activity.coordinates) && activity.coordinates.length === 2) {
                return activity.coordinates;
            }
        }
    }
    return [41.3851, 2.1734]; // Default to Barcelona if no coordinates found
}

const initialCoords = getInitialMapCoordinates();
const map = L.map('map').setView(initialCoords, 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null;
let currentPolyline = null;

const redIcon = L.icon({
    iconUrl: 'img/marker-icon-red.png',
    shadowUrl: 'img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function haversineDistance(coords1, coords2) {
    const toRad = deg => deg * Math.PI / 180;
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderDay() {
    const day = daysData[currentDay];
    dayTitleEl.textContent = `Día ${currentDay + 1}: ${day.title}`;
    
    // Update page title with current travel name
    if (daysData.length > 0) {
        const travelName = daysData[0].title || 'Mi Viaje';
        pageTitleEl.textContent = travelName;
    }
    
    activityListEl.innerHTML = '';

    // Limpiar mapa
    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
    if (currentPolyline) {
        map.removeLayer(currentPolyline);
        currentPolyline = null;
    }

    // Separar actividades obligatorias y opcionales, preservando índices originales
    const mandatoryActivities = day.activities
        .map((activity, index) => ({ ...activity, originalIndex: index }))
        .filter(activity => !activity.isOptional);
    const optionalActivities = day.activities
        .map((activity, index) => ({ ...activity, originalIndex: index }))
        .filter(activity => activity.isOptional);

    // Función para renderizar una lista de actividades
    function renderActivityList(activities, isOptional = false) {
        if (activities.length === 0) return;

        // Agregar header para actividades opcionales
        if (isOptional) {
            const optionalHeader = document.createElement('li');
            optionalHeader.className = 'optional-activities-header';
            optionalHeader.innerHTML = '<h3>Actividades Opcionales</h3>';
            activityListEl.appendChild(optionalHeader);
        }

        // Generar lista de actividades + traslados automáticos
        const activitiesWithTransfers = [];
        for (let i = 0; i < activities.length; i++) {
            const current = activities[i];
            activitiesWithTransfers.push(current);

            const next = activities[i + 1];
            if (next && current.coordinates && next.coordinates) {
                const dist = haversineDistance(current.coordinates, next.coordinates);
                if (dist >= 0.2 && dist < 100) {
                    activitiesWithTransfers.push({
                        isTransfer: true,
                        from: current.name,
                        to: next.name,
                        coordinates: [current.coordinates, next.coordinates],
                        distance: dist.toFixed(2)
                    });
                }
            }
        }

        // Renderizar actividades y traslados
        activitiesWithTransfers.forEach((act, i) => {
            const li = document.createElement('li');
            li.className = isOptional ? 'activity-item optional-activity' : 'activity-item';

            if (act.isTransfer) {
                li.innerHTML = `
            <em>Traslado automático:</em> De <strong>${sanitizeHTML(act.from)}</strong> a <strong>${sanitizeHTML(act.to)}</strong> (${sanitizeHTML(act.distance)} km)<br>
            <button class="open-gmaps-btn" style="margin-top:5px;">Ir en Google Maps</button>
          `;
                const gmapsBtn = li.querySelector('.open-gmaps-btn');
                gmapsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const [from, to] = act.coordinates;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from[0])},${encodeURIComponent(from[1])}&destination=${encodeURIComponent(to[0])},${encodeURIComponent(to[1])}&travelmode=transit`;
                    window.open(url, '_blank');
                });
                li.addEventListener('click', () => {
                    if (currentPolyline) {
                        map.removeLayer(currentPolyline);
                        currentPolyline = null;
                    }
                    if (currentMarker) {
                        if (Array.isArray(currentMarker)) {
                            currentMarker.forEach(m => map.removeLayer(m));
                        } else {
                            map.removeLayer(currentMarker);
                        }
                        currentMarker = null;
                    }

                    currentPolyline = L.polyline(act.coordinates, { color: 'blue' }).addTo(map);
                    const [from, to] = act.coordinates;
                    const markerA = L.marker(from, { icon: redIcon }).addTo(map);
                    const markerB = L.marker(to, { icon: redIcon }).addTo(map);
                    currentMarker = [markerA, markerB];
                    map.fitBounds(currentPolyline.getBounds());
                });

            } else {
                const activityIndex = act.originalIndex;
                li.innerHTML = `
            <div class="activity-header ${act.isDone ? 'activity-done' : ''}">
              <div class="activity-checkbox-container">
                <input type="checkbox" class="activity-checkbox" ${act.isDone ? 'checked' : ''} data-day="${currentDay}" data-activity="${activityIndex}">
              </div>
              <div class="activity-info" data-day="${currentDay}" data-activity="${activityIndex}">
                <strong>${sanitizeHTML(act.time) || 'Sin hora'}</strong> - ${sanitizeHTML(act.name)}${isOptional ? ' <span class="optional-badge">(Opcional)</span>' : ''}
              </div>
              <div class="activity-actions">
                <button class="edit-activity-btn" data-day="${currentDay}" data-activity="${activityIndex}">✏️</button>
                <button class="delete-activity-btn" data-day="${currentDay}" data-activity="${activityIndex}">🗑️</button>
              </div>
            </div>
            <div class="activity-details" id="details-${currentDay}-${activityIndex}" style="display:none;">
              <p>${sanitizeHTML(act.description)}</p>
              ${act.importantInfo ? `<p class="important-info">${sanitizeHTML(act.importantInfo)}</p>` : ''}
              ${act.price ? `<p class="price-info"><strong>Precio:</strong> ${sanitizeHTML(act.price)} ${sanitizeHTML(act.currency) || 'EUR'}</p>` : ''}
            </div>
          `;

                // Add event listeners using stored index
                const editBtn = li.querySelector('.edit-activity-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editActivity(currentDay, activityIndex);
                });

                const deleteBtn = li.querySelector('.delete-activity-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteActivity(currentDay, activityIndex);
                });

                const checkbox = li.querySelector('.activity-checkbox');
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    toggleActivityDone(currentDay, activityIndex);
                });

                // Activity info click handler for expanding details
                const activityInfo = li.querySelector('.activity-info');
                activityInfo.addEventListener('click', (e) => {
                    e.stopPropagation();
                    [...activityListEl.querySelectorAll('.activity-details')].forEach(d => d.style.display = 'none');
                    const detailEl = document.getElementById(`details-${currentDay}-${activityIndex}`);
                    if (detailEl) {
                        detailEl.style.display = detailEl.style.display === 'block' ? 'none' : 'block';
                    }

                    // Only update map if activity has coordinates
                    if (act.coordinates && Array.isArray(act.coordinates) && act.coordinates.length === 2) {
                        if (currentMarker) {
                            if (Array.isArray(currentMarker)) {
                                currentMarker.forEach(m => map.removeLayer(m));
                            } else {
                                map.removeLayer(currentMarker);
                            }
                            currentMarker = null;
                        }
                        if (currentPolyline) {
                            map.removeLayer(currentPolyline);
                            currentPolyline = null;
                        }

                        currentMarker = L.marker(act.coordinates, { icon: redIcon }).addTo(map);
                        map.setView(act.coordinates, 15);
                    }
                });
            }

            activityListEl.appendChild(li);
        });
    }

    // Renderizar actividades obligatorias primero
    renderActivityList(mandatoryActivities, false);

    // Renderizar actividades opcionales al final
    renderActivityList(optionalActivities, true);

    // Renderizar sección de alojamiento
    renderAccommodationSection(currentDay);

    // Centrar mapa en la primera actividad con coordenadas si existe
    const firstRealAct = day.activities.find(activity => activity.coordinates);
    if (firstRealAct) {
        currentMarker = L.marker(firstRealAct.coordinates, { icon: redIcon }).addTo(map);
        map.setView(firstRealAct.coordinates, 13);
    }
}

// Render accommodation section for the day
function renderAccommodationSection(dayIndex) {
    const dayAccommodations = getAccommodationsForDay(dayIndex);

    // Create accommodation section
    const accommodationSection = document.createElement('li');
    accommodationSection.className = 'accommodation-section';

    let accommodationHTML = '<div class="accommodation-header"><h3>Donde dormimos esta noche</h3></div>';

    if (dayAccommodations.length === 0) {
        accommodationHTML += '<div class="accommodation-content"><p class="no-accommodation">No hay alojamiento registrado para este día</p></div>';
    } else {
        accommodationHTML += '<div class="accommodation-content">';
        dayAccommodations.forEach(acc => {
            const daysRange = acc.fromDay === acc.toDay
                ? `Día ${acc.fromDay + 1}`
                : `Días ${acc.fromDay + 1} - ${acc.toDay + 1}`;

            const hasCoordinates = acc.coordinates && Array.isArray(acc.coordinates) && acc.coordinates.length === 2;

            accommodationHTML += `
                <div class="accommodation-item" data-id="${acc.id}">
                    <div class="accommodation-info">
                        <strong class="accommodation-name">${sanitizeHTML(acc.name)}</strong>
                        <span class="accommodation-days">${sanitizeHTML(daysRange)}</span>
                        ${acc.link ? `<a href="${escapeAttr(acc.link)}" target="_blank" class="accommodation-link">Ver reserva</a>` : ''}
                        ${hasCoordinates ? `<button class="accommodation-gmaps-btn" data-lat="${acc.coordinates[0]}" data-lng="${acc.coordinates[1]}">Ir con Maps</button>` : ''}
                    </div>
                    <div class="accommodation-actions">
                        <button class="edit-accommodation-btn" data-id="${acc.id}">✏️</button>
                        <button class="delete-accommodation-btn" data-id="${acc.id}">🗑️</button>
                    </div>
                </div>
            `;
        });
        accommodationHTML += '</div>';
    }

    accommodationSection.innerHTML = accommodationHTML;
    activityListEl.appendChild(accommodationSection);

    // Add event listeners for accommodation buttons
    accommodationSection.querySelectorAll('.edit-accommodation-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editAccommodation(parseInt(btn.dataset.id));
        });
    });

    accommodationSection.querySelectorAll('.delete-accommodation-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteAccommodation(parseInt(btn.dataset.id));
        });
    });

    // Add event listeners for Google Maps buttons
    accommodationSection.querySelectorAll('.accommodation-gmaps-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const lat = btn.dataset.lat;
            const lng = btn.dataset.lng;
            // Open Google Maps with directions from current location to accommodation
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&travelmode=transit`;
            window.open(url, '_blank');
        });
    });
}

// Navegación días
document.getElementById('prevDay').addEventListener('click', () => {
    if (currentDay > 0) {
        currentDay--;
        saveToStorage();
        renderDay();
    }
});
document.getElementById('nextDay').addEventListener('click', () => {
    if (currentDay < daysData.length - 1) {
        currentDay++;
        saveToStorage();
        renderDay();
    }
});

// Añadir nuevo día
document.getElementById('addDayBtn').addEventListener('click', () => {
    const title = prompt('Introduce el título del nuevo día:');
    if (!title || !title.trim()) {
        alert('Título inválido');
        return;
    }
    daysData.push({ title: title.trim(), activities: [] });
    currentDay = daysData.length - 1;
    saveToStorage();
    renderDay();
});

// Abrir modal para añadir actividad
addActivityBtn.addEventListener('click', () => {
    activityForm.reset();
    editingActivity = null; // Ensure we're in "add" mode, not "edit" mode
    modal.style.display = 'block';
    // Reset time field requirement
    document.getElementById('timeInput').required = true;
    // Reset button text
    const submitBtn = activityForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Añadir Actividad';
});

// Handle optional checkbox change
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

// Helper to reset modal state
function resetModalState() {
    modal.style.display = 'none';
    editingActivity = null;
    const submitBtn = activityForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Añadir Actividad';
}

// Cerrar modal con la X
closeModalBtn.addEventListener('click', () => {
    resetModalState();
});

// Cerrar modal al clicar fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        resetModalState();
    }
});

// Parse and validate coordinates
function parseCoordinates(latStr, lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // Validate coordinate ranges
    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }
    return [lat, lng];
}

// Unified form submission handler
function handleFormSubmit(e) {
    e.preventDefault();

    const time = activityForm.time.value;
    const name = activityForm.name.value.trim();
    const description = activityForm.description.value.trim();
    const importantInfo = activityForm.importantInfo.value.trim();
    const price = activityForm.price.value.trim();
    const currency = activityForm.currency.value;
    const isOptional = activityForm.isOptional.checked;
    const coordinates = parseCoordinates(activityForm.lat.value, activityForm.lng.value);

    if ((!isOptional && !time) || !name || !description) {
        alert('Por favor completa todos los campos obligatorios correctamente.');
        return;
    }

    const activityData = {
        time,
        name,
        description,
        importantInfo: importantInfo || null,
        price: price || null,
        currency: price ? currency : null,
        isOptional: isOptional,
        isDone: false,
        coordinates
    };

    if (editingActivity) {
        // Editing existing activity - preserve isDone state
        activityData.isDone = daysData[editingActivity.dayIndex].activities[editingActivity.activityIndex].isDone || false;
        daysData[editingActivity.dayIndex].activities[editingActivity.activityIndex] = activityData;
        editingActivity = null;

        // Reset button text
        const submitBtn = activityForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Añadir Actividad';
    } else {
        // Adding new activity
        daysData[currentDay].activities.push(activityData);
    }

    modal.style.display = 'none';
    saveToStorage();
    refreshCurrentView();
}

// Función para manejar añadir actividad (legacy wrapper for compatibility)
function handleAddActivity(e) {
    handleFormSubmit(e);
}

// Manejar envío del formulario de actividad
activityForm.addEventListener('submit', handleAddActivity);

// Mostrar ventana de cuenta
document.getElementById('accountBtn').addEventListener('click', showAccountView);

// Mover día actual hacia la izquierda
moveDayLeftBtn.addEventListener('click', () => {
    if (currentDay > 0) {
        const temp = daysData[currentDay - 1];
        daysData[currentDay - 1] = daysData[currentDay];
        daysData[currentDay] = temp;
        currentDay--;
        saveToStorage();
        renderDay();
    }
});

// Mover día actual hacia la derecha
moveDayRightBtn.addEventListener('click', () => {
    if (currentDay < daysData.length - 1) {
        const temp = daysData[currentDay + 1];
        daysData[currentDay + 1] = daysData[currentDay];
        daysData[currentDay] = temp;
        currentDay++;
        saveToStorage();
        renderDay();
    }
});

// Función para mostrar vista de presupuesto
function showBudgetView() {
    currentView = 'budget';

    // Ocultar elementos de planificación
    document.querySelector('.controls-row:nth-child(2)').style.display = 'none';
    document.querySelector('.right-panel').style.display = 'none';
    document.querySelector('.day-header').style.display = 'none';

    // Mostrar lista de presupuesto
    activityListEl.innerHTML = '';
    activityListEl.className = 'activity-list budget-list';

    // Group totals by currency
    const totalsByCurrency = {};
    let activitiesWithPrice = 0;

    daysData.forEach((day, dayIndex) => {
        // Find activities with price and track their original indices
        const dayActivitiesWithIndices = day.activities
            .map((activity, index) => ({ activity, originalIndex: index }))
            .filter(item => item.activity.price);

        if (dayActivitiesWithIndices.length > 0) {
            const dayHeader = document.createElement('li');
            dayHeader.className = 'budget-day-header';
            dayHeader.innerHTML = `<h3>Día ${dayIndex + 1}: ${sanitizeHTML(day.title)}</h3>`;
            activityListEl.appendChild(dayHeader);

            dayActivitiesWithIndices.forEach(({ activity, originalIndex }) => {
                const li = document.createElement('li');
                li.className = 'budget-item';
                const currency = activity.currency || 'EUR';
                const priceValue = parseFloat(activity.price) || 0;

                // Add to currency totals
                if (!totalsByCurrency[currency]) {
                    totalsByCurrency[currency] = 0;
                }
                totalsByCurrency[currency] += priceValue;

                li.innerHTML = `
                    <div class="budget-activity">
                        <div class="budget-activity-info">
                            <strong>${sanitizeHTML(activity.time) || 'Sin hora'}</strong> - ${sanitizeHTML(activity.name)}
                        </div>
                        <div class="budget-activity-actions">
                            <span class="budget-price">${sanitizeHTML(activity.price)} ${sanitizeHTML(currency)}</span>
                            <button class="edit-activity-btn" data-day="${dayIndex}" data-activity="${originalIndex}">✏️</button>
                            <button class="delete-activity-btn" data-day="${dayIndex}" data-activity="${originalIndex}">🗑️</button>
                        </div>
                    </div>
                `;

                // Add event listener for edit button
                const editBtn = li.querySelector('.edit-activity-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editActivity(dayIndex, originalIndex);
                });

                // Add event listener for delete button
                const deleteBtn = li.querySelector('.delete-activity-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteActivity(dayIndex, originalIndex);
                });

                activityListEl.appendChild(li);
                activitiesWithPrice++;
            });
        }
    });

    // Build totals summary string
    const totalsArray = Object.entries(totalsByCurrency)
        .map(([currency, total]) => `${total.toFixed(2)} ${sanitizeHTML(currency)}`)
        .join(' + ');

    // Mostrar resumen total
    const summaryLi = document.createElement('li');
    summaryLi.className = 'budget-summary';
    summaryLi.innerHTML = `
        <div class="budget-total">
            <strong>Resumen:</strong> ${activitiesWithPrice} actividades con precio
            ${totalsArray ? `<br><strong>Total:</strong> ${totalsArray}` : ''}
        </div>
    `;
    activityListEl.appendChild(summaryLi);
}

// Función para editar actividad - uses unified form handler
function editActivity(dayIndex, activityIndex) {
    const activity = daysData[dayIndex].activities[activityIndex];

    if (!activity) {
        console.error('Activity not found:', dayIndex, activityIndex);
        return;
    }

    // Set editing state
    editingActivity = { dayIndex, activityIndex };

    // Llenar el formulario con los datos actuales
    activityForm.time.value = activity.time || '';
    activityForm.name.value = activity.name || '';
    activityForm.description.value = activity.description || '';
    activityForm.importantInfo.value = activity.importantInfo || '';
    activityForm.price.value = activity.price || '';
    activityForm.currency.value = activity.currency || 'EUR';
    activityForm.isOptional.checked = activity.isOptional || false;
    activityForm.lat.value = activity.coordinates ? activity.coordinates[0] : '';
    activityForm.lng.value = activity.coordinates ? activity.coordinates[1] : '';

    // Set time field requirement based on optional status
    const timeInput = document.getElementById('timeInput');
    if (activity.isOptional) {
        timeInput.required = false;
        timeInput.placeholder = "Opcional para actividades opcionales";
    } else {
        timeInput.required = true;
        timeInput.placeholder = "";
    }

    // Cambiar el texto del botón
    const submitBtn = activityForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Actualizar Actividad';

    // Mostrar modal
    modal.style.display = 'block';
}

// Función para borrar actividad
function deleteActivity(dayIndex, activityIndex) {
    if (confirm('¿Estás seguro de que quieres borrar esta actividad?')) {
        daysData[dayIndex].activities.splice(activityIndex, 1);
        saveToStorage();
        refreshCurrentView();
    }
}

// Función para marcar/desmarcar actividad como completada
function toggleActivityDone(dayIndex, activityIndex) {
    if (daysData[dayIndex] && daysData[dayIndex].activities[activityIndex]) {
        daysData[dayIndex].activities[activityIndex].isDone = !daysData[dayIndex].activities[activityIndex].isDone;
        saveToStorage();
        refreshCurrentView();
    }
}

// Función para mostrar vista de planificación
function showPlanningView() {
    currentView = 'planning';

    // Mostrar elementos de planificación
    document.querySelector('.controls-row:nth-child(2)').style.display = 'flex';
    document.querySelector('.right-panel').style.display = 'block';
    document.querySelector('.day-header').style.display = 'flex';

    // Restaurar clase original
    activityListEl.className = 'activity-list';

    // Renderizar día actual
    renderDay();
}

// Event listeners para los botones de navegación
document.getElementById('presupuestoBtn').addEventListener('click', showBudgetView);
document.getElementById('planificacionBtn').addEventListener('click', showPlanningView);
document.getElementById('objetosBtn').addEventListener('click', showObjectsView);

// Función para mostrar vista de objetos
function showObjectsView() {
    currentView = 'objects';

    // Ocultar elementos de planificación
    document.querySelector('.controls-row:nth-child(2)').style.display = 'none';
    document.querySelector('.right-panel').style.display = 'none';
    document.querySelector('.day-header').style.display = 'none';

    // Mostrar lista de objetos
    activityListEl.innerHTML = '';
    activityListEl.className = 'activity-list objects-list';
    
    const objectsHeader = document.createElement('li');
    objectsHeader.className = 'objects-header';
    objectsHeader.innerHTML = '<h3>Lista de Objetos para el Viaje</h3>';
    activityListEl.appendChild(objectsHeader);
    
    const objectsList = document.createElement('li');
    objectsList.className = 'objects-content';
    objectsList.innerHTML = `
        <div class="objects-section">
            <h4>📱 Electrónicos</h4>
            <ul>
                <li>☐ Cargador del teléfono</li>
                <li>☐ Power bank</li>
                <li>☐ Adaptador de corriente</li>
                <li>☐ Auriculares</li>
                <li>☐ Cámara (opcional)</li>
            </ul>
        </div>
        <div class="objects-section">
            <h4>👕 Ropa</h4>
            <ul>
                <li>☐ Ropa interior (días + 2)</li>
                <li>☐ Calcetines (días + 2)</li>
                <li>☐ Camisetas</li>
                <li>☐ Pantalones/Shorts</li>
                <li>☐ Chaqueta/Abrigo</li>
                <li>☐ Pijama</li>
            </ul>
        </div>
        <div class="objects-section">
            <h4>🧴 Higiene</h4>
            <ul>
                <li>☐ Cepillo de dientes</li>
                <li>☐ Pasta de dientes</li>
                <li>☐ Champú</li>
                <li>☐ Jabón</li>
                <li>☐ Desodorante</li>
                <li>☐ Toallas</li>
            </ul>
        </div>
        <div class="objects-section">
            <h4>📄 Documentos</h4>
            <ul>
                <li>☐ Pasaporte/DNI</li>
                <li>☐ Billetes de avión</li>
                <li>☐ Reservas de hotel</li>
                <li>☐ Seguro de viaje</li>
                <li>☐ Dinero en efectivo</li>
                <li>☐ Tarjetas de crédito</li>
            </ul>
        </div>
        <div class="objects-section">
            <h4>🎒 Otros</h4>
            <ul>
                <li>☐ Mochila/Maletín</li>
                <li>☐ Botella de agua</li>
                <li>☐ Medicamentos</li>
                <li>☐ Protector solar</li>
                <li>☐ Gafas de sol</li>
                <li>☐ Libro/Revista</li>
            </ul>
        </div>
    `;
    activityListEl.appendChild(objectsList);
}

// Función para mostrar vista de cuenta
function showAccountView() {
    currentView = 'account';

    // Ocultar elementos de planificación
    document.querySelector('.controls-row:nth-child(2)').style.display = 'none';
    document.querySelector('.right-panel').style.display = 'none';
    document.querySelector('.day-header').style.display = 'none';

    // Mostrar contenido de cuenta
    activityListEl.innerHTML = '';
    activityListEl.className = 'activity-list account-list';
    
    // Sección de login
    const loginSection = document.createElement('li');
    loginSection.className = 'account-section';
    loginSection.innerHTML = `
        <div class="account-header">
            <h3>🔐 Iniciar Sesión</h3>
        </div>
        <div class="login-content">
            <div class="login-status" id="loginStatus">
                <p>No has iniciado sesión</p>
                <button id="googleLoginBtn" class="google-login-btn">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="google-icon">
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    `;
    activityListEl.appendChild(loginSection);
    
    // Sección Mis Viajes
    const myTravelsSection = document.createElement('li');
    myTravelsSection.className = 'account-section';
    myTravelsSection.innerHTML = `
        <div class="account-header">
            <h3>✈️ Mis Viajes</h3>
        </div>
        <div class="my-travels-content">
            <div class="travel-item">
                <h4>🇯🇵 Viaje a Japón - Julio 2024</h4>
                <p>25 días • 27 actividades • Presupuesto: €2,500</p>
                <div class="travel-actions">
                    <button class="travel-btn primary">Abrir</button>
                    <button class="travel-btn secondary">Compartir</button>
                    <button class="travel-btn danger">Eliminar</button>
                </div>
            </div>
            <div class="travel-item">
                <h4>🇮🇹 Viaje a Italia - Marzo 2024</h4>
                <p>10 días • 15 actividades • Presupuesto: €1,200</p>
                <div class="travel-actions">
                    <button class="travel-btn primary">Abrir</button>
                    <button class="travel-btn secondary">Compartir</button>
                    <button class="travel-btn danger">Eliminar</button>
                </div>
            </div>
            <button id="createNewTravelBtn" class="create-travel-btn">
                ➕ Crear Nuevo Viaje
            </button>
        </div>
    `;
    activityListEl.appendChild(myTravelsSection);
    
    // Sección Buscar Viajes
    const findTravelsSection = document.createElement('li');
    findTravelsSection.className = 'account-section';
    findTravelsSection.innerHTML = `
        <div class="account-header">
            <h3>🔍 Buscar Viajes</h3>
        </div>
        <div class="find-travels-content">
            <div class="search-box">
                <input type="text" id="travelSearchInput" placeholder="Buscar por destino, país, ciudad...">
                <button id="searchTravelsBtn">🔍</button>
            </div>
            <div class="search-filters">
                <select id="durationFilter">
                    <option value="">Cualquier duración</option>
                    <option value="1-3">1-3 días</option>
                    <option value="4-7">4-7 días</option>
                    <option value="8-14">8-14 días</option>
                    <option value="15+">15+ días</option>
                </select>
                <select id="budgetFilter">
                    <option value="">Cualquier presupuesto</option>
                    <option value="0-500">€0-500</option>
                    <option value="500-1000">€500-1,000</option>
                    <option value="1000-2000">€1,000-2,000</option>
                    <option value="2000+">€2,000+</option>
                </select>
            </div>
            <div class="search-results" id="searchResults">
                <p class="search-placeholder">Busca viajes compartidos por otros usuarios</p>
            </div>
        </div>
    `;
    activityListEl.appendChild(findTravelsSection);
    
    // Sección Exportar (mantener funcionalidad anterior)
    const exportSection = document.createElement('li');
    exportSection.className = 'account-section';
    exportSection.innerHTML = `
        <div class="account-header">
            <h3>⚙️ Herramientas</h3>
        </div>
        <div class="tools-content">
            <button id="exportJsonBtn" class="tool-btn">
                📤 Exportar JSON
            </button>
            <button id="importJsonBtn" class="tool-btn">
                📥 Importar JSON
            </button>
            <input type="file" id="jsonFileInput" accept=".json" style="display: none;">
        </div>
    `;
    activityListEl.appendChild(exportSection);
    
    // Event listeners para la vista de cuenta
    setupAccountEventListeners();
}

// Función para configurar event listeners de la cuenta
function setupAccountEventListeners() {
    // Google Login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            // Simular login con Google (aquí se integraría con Google OAuth)
            const loginStatus = document.getElementById('loginStatus');
            loginStatus.innerHTML = `
                <p>✅ Has iniciado sesión como usuario@ejemplo.com</p>
                <button id="logoutBtn" class="logout-btn">Cerrar sesión</button>
            `;
            
            const logoutBtn = document.getElementById('logoutBtn');
            logoutBtn.addEventListener('click', () => {
                loginStatus.innerHTML = `
                    <p>No has iniciado sesión</p>
                    <button id="googleLoginBtn" class="google-login-btn">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="google-icon">
                        Iniciar sesión con Google
                    </button>
                `;
                setupAccountEventListeners(); // Re-setup listeners
            });
        });
    }
    
    // Export JSON
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            const jsonStr = JSON.stringify(daysData, null, 2);
            prompt('Copia el JSON y pégalo en tu data.js:', jsonStr);
        });
    }
    
    // Import JSON
    const importJsonBtn = document.getElementById('importJsonBtn');
    const jsonFileInput = document.getElementById('jsonFileInput');
    if (importJsonBtn && jsonFileInput) {
        importJsonBtn.addEventListener('click', () => {
            jsonFileInput.click();
        });

        jsonFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);

                        // Validate imported data structure
                        if (!Array.isArray(importedData)) {
                            throw new Error('El archivo debe contener un array de días');
                        }
                        if (importedData.length === 0) {
                            throw new Error('El archivo no contiene ningún día');
                        }
                        for (const day of importedData) {
                            if (typeof day.title !== 'string' || !Array.isArray(day.activities)) {
                                throw new Error('Formato de día inválido: debe tener title (string) y activities (array)');
                            }
                        }

                        daysData = importedData;
                        currentDay = 0; // Reset to first day
                        saveToStorage();
                        showPlanningView(); // Volver a la vista de planificación
                        alert('JSON importado correctamente');
                    } catch (error) {
                        alert('Error al importar el JSON: ' + error.message);
                    }
                };
                reader.onerror = () => {
                    alert('Error al leer el archivo');
                };
                reader.readAsText(file);
            }
        });
    }

    // Crear nuevo viaje
    const createNewTravelBtn = document.getElementById('createNewTravelBtn');
    if (createNewTravelBtn) {
        createNewTravelBtn.addEventListener('click', () => {
            const title = prompt('Introduce el título del nuevo viaje:');
            if (title && title.trim()) {
                daysData = [{ title: title.trim(), activities: [] }];
                currentDay = 0;
                saveToStorage();
                showPlanningView();
            }
        });
    }
    
    // Buscar viajes
    const searchTravelsBtn = document.getElementById('searchTravelsBtn');
    const travelSearchInput = document.getElementById('travelSearchInput');
    if (searchTravelsBtn && travelSearchInput) {
        searchTravelsBtn.addEventListener('click', searchTravels);
        travelSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchTravels();
            }
        });
    }
}

// Helper to parse duration days from string like "7 días"
function parseDurationDays(durationStr) {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

// Helper to parse budget from string like "€1,200"
function parseBudgetValue(budgetStr) {
    const cleaned = budgetStr.replace(/[€,\s]/g, '');
    return parseFloat(cleaned) || 0;
}

// Función para buscar viajes
function searchTravels() {
    const searchInput = document.getElementById('travelSearchInput');
    const durationFilter = document.getElementById('durationFilter');
    const budgetFilter = document.getElementById('budgetFilter');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    const query = searchInput.value.toLowerCase();
    const duration = durationFilter ? durationFilter.value : '';
    const budget = budgetFilter ? budgetFilter.value : '';

    // Simular resultados de búsqueda
    const mockResults = [
        {
            title: "🇯🇵 Aventura en Tokio - 7 días",
            description: "Descubre la capital de Japón con esta guía completa",
            duration: "7 días",
            durationDays: 7,
            budget: "€1,200",
            budgetValue: 1200,
            author: "viajero123",
            rating: 4.8
        },
        {
            title: "🇪🇸 Ruta por Andalucía - 10 días",
            description: "Sevilla, Córdoba, Granada y más",
            duration: "10 días",
            durationDays: 10,
            budget: "€800",
            budgetValue: 800,
            author: "explorador_es",
            rating: 4.6
        },
        {
            title: "🇮🇹 Roma y Florencia - 5 días",
            description: "Lo mejor de Italia en una semana",
            duration: "5 días",
            durationDays: 5,
            budget: "€900",
            budgetValue: 900,
            author: "italia_lover",
            rating: 4.9
        }
    ];

    let filteredResults = mockResults;

    // Filter by search query
    if (query) {
        filteredResults = filteredResults.filter(result =>
            result.title.toLowerCase().includes(query) ||
            result.description.toLowerCase().includes(query)
        );
    }

    // Filter by duration
    if (duration) {
        filteredResults = filteredResults.filter(result => {
            const days = result.durationDays;
            switch (duration) {
                case '1-3': return days >= 1 && days <= 3;
                case '4-7': return days >= 4 && days <= 7;
                case '8-14': return days >= 8 && days <= 14;
                case '15+': return days >= 15;
                default: return true;
            }
        });
    }

    // Filter by budget
    if (budget) {
        filteredResults = filteredResults.filter(result => {
            const value = result.budgetValue;
            switch (budget) {
                case '0-500': return value >= 0 && value <= 500;
                case '500-1000': return value > 500 && value <= 1000;
                case '1000-2000': return value > 1000 && value <= 2000;
                case '2000+': return value > 2000;
                default: return true;
            }
        });
    }

    if (filteredResults.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No se encontraron viajes que coincidan con tu búsqueda</p>';
    } else {
        searchResults.innerHTML = filteredResults.map(result => `
            <div class="search-result-item">
                <h4>${sanitizeHTML(result.title)}</h4>
                <p>${sanitizeHTML(result.description)}</p>
                <div class="result-meta">
                    <span>⏱️ ${sanitizeHTML(result.duration)}</span>
                    <span>💰 ${sanitizeHTML(result.budget)}</span>
                    <span>👤 ${sanitizeHTML(result.author)}</span>
                    <span>⭐ ${result.rating}</span>
                </div>
                <div class="result-actions">
                    <button class="travel-btn primary">Ver Detalles</button>
                    <button class="travel-btn secondary">Importar</button>
                </div>
            </div>
        `).join('');
    }
}

// ==================== ACCOMMODATION MODAL ====================

const accommodationModal = document.getElementById('accommodationModal');
const closeAccommodationModalBtn = document.getElementById('closeAccommodationModal');
const accommodationForm = document.getElementById('accommodationForm');
const addAccommodationBtn = document.getElementById('addAccommodationBtn');
const fromDaySelect = document.getElementById('fromDaySelect');
const toDaySelect = document.getElementById('toDaySelect');

// Populate day select options
function populateDaySelects() {
    fromDaySelect.innerHTML = '';
    toDaySelect.innerHTML = '';

    daysData.forEach((day, index) => {
        const optionFrom = document.createElement('option');
        optionFrom.value = index;
        optionFrom.textContent = `Día ${index + 1}: ${day.title}`;
        fromDaySelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = index;
        optionTo.textContent = `Día ${index + 1}: ${day.title}`;
        toDaySelect.appendChild(optionTo);
    });

    // Set default to current day
    fromDaySelect.value = currentDay;
    toDaySelect.value = currentDay;
}

// Open accommodation modal
addAccommodationBtn.addEventListener('click', () => {
    accommodationForm.reset();
    editingAccommodation = null;
    populateDaySelects();
    accommodationModal.style.display = 'block';
    const submitBtn = accommodationForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Añadir Alojamiento';
});

// Close accommodation modal
closeAccommodationModalBtn.addEventListener('click', () => {
    accommodationModal.style.display = 'none';
    editingAccommodation = null;
    const submitBtn = accommodationForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Añadir Alojamiento';
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === accommodationModal) {
        accommodationModal.style.display = 'none';
        editingAccommodation = null;
        const submitBtn = accommodationForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Añadir Alojamiento';
    }
});

// Validate toDay >= fromDay
fromDaySelect.addEventListener('change', () => {
    const fromDay = parseInt(fromDaySelect.value);
    const toDay = parseInt(toDaySelect.value);
    if (toDay < fromDay) {
        toDaySelect.value = fromDay;
    }
});

// Parse accommodation coordinates
function parseAccommodationCoordinates(latStr, lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }
    return [lat, lng];
}

// Handle accommodation form submission
accommodationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = accommodationForm.name.value.trim();
    const fromDay = parseInt(accommodationForm.fromDay.value);
    const toDay = parseInt(accommodationForm.toDay.value);
    const price = parseFloat(accommodationForm.price.value) || 0;
    const link = accommodationForm.link.value.trim();
    const coordinates = parseAccommodationCoordinates(accommodationForm.accLat.value, accommodationForm.accLng.value);

    if (!name) {
        alert('Por favor introduce el nombre del alojamiento.');
        return;
    }

    if (toDay < fromDay) {
        alert('El día de salida debe ser igual o posterior al día de entrada.');
        return;
    }

    if (editingAccommodation) {
        // Update existing accommodation
        const accIndex = accommodationsData.findIndex(a => a.id === editingAccommodation);
        if (accIndex !== -1) {
            accommodationsData[accIndex] = {
                id: editingAccommodation,
                name,
                fromDay,
                toDay,
                price,
                link,
                coordinates
            };
        }
        editingAccommodation = null;
        const submitBtn = accommodationForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Añadir Alojamiento';
    } else {
        // Add new accommodation
        accommodationsData.push({
            id: getNextAccommodationId(),
            name,
            fromDay,
            toDay,
            price,
            link,
            coordinates
        });
    }

    accommodationModal.style.display = 'none';
    saveToStorage();
    refreshCurrentView();
});

// Edit accommodation
function editAccommodation(accommodationId) {
    const accommodation = accommodationsData.find(a => a.id === accommodationId);
    if (!accommodation) {
        console.error('Accommodation not found:', accommodationId);
        return;
    }

    editingAccommodation = accommodationId;
    populateDaySelects();

    accommodationForm.name.value = accommodation.name || '';
    accommodationForm.fromDay.value = accommodation.fromDay;
    accommodationForm.toDay.value = accommodation.toDay;
    accommodationForm.price.value = accommodation.price || 0;
    accommodationForm.link.value = accommodation.link || '';
    accommodationForm.accLat.value = accommodation.coordinates ? accommodation.coordinates[0] : '';
    accommodationForm.accLng.value = accommodation.coordinates ? accommodation.coordinates[1] : '';

    const submitBtn = accommodationForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Actualizar Alojamiento';

    accommodationModal.style.display = 'block';
}

// Delete accommodation
function deleteAccommodation(accommodationId) {
    if (confirm('¿Estás seguro de que quieres eliminar este alojamiento?')) {
        accommodationsData = accommodationsData.filter(a => a.id !== accommodationId);
        saveToStorage();
        refreshCurrentView();
    }
}

// Render inicial
renderDay();
