// Clonamos la variable global 'days' (de data.js) para no modificarla directamente
let daysData = JSON.parse(JSON.stringify(days));
let currentDay = 0;

// Referencias al DOM
const dayTitleEl = document.getElementById('dayTitle');
const activityListEl = document.getElementById('activityList');

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
                if (dist < 1000) {
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
              <label class="activity-checkbox-label">
                <input type="checkbox" class="activity-checkbox" ${act.isDone ? 'checked' : ''} data-day="${currentDay}" data-activity="${day.activities.indexOf(act)}">
                <strong>${act.time || 'Sin hora'}</strong> - ${act.name}${isOptional ? ' <span class="optional-badge">(Opcional)</span>' : ''}
              </label>
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
                
                li.addEventListener('click', () => {
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

// Exportar JSON para copiar
document.getElementById('exportBtn').addEventListener('click', () => {
    const jsonStr = JSON.stringify(daysData, null, 2);
    prompt('Copia el JSON y pégalo en tu data.js:', jsonStr);
});

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

// Render inicial
renderDay();
