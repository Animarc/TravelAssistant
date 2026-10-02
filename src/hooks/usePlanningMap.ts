import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Accommodation, Day, Language } from '../types';
import { isValidCoordinates } from '../utils';
import { translations } from '../i18n/translations';

const activityPopup = (name: string, description: string) => {
  const content = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = name;
  content.append(title);
  if (description) content.append(document.createElement('br'), document.createTextNode(description));
  return content;
};

const accommodationPopup = (name: string) => {
  const title = document.createElement('strong');
  title.textContent = `⌂ ${name}`;
  return title;
};

export const usePlanningMap = (day: Day | undefined, accommodations: Accommodation[], language: Language = 'es') => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = mapRef.current;
    if (container && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(container).setView([35.6762, 139.6503], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(mapInstanceRef.current);
    }

    let resizeFrame: number | null = null;
    const refresh = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => mapInstanceRef.current?.invalidateSize());
    };
    const observer = container && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null;
    if (container) { observer?.observe(container); window.addEventListener('resize', refresh); refresh(); }

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', refresh);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.eachLayer(layer => { if (layer instanceof L.Marker || layer instanceof L.Polyline) map.removeLayer(layer); });
    const bounds: L.LatLngTuple[] = [];

    day?.activities.forEach((activity, index) => {
      if ((activity.type === 'transporte' || activity.type === 'vuelo') && isValidCoordinates(activity.startCoordinates) && isValidCoordinates(activity.endCoordinates)) {
        const start = activity.startCoordinates as L.LatLngTuple;
        const end = [...activity.endCoordinates!] as L.LatLngTuple;
        while (end[1] - start[1] > 180) end[1] -= 360;
        while (end[1] - start[1] < -180) end[1] += 360;
        bounds.push(start, end);
        L.polyline([start, end], { color: '#d47752', weight: 3, dashArray: activity.transportMode === 'plane' ? '8 6' : undefined }).addTo(map);
        for (const [label, point, suffix] of [[translations[language].transportOrigin, start, 'A'], [translations[language].transportDestination, end, 'B']] as const) {
          const icon = L.divIcon({ className: 'activity-marker', html: `<div class="activity-marker-inner">${index + 1}${suffix}</div>`, iconSize: [30, 30] });
          L.marker(point, { icon }).addTo(map).bindPopup(activityPopup(`${activity.name} · ${label}`, activity.description));
        }
        return;
      }
      if (!isValidCoordinates(activity.coordinates)) return;
      const point = activity.coordinates as [number, number];
      bounds.push(point);
      const icon = L.divIcon({ className: 'activity-marker', html: `<div class="activity-marker-inner">${index + 1}</div>`, iconSize: [30, 30] });
      L.marker(point, { icon }).addTo(map).bindPopup(activityPopup(activity.name, activity.description));
    });

    accommodations.forEach(accommodation => {
      if (!isValidCoordinates(accommodation.coordinates)) return;
      const point = accommodation.coordinates as [number, number];
      bounds.push(point);
      const icon = L.divIcon({ className: 'accommodation-marker', html: '<div class="accommodation-marker-inner"></div>', iconSize: [36, 36] });
      L.marker(point, { icon }).addTo(map).bindPopup(accommodationPopup(accommodation.name));
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [accommodations, day, language]);

  return mapRef;
};
