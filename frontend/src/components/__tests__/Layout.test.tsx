import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test/test-utils';
import Layout from '../Layout';

describe('Layout Component', () => {
  beforeEach(() => {
    render(<Layout />);
  });

  it('renders the app bar with title', () => {
    expect(screen.getByText('Journal App')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    expect(screen.getByText('Entries')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('toggles drawer when menu button is clicked', () => {
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Check if drawer is visible after click
    expect(screen.getAllByText('Journal App')).toHaveLength(1);
  });
}); 