/**
 * Map Module
 * Handles Leaflet map initialization and markers
 */

const MapManager = {
    map: null,
    currentMarker: null,
    currentPolyline: null,
    accommodationMarker: null,
    redIcon: null,
    accommodationIcon: null,

    /**
     * Initialize the map
     * @param {string} containerId - Map container element ID
     * @param {number[]} initialCoords - Initial [lat, lng] coordinates
     */
    init(containerId, initialCoords) {
        this.map = L.map(containerId).setView(initialCoords, Config.MAP.DEFAULT_ZOOM);

        L.tileLayer(Config.MAP.TILE_URL, {
            attribution: Config.MAP.ATTRIBUTION
        }).addTo(this.map);

        // Initialize custom icons
        this.redIcon = L.icon({
            iconUrl: 'img/marker-icon-red.png',
            shadowUrl: 'img/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        this.accommodationIcon = L.divIcon({
            className: 'accommodation-marker',
            html: '<div class="accommodation-marker-inner"></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -30]
        });
    },

    /**
     * Clear all markers and polylines
     */
    clearAll() {
        this.clearMarker();
        this.clearPolyline();
        this.clearAccommodationMarker();
    },

    /**
     * Clear current activity marker(s)
     */
    clearMarker() {
        if (this.currentMarker) {
            if (Array.isArray(this.currentMarker)) {
                this.currentMarker.forEach(m => this.map.removeLayer(m));
            } else {
                this.map.removeLayer(this.currentMarker);
            }
            this.currentMarker = null;
        }
    },

    /**
     * Clear current polyline
     */
    clearPolyline() {
        if (this.currentPolyline) {
            this.map.removeLayer(this.currentPolyline);
            this.currentPolyline = null;
        }
    },

    /**
     * Clear accommodation marker
     */
    clearAccommodationMarker() {
        if (this.accommodationMarker) {
            this.map.removeLayer(this.accommodationMarker);
            this.accommodationMarker = null;
        }
    },

    /**
     * Add an activity marker
     * @param {number[]} coordinates - [lat, lng]
     * @param {boolean} centerMap - Whether to center map on marker
     */
    addActivityMarker(coordinates, centerMap = true) {
        this.clearMarker();
        this.clearPolyline();

        this.currentMarker = L.marker(coordinates, { icon: this.redIcon }).addTo(this.map);

        if (centerMap) {
            this.map.setView(coordinates, Config.MAP.DETAIL_ZOOM);
        }
    },

    /**
     * Add accommodation marker
     * @param {number[]} coordinates - [lat, lng]
     * @param {string} name - Accommodation name
     */
    addAccommodationMarker(coordinates, name) {
        this.clearAccommodationMarker();

        this.accommodationMarker = L.marker(coordinates, { icon: this.accommodationIcon })
            .addTo(this.map)
            .bindPopup(`<strong>${Utils.sanitizeHTML(name)}</strong><br>Donde dormimos esta noche`);
    },

    /**
     * Show transfer route between two points
     * @param {number[][]} coordinates - [[lat1, lng1], [lat2, lng2]]
     */
    showTransferRoute(coordinates) {
        this.clearMarker();
        this.clearPolyline();

        const [from, to] = coordinates;

        this.currentPolyline = L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

        const markerA = L.marker(from, { icon: this.redIcon }).addTo(this.map);
        const markerB = L.marker(to, { icon: this.redIcon }).addTo(this.map);
        this.currentMarker = [markerA, markerB];

        this.map.fitBounds(this.currentPolyline.getBounds());
    },

    /**
     * Set map view to coordinates
     * @param {number[]} coordinates - [lat, lng]
     * @param {number} zoom - Zoom level
     */
    setView(coordinates, zoom = Config.MAP.DEFAULT_ZOOM) {
        this.map.setView(coordinates, zoom);
    },

    /**
     * Invalidate map size (call after container resize)
     */
    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
};
