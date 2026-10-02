import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import UserMenu from './UserMenu';
import { useApp } from '../context/AppContext';
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
const setCurrentView = vi.fn(), logout = vi.fn().mockResolvedValue(undefined), closePublicPreview = vi.fn();
const context = { state: { language: 'es', isAuthenticated: true, currentView: 'planning', user: { username: 'yui', avatarUrl: 'https://example.com/photo.jpg' } }, setCurrentView, logout, closePublicPreview };
const setup = () => { vi.mocked(useApp).mockReturnValue(context as unknown as ReturnType<typeof useApp>); return render(<UserMenu />); };
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('shows exactly settings and logout, opens settings and closes the dropdown', async () => {
  setup(); await userEvent.click(screen.getByRole('button', { name: 'Menú de cuenta' }));
  expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  await userEvent.click(screen.getByRole('menuitem', { name: 'Ajustes' }));
  expect(setCurrentView).toHaveBeenCalledWith('settings'); expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
it('supports keyboard dismissal and returns focus to the avatar', async () => {
  setup(); const trigger = screen.getByRole('button', { name: 'Menú de cuenta' });
  await userEvent.click(trigger); expect(screen.getByRole('menuitem', { name: 'Ajustes' })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}'); expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toHaveFocus();
  await userEvent.keyboard('{Escape}'); expect(trigger).toHaveFocus(); expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
it('logs out and falls back to initials when the image fails', async () => {
  const view = setup(); fireEvent.error(view.container.querySelector('img')!); expect(screen.getByText('Y')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Menú de cuenta' }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' })); expect(logout).toHaveBeenCalledTimes(1);
});

it('closes when clicking outside the user menu', async () => {
  setup(); await userEvent.click(screen.getByRole('button', { name: 'Menú de cuenta' }));
  await userEvent.click(document.body); expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
