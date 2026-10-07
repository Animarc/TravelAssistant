import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { usePlanningMap } from './usePlanningMap';
import type { Day, Accommodation } from '../types';
const mocks = vi.hoisted(() => ({ line: vi.fn(), marker: vi.fn(), popup: vi.fn(), fit: vi.fn(), zoom: vi.fn() }));
vi.mock('leaflet', () => ({ default: {
  map: () => ({ setView() { return this; }, eachLayer: vi.fn(), fitBounds: mocks.fit, invalidateSize: vi.fn(), remove: vi.fn() }),
  control: { zoom: (...args: unknown[]) => { mocks.zoom(...args); return { addTo() { return this; }, remove: vi.fn() }; } },
  tileLayer: () => ({ addTo: vi.fn() }), divIcon: vi.fn(), Marker: class {}, Polyline: class {},
  marker: (...args: unknown[]) => { mocks.marker(...args); return { addTo() { return this; }, bindPopup: mocks.popup }; },
  polyline: (...args: unknown[]) => { mocks.line(...args); return { addTo: vi.fn() }; }
} }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const accommodations: Accommodation[] = [];
function Map({ day }: { day: Day }) { const ref = usePlanningMap(day, accommodations, 'ja'); return <div ref={ref} />; }
const transport = { time: '', name: 'フライト', description: '', type: 'transporte' as const, transportMode: 'plane' as const, startCoordinates: [35, 139] as [number,number], endCoordinates: [41, 2] as [number,number] };
it('draws both transport endpoints and their connecting line with Japanese labels', () => {
  render(<Map day={{ title: '', activities: [transport] }} />);
  expect(mocks.zoom).toHaveBeenCalledWith({ zoomInTitle: '地図を拡大', zoomOutTitle: '地図を縮小' });
  expect(mocks.marker.mock.calls.map(call => call[0])).toEqual([[35,139],[41,2]]);
  expect(mocks.line).toHaveBeenCalledWith([[35,139],[41,2]], expect.objectContaining({ dashArray: '8 6' }));
  expect(mocks.popup.mock.calls[0][0].textContent).toContain('出発地');
  expect(mocks.popup.mock.calls[1][0].textContent).toContain('到着地');
});
it('does not invent a route when its origin is absent', () => {
  render(<Map day={{ title: '', activities: [{ ...transport, startCoordinates: undefined, coordinates: [41,2] }] }} />);
  expect(mocks.line).not.toHaveBeenCalled();
  expect(mocks.marker).toHaveBeenCalledTimes(1);
});
