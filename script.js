// Clonamos la variable global 'days' (de data.js) para no modificarla directamente
let daysData = JSON.parse(JSON.stringify(days));
let currentDay = 0;

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

// Inicialización del mapa Leaflet
const map = L.map('map').setView([41.3851, 2.1734], 13);
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

    // Separar actividades obligatorias y opcionales
    const mandatoryActivities = day.activities.filter(activity => !activity.isOptional);
    const optionalActivities = day.activities.filter(activity => activity.isOptional);

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
            <em>Traslado automático:</em> De <strong>${act.from}</strong> a <strong>${act.to}</strong> (${act.distance} km)<br>
            <button class="open-gmaps-btn" style="margin-top:5px;">Ir en Google Maps</button>
          `;
                const gmapsBtn = li.querySelector('.open-gmaps-btn');
                gmapsBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const [from, to] = act.coordinates;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=transit`;
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
                li.innerHTML = `
            <div class="activity-header ${act.isDone ? 'activity-done' : ''}">
              <div class="activity-checkbox-container">
                <input type="checkbox" class="activity-checkbox" ${act.isDone ? 'checked' : ''} data-day="${currentDay}" data-activity="${day.activities.indexOf(act)}">
              </div>
              <div class="activity-info" data-day="${currentDay}" data-activity="${day.activities.indexOf(act)}">
                <strong>${act.time || 'Sin hora'}</strong> - ${act.name}${isOptional ? ' <span class="optional-badge">(Opcional)</span>' : ''}
              </div>
              <div class="activity-actions">
                <button class="edit-activity-btn" data-day="${currentDay}" data-activity="${day.activities.indexOf(act)}">✏️</button>
                <button class="delete-activity-btn" data-day="${currentDay}" data-activity="${day.activities.indexOf(act)}">🗑️</button>
              </div>
            </div>
            <div class="activity-details" id="details-${i}" style="display:none;">
              <p>${act.description}</p>
              ${act.importantInfo ? `<p class="important-info">${act.importantInfo}</p>` : ''}
              ${act.price ? `<p class="price-info"><strong>Precio:</strong> ${act.price} ${act.currency || 'EUR'}</p>` : ''}
            </div>
          `;
                
                // Add event listeners
                const editBtn = li.querySelector('.edit-activity-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editActivity(currentDay, day.activities.indexOf(act));
                });
                
                const deleteBtn = li.querySelector('.delete-activity-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteActivity(currentDay, day.activities.indexOf(act));
                });
                
                const checkbox = li.querySelector('.activity-checkbox');
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    toggleActivityDone(currentDay, day.activities.indexOf(act));
                });
                
                // Activity info click handler for expanding details
                const activityInfo = li.querySelector('.activity-info');
                activityInfo.addEventListener('click', (e) => {
                    e.stopPropagation();
                    [...activityListEl.querySelectorAll('.activity-details')].forEach(d => d.style.display = 'none');
                    const detailEl = document.getElementById(`details-${i}`);
                    if (detailEl) {
                        detailEl.style.display = detailEl.style.display === 'block' ? 'none' : 'block';
                    }

                    // Only update map if activity has coordinates
                    if (act.coordinates) {
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

    // Centrar mapa en la primera actividad con coordenadas si existe
    const firstRealAct = day.activities.find(activity => activity.coordinates);
    if (firstRealAct) {
        currentMarker = L.marker(firstRealAct.coordinates, { icon: redIcon }).addTo(map);
        map.setView(firstRealAct.coordinates, 13);
    }
}

// Navegación días
document.getElementById('prevDay').addEventListener('click', () => {
    if (currentDay > 0) {
        currentDay--;
        renderDay();
    }
});
document.getElementById('nextDay').addEventListener('click', () => {
    if (currentDay < daysData.length - 1) {
        currentDay++;
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
    renderDay();
});

// Abrir modal para añadir actividad
addActivityBtn.addEventListener('click', () => {
    activityForm.reset();
    modal.style.display = 'block';
    // Reset time field requirement
    document.getElementById('timeInput').required = true;
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

// Cerrar modal con la X
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar modal al clicar fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Función para manejar añadir actividad
function handleAddActivity(e) {
    e.preventDefault();

    const time = activityForm.time.value;
    const name = activityForm.name.value.trim();
    const description = activityForm.description.value.trim();
    const importantInfo = activityForm.importantInfo.value.trim();
    const price = activityForm.price.value.trim();
    const currency = activityForm.currency.value;
    const isOptional = activityForm.isOptional.checked;
    const lat = parseFloat(activityForm.lat.value);
    const lng = parseFloat(activityForm.lng.value);

    if ((!isOptional && !time) || !name || !description) {
        alert('Por favor completa todos los campos obligatorios correctamente.');
        return;
    }

    daysData[currentDay].activities.push({
        time,
        name,
        description,
        importantInfo: importantInfo || null,
        price: price || null,
        currency: price ? currency : null,
        isOptional: isOptional,
        isDone: false,
        coordinates: (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null
    });

    modal.style.display = 'none';
    renderDay();
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
        renderDay();
    }
});

// Función para mostrar vista de presupuesto
function showBudgetView() {
    // Ocultar elementos de planificación
    document.querySelector('.controls-row:nth-child(2)').style.display = 'none';
    document.querySelector('.right-panel').style.display = 'none';
    document.querySelector('.day-header').style.display = 'none';
    
    // Mostrar lista de presupuesto
    activityListEl.innerHTML = '';
    activityListEl.className = 'activity-list budget-list';
    
    let totalBudget = 0;
    let activitiesWithPrice = 0;
    
    daysData.forEach((day, dayIndex) => {
        const dayActivities = day.activities.filter(activity => activity.price);
        
        if (dayActivities.length > 0) {
            const dayHeader = document.createElement('li');
            dayHeader.className = 'budget-day-header';
            dayHeader.innerHTML = `<h3>Día ${dayIndex + 1}: ${day.title}</h3>`;
            activityListEl.appendChild(dayHeader);
            
            dayActivities.forEach((activity, activityIndex) => {
                const li = document.createElement('li');
                li.className = 'budget-item';
                li.innerHTML = `
                    <div class="budget-activity">
                        <div class="budget-activity-info">
                            <strong>${activity.time}</strong> - ${activity.name}
                        </div>
                        <div class="budget-activity-actions">
                            <span class="budget-price">${activity.price} ${activity.currency || 'EUR'}</span>
                            <button class="edit-activity-btn" data-day="${dayIndex}" data-activity="${activityIndex}">✏️</button>
                            <button class="delete-activity-btn" data-day="${dayIndex}" data-activity="${activityIndex}">🗑️</button>
                        </div>
                    </div>
                `;
                
                // Add event listener for edit button
                const editBtn = li.querySelector('.edit-activity-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editActivity(dayIndex, activityIndex);
                });
                
                // Add event listener for delete button
                const deleteBtn = li.querySelector('.delete-activity-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteActivity(dayIndex, activityIndex);
                });
                
                activityListEl.appendChild(li);
                activitiesWithPrice++;
            });
        }
    });
    
    // Mostrar resumen total
    const summaryLi = document.createElement('li');
    summaryLi.className = 'budget-summary';
    summaryLi.innerHTML = `
        <div class="budget-total">
            <strong>Resumen:</strong> ${activitiesWithPrice} actividades con precio
        </div>
    `;
    activityListEl.appendChild(summaryLi);
}

// Función para editar actividad
function editActivity(dayIndex, activityIndex) {
    const activity = daysData[dayIndex].activities[activityIndex];
    
    // Llenar el formulario con los datos actuales
    activityForm.time.value = activity.time || '';
    activityForm.name.value = activity.name;
    activityForm.description.value = activity.description;
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
    submitBtn.textContent = 'Actualizar Actividad';
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Remover el event listener original
    activityForm.removeEventListener('submit', handleAddActivity);
    
    // Agregar event listener para editar
    const handleEditActivity = (e) => {
        e.preventDefault();
        
        const time = activityForm.time.value;
        const name = activityForm.name.value.trim();
        const description = activityForm.description.value.trim();
        const importantInfo = activityForm.importantInfo.value.trim();
        const price = activityForm.price.value.trim();
        const currency = activityForm.currency.value;
        const isOptional = activityForm.isOptional.checked;
        const lat = parseFloat(activityForm.lat.value);
        const lng = parseFloat(activityForm.lng.value);
        
        if ((!isOptional && !time) || !name || !description) {
            alert('Por favor completa todos los campos obligatorios correctamente.');
            return;
        }
        
        // Actualizar la actividad
        daysData[dayIndex].activities[activityIndex] = {
            time,
            name,
            description,
            importantInfo: importantInfo || null,
            price: price || null,
            currency: price ? currency : null,
            isOptional: isOptional,
            isDone: daysData[dayIndex].activities[activityIndex].isDone || false,
            coordinates: (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null
        };
        
        modal.style.display = 'none';
        
        // Restaurar el botón y event listener original
        submitBtn.textContent = 'Añadir Actividad';
        activityForm.removeEventListener('submit', handleEditActivity);
        activityForm.addEventListener('submit', handleAddActivity);
        
        // Re-renderizar la vista actual
        if (activityListEl.classList.contains('budget-list')) {
            showBudgetView();
        } else {
            renderDay();
        }
    };
    
    activityForm.addEventListener('submit', handleEditActivity);
}

// Función para borrar actividad
function deleteActivity(dayIndex, activityIndex) {
    if (confirm('¿Estás seguro de que quieres borrar esta actividad?')) {
        daysData[dayIndex].activities.splice(activityIndex, 1);
        
        // Re-renderizar la vista actual
        if (activityListEl.classList.contains('budget-list')) {
            showBudgetView();
        } else {
            renderDay();
        }
    }
}

// Función para marcar/desmarcar actividad como completada
function toggleActivityDone(dayIndex, activityIndex) {
    daysData[dayIndex].activities[activityIndex].isDone = !daysData[dayIndex].activities[activityIndex].isDone;
    
    // Re-renderizar la vista actual
    if (activityListEl.classList.contains('budget-list')) {
        showBudgetView();
    } else {
        renderDay();
    }
}

// Función para mostrar vista de planificación
function showPlanningView() {
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
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        daysData = importedData;
                        currentDay = 0; // Reset to first day
                        showPlanningView(); // Volver a la vista de planificación
                        alert('JSON importado correctamente');
                    } catch (error) {
                        alert('Error al importar el JSON: ' + error.message);
                    }
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

// Función para buscar viajes
function searchTravels() {
    const searchInput = document.getElementById('travelSearchInput');
    const durationFilter = document.getElementById('durationFilter');
    const budgetFilter = document.getElementById('budgetFilter');
    const searchResults = document.getElementById('searchResults');
    
    const query = searchInput.value.toLowerCase();
    const duration = durationFilter.value;
    const budget = budgetFilter.value;
    
    // Simular resultados de búsqueda
    const mockResults = [
        {
            title: "🇯🇵 Aventura en Tokio - 7 días",
            description: "Descubre la capital de Japón con esta guía completa",
            duration: "7 días",
            budget: "€1,200",
            author: "viajero123",
            rating: 4.8
        },
        {
            title: "🇪🇸 Ruta por Andalucía - 10 días",
            description: "Sevilla, Córdoba, Granada y más",
            duration: "10 días",
            budget: "€800",
            author: "explorador_es",
            rating: 4.6
        },
        {
            title: "🇮🇹 Roma y Florencia - 5 días",
            description: "Lo mejor de Italia en una semana",
            duration: "5 días",
            budget: "€900",
            author: "italia_lover",
            rating: 4.9
        }
    ];
    
    let filteredResults = mockResults;
    
    if (query) {
        filteredResults = filteredResults.filter(result => 
            result.title.toLowerCase().includes(query) || 
            result.description.toLowerCase().includes(query)
        );
    }
    
    if (filteredResults.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No se encontraron viajes que coincidan con tu búsqueda</p>';
    } else {
        searchResults.innerHTML = filteredResults.map(result => `
            <div class="search-result-item">
                <h4>${result.title}</h4>
                <p>${result.description}</p>
                <div class="result-meta">
                    <span>⏱️ ${result.duration}</span>
                    <span>💰 ${result.budget}</span>
                    <span>👤 ${result.author}</span>
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

// Render inicial
renderDay();
