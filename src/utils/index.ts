import { Day, Accommodation } from '../types';

/**
 * Utility Functions
 */

/**
 * Calculate Haversine distance between two coordinates
 */
export const haversineDistance = (coords1: [number, number], coords2: [number, number]): number => {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if coordinates are valid
 */
export const isValidCoordinates = (coords: unknown): coords is [number, number] => {
  return coords !== null &&
    coords !== undefined &&
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]);
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number | string | undefined, currency: string = 'EUR'): string => {
  return `${parseFloat(String(price || 0)).toFixed(2)} ${currency}`;
};

/**
 * Format day range
 */
export const formatDayRange = (fromDay: number, toDay: number): string => {
  if (fromDay === toDay) {
    return `Día ${fromDay + 1}`;
  }
  return `Días ${fromDay + 1} - ${toDay + 1}`;
};

/**
 * Calculate number of nights
 */
export const calculateNights = (fromDay: number, toDay: number): number => {
  return toDay - fromDay + 1;
};

/**
 * Get activity type icon
 */
export const getActivityTypeIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    normal: '📌',
    vuelo: '✈️',
    transporte: '🚆',
    comida: '🍽️',
    visita: '🏛️'
  };
  return icons[type || 'normal'] || '📌';
};

/**
 * Create Google Maps directions URL
 */
export const createGoogleMapsUrl = (
  origin: [number, number] | null,
  destination: [number, number],
  travelMode: string = 'transit'
): string => {
  let url = 'https://www.google.com/maps/dir/?api=1';

  if (origin) {
    url += `&origin=${encodeURIComponent(origin[0])},${encodeURIComponent(origin[1])}`;
  }

  url += `&destination=${encodeURIComponent(destination[0])},${encodeURIComponent(destination[1])}`;
  url += `&travelmode=${travelMode}`;

  return url;
};

/**
 * Get shopping category icon
 */
export const getShoppingCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    transporte: '🚆',
    entradas: '🎟️',
    electronica: '📱',
    documentos: '📄',
    otros: '📦'
  };
  return icons[category] || '📦';
};

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

interface PrintLabels {
  title: string;
  day: string;
  activities: string;
  optionalActivities: string;
  accommodation: string;
  noAccommodation: string;
  importantInfo: string;
  noTime: string;
  tripName: string;
}

/**
 * Build a clean, text-only printable view of the full itinerary and trigger print.
 * Intentionally omits icons, maps and images.
 */
export const printItinerary = (
  days: Day[],
  accommodations: Accommodation[],
  labels: PrintLabels
): void => {
  const accommodationsForDay = (dayIndex: number) =>
    accommodations.filter(acc => dayIndex >= acc.fromDay && dayIndex <= acc.toDay);

  const renderActivity = (a: { time: string; name: string; description: string; importantInfo?: string; price?: string | number; currency?: string; isOptional?: boolean }) => {
    const time = a.time ? escapeHtml(a.time) : escapeHtml(labels.noTime);
    const parts: string[] = [];
    parts.push(`<div class="time">${time}</div>`);
    const detailsLines: string[] = [];
    detailsLines.push(`<div class="name">${escapeHtml(a.name)}</div>`);
    if (a.description) {
      detailsLines.push(`<div class="desc">${escapeHtml(a.description)}</div>`);
    }
    if (a.importantInfo) {
      detailsLines.push(`<div class="important">${escapeHtml(labels.importantInfo)}: ${escapeHtml(a.importantInfo)}</div>`);
    }
    if (a.price) {
      detailsLines.push(`<div class="price">${escapeHtml(String(a.price))} ${escapeHtml(a.currency || 'EUR')}</div>`);
    }
    parts.push(`<div class="details">${detailsLines.join('')}</div>`);
    return `<li class="activity">${parts.join('')}</li>`;
  };

  const daysHtml = days.map((day, dayIndex) => {
    const normalActivities = day.activities.filter(a => !a.isOptional);
    const optionalActivities = day.activities.filter(a => a.isOptional);
    const dayAccommodations = accommodationsForDay(dayIndex);

    const sections: string[] = [];

    if (normalActivities.length > 0) {
      sections.push(`
        <h3>${escapeHtml(labels.activities)}</h3>
        <ul class="activities">
          ${normalActivities.map(renderActivity).join('')}
        </ul>
      `);
    }

    if (optionalActivities.length > 0) {
      sections.push(`
        <h3>${escapeHtml(labels.optionalActivities)}</h3>
        <ul class="activities">
          ${optionalActivities.map(renderActivity).join('')}
        </ul>
      `);
    }

    sections.push(`
      <h3>${escapeHtml(labels.accommodation)}</h3>
      ${dayAccommodations.length === 0
        ? `<p class="empty">${escapeHtml(labels.noAccommodation)}</p>`
        : `<ul class="accommodations">${dayAccommodations
            .map(acc => `<li>${escapeHtml(acc.name)}</li>`)
            .join('')}</ul>`}
    `);

    return `
      <section class="day">
        <h2>${escapeHtml(labels.day)} ${dayIndex + 1}: ${escapeHtml(day.title)}</h2>
        ${sections.join('')}
      </section>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)} - ${escapeHtml(labels.tripName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #000;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      line-height: 1.5;
      font-size: 12pt;
    }
    h1 {
      font-size: 22pt;
      margin: 0 0 4px 0;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }
    .trip-name {
      font-size: 14pt;
      margin: 0 0 24px 0;
      color: #333;
    }
    .day {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    h2 {
      font-size: 15pt;
      margin: 24px 0 8px 0;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 12pt;
      margin: 16px 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .activity {
      display: flex;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px dotted #999;
    }
    .activity:last-child { border-bottom: none; }
    .time {
      flex: 0 0 60px;
      font-weight: bold;
      font-variant-numeric: tabular-nums;
    }
    .details { flex: 1; }
    .name { font-weight: bold; }
    .desc { margin-top: 2px; }
    .important {
      margin-top: 4px;
      font-style: italic;
    }
    .price {
      margin-top: 4px;
      font-size: 10pt;
    }
    .accommodations li {
      padding: 4px 0;
    }
    .empty {
      font-style: italic;
      color: #555;
      margin: 4px 0;
    }
    .print-actions {
      margin-bottom: 24px;
      text-align: right;
    }
    .print-actions button {
      font-family: inherit;
      font-size: 11pt;
      padding: 8px 16px;
      cursor: pointer;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
    }
    @media print {
      .print-actions { display: none; }
      body { padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">${escapeHtml(labels.title)}</button>
  </div>
  <h1>${escapeHtml(labels.title)}</h1>
  <p class="trip-name">${escapeHtml(labels.tripName)}</p>
  ${daysHtml}
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    setTimeout(() => printWindow.print(), 100);
  };
};
