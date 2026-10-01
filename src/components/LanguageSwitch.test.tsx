import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ObjectsView from './ObjectsView';
import ActivityModal from './modals/ActivityModal';
import type { Language } from '../types';

const context = vi.hoisted(() => ({ state: { language: 'es' as Language, trips: [], activeTripId: '', days: [], currentDay: 0, publicPreview: false }, addActivity: vi.fn(), updateActivity: vi.fn() }));
vi.mock('../context/AppContext', () => ({ useApp: () => context }));
beforeEach(() => { context.state.language = 'es'; vi.clearAllMocks(); });
afterEach(cleanup);

it.each([
  ['en', 'Phone charger'], ['fr', 'Chargeur de téléphone'], ['de', 'Handyladegerät'],
  ['zh', '手机充电器'], ['ru', 'Зарядка для телефона'], ['ja', 'スマートフォンの充電器']
] as const)('switches packing labels to %s without losing checked items', (language, charger) => {
  const view = render(<ObjectsView />);
  const checkbox = screen.getAllByRole('checkbox')[0];
  fireEvent.click(checkbox);
  context.state.language = language;
  view.rerender(<ObjectsView />);
  expect(screen.getByText(charger)).toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  expect(screen.queryByText('Cargador del teléfono')).not.toBeInTheDocument();
});

it('updates an already visible validation error and currency names in an open modal', () => {
  const view = render(<ActivityModal onClose={vi.fn()} />);
  fireEvent.submit(view.container.querySelector('form')!);
  expect(screen.getByRole('alert')).toHaveTextContent('Por favor completa');
  context.state.language = 'ja';
  view.rerender(<ActivityModal onClose={vi.fn()} />);
  expect(screen.getByRole('heading', { name: 'アクティビティを追加' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('必須項目を正しく入力してください。');
  expect(screen.getByRole('option', { name: /USD.*米ドル/ })).toBeInTheDocument();
  expect(context.addActivity).not.toHaveBeenCalled();
});
