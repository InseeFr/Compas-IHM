// tests/header.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../src/components/Header';
import NavBarLayout from '../src/pages/NavBarLayout';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Header et NavBar', () => {
  const toggleDarkMode = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    toggleDarkMode.mockReset();

    vi.mock('@tanstack/react-router', async () => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ to, children }: any) => <a href={to}>{children}</a>,
      };
    });
  });

  it('affiche correctement le header', () => {
    render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);

    expect(screen.getByTestId('header')).toBeVisible();
    expect(screen.getByTestId('header-logo')).toBeVisible();
    expect(screen.getByTestId('header-title')).toHaveTextContent('COMPAS');
  });

  it('redirige vers la home au clic sur le titre', async () => {
    render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);
    const title = screen.getByTestId('header-title');

    await user.click(title);

    expect(title.closest('a')).toHaveAttribute('href', '/');
  });

  it('ouvre un menu déroulant de la NavBar et clique sur un sous-item', async () => {
    render(<NavBarLayout />);
    const mainButton = screen.getByRole('button', { name: 'Indicateurs' });

    await user.click(mainButton);

    const subItem = await screen.findByText('Devops');
    expect(subItem).toBeVisible();

    await user.click(subItem);
    expect(subItem.closest('a')).toHaveAttribute('href', '/indicateur/devopsTable');
  });

  it('le bouton dark mode est cliquable', async () => {
    render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);
    const button = screen.getByTestId('toggle-darkmode');

    await user.click(button);
    expect(toggleDarkMode).toHaveBeenCalled();
  });
});
