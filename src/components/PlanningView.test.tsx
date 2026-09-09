import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlanningView from './PlanningView';

const app = vi.hoisted(() => ({
  state: {
    trips: [{
      id: 'trip-1',
      currency: 'EUR',
      capabilities: { canEdit: true, canManageMembers: true, canDelete: true }
    }],
    activeTripId: 'trip-1',
    days: [] as Array<{ title: string; activities: [] }>,
    currentDay: 0,
    language: 'es',
    publicPreview: false
  },
  setCurrentDay: vi.fn(),
  addDay: vi.fn(),
  moveDay: vi.fn(),
  deleteActivity: vi.fn(),
  toggleActivityDone: vi.fn(),
  getAccommodationsForDay: vi.fn(() => [])
}));

vi.mock('../context/AppContext', () => ({
  useApp: () => app
}));

vi.mock('../hooks/usePlanningMap', () => ({
  usePlanningMap: () => ({ current: null })
}));

describe('PlanningView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    app.state.days = [];
  });

  it('only offers adding a day when the trip has no days', () => {
    render(<PlanningView />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName('Añadir día');
    expect(screen.queryByText('Listar días')).not.toBeInTheDocument();
    expect(screen.queryByText('Añadir actividad')).not.toBeInTheDocument();
    expect(screen.queryByText('Añadir alojamiento')).not.toBeInTheDocument();
  });

  it('restores day-dependent actions once a day exists', () => {
    app.state.days = [{ title: 'Llegada', activities: [] }];

    render(<PlanningView />);

    expect(screen.getByRole('button', { name: 'Listar días' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Añadir actividad' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Añadir alojamiento' }).length).toBeGreaterThan(0);
  });
});