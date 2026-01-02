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
