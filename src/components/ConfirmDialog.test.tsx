import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

vi.mock('../context/AppContext', () => ({ useApp: () => ({ state: { language: 'es', error: null } }) }));
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(cleanup);

it('focuses cancel, blocks duplicate deletion and prevents dismissal while saving', async () => {
  let finish!: () => void;
  const onConfirm = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const onCancel = vi.fn();
  render(<ConfirmDialog open message="¿Borrar viaje?" confirmLabel="Borrar" cancelLabel="Cancelar" onConfirm={onConfirm} onCancel={onCancel} />);
  expect(screen.getByText('Cancelar')).toHaveFocus();
  fireEvent.click(screen.getByText('Borrar'));
  fireEvent.click(screen.getByText('Borrar'));
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onCancel).not.toHaveBeenCalled();
  expect(screen.getByText('Cancelar')).toBeDisabled();
  await act(async () => finish());
  expect(screen.getByText('Borrar')).toBeEnabled();
});

it('restores focus to the opening control after cancellation', () => {
  const trigger = document.createElement('button');
  document.body.append(trigger); trigger.focus();
  const props = { message: '¿Borrar?', confirmLabel: 'Borrar', cancelLabel: 'Cancelar', onConfirm: vi.fn(), onCancel: vi.fn() };
  const { rerender } = render(<ConfirmDialog open {...props} />);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(props.onCancel).toHaveBeenCalledOnce();
  rerender(<ConfirmDialog open={false} {...props} />);
  expect(trigger).toHaveFocus(); trigger.remove();
});
