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

    // Generar lista de actividades + traslados automáticos
    const activitiesWithTransfers = [];
    for (let i = 0; i < day.activities.length; i++) {
        const current = day.activities[i];
        activitiesWithTransfers.push(current);

        const next = day.activities[i + 1];
        if (next) {
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
        li.className = 'activity-item';

        if (act.isTransfer) {
            li.innerHTML = `
        <em>Traslado automático:</em> De <strong>${act.from}</strong> a <strong>${act.to}</strong> (${act.distance} km)<br>
        <button class="open-gmaps-btn" style="margin-top:5px;">Ir en Google Maps</button>
      `;
            const gmapsBtn = li.querySelector('.open-gmaps-btn');
            gmapsBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent triggering the li click event
                const [from, to] = act.coordinates;
                const url = `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=transit`;
                window.open(url, '_blank');
            });
            li.addEventListener('click', () => {
                // Eliminar marcador o línea anteriores
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

                // Dibujar línea azul
                currentPolyline = L.polyline(act.coordinates, { color: 'blue' }).addTo(map);

                // Añadir dos marcadores rojos (origen y destino)
                const [from, to] = act.coordinates;
                const markerA = L.marker(from, { icon: redIcon }).addTo(map);
                const markerB = L.marker(to, { icon: redIcon }).addTo(map);
                currentMarker = [markerA, markerB];

                // Ajustar vista del mapa
                map.fitBounds(currentPolyline.getBounds());
            });

        } else {
            li.innerHTML = `
        <strong>${act.time}</strong> - ${act.name}
        <div class="activity-details" id="details-${i}" style="display:none;">
          <p>${act.description}</p>
          ${act.importantInfo ? `<p class="important-info">${act.importantInfo}</p>` : ''}
          ${act.price ? `<p class="price-info"><strong>Precio:</strong> ${act.price}</p>` : ''}
        </div>
      `;
            li.addEventListener('click', () => {
                [...activityListEl.querySelectorAll('.activity-details')].forEach(d => d.style.display = 'none');
                const detailEl = document.getElementById(`details-${i}`);
                if (detailEl) {
                    detailEl.style.display = detailEl.style.display === 'block' ? 'none' : 'block';
                }

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
            });
        }

        activityListEl.appendChild(li);
    });

    // Centrar mapa en la primera actividad si existe
    const firstRealAct = day.activities[0];
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

// Manejar envío del formulario de actividad
activityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const time = activityForm.time.value;
    const name = activityForm.name.value.trim();
    const description = activityForm.description.value.trim();
    const importantInfo = activityForm.importantInfo.value.trim();
    const price = activityForm.price.value.trim();
    const lat = parseFloat(activityForm.lat.value);
    const lng = parseFloat(activityForm.lng.value);

    if (!time || !name || !description || isNaN(lat) || isNaN(lng)) {
        alert('Por favor completa todos los campos correctamente.');
        return;
    }

    daysData[currentDay].activities.push({
        time,
        name,
        description,
        importantInfo: importantInfo || null,
        price: price || null,
        coordinates: [lat, lng]
    });

    modal.style.display = 'none';
    renderDay();
});

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

// Render inicial
renderDay();
