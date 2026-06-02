import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';
import * as useAuthHook from '../../src/hooks/useAuth';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthHook.useAuth.mockReturnValue({
      user: { full_name: 'Test User', email: 'test@example.com', avatar: null },
      logout: vi.fn()
    });
  });

  it('renders logo and basic navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('MY')).toBeInTheDocument();
    expect(screen.getByText('LEX')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('My Lists').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Statistics').length).toBeGreaterThan(0);
  });

  it('displays user profile information', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('opens community dropdown and navigates', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const communityBtn = screen.getByText('Community');
    fireEvent.click(communityBtn);

    const friendsBtn = screen.getAllByText('Friends')[0];
    expect(friendsBtn).toBeInTheDocument();

    fireEvent.click(friendsBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/friends');
  });

  it('opens profile dropdown and calls logout', () => {
    const mockLogout = vi.fn();
    useAuthHook.useAuth.mockReturnValue({
      user: { full_name: 'Test User', email: 'test@example.com' },
      logout: mockLogout
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const profileBtn = screen.getByText('Test User').closest('button');
    fireEvent.click(profileBtn);

    const logoutBtn = screen.getByText(/Log Out/i);
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
