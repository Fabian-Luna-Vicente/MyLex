import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../src/pages/Settings';
import { profileService } from '../../src/services/profileService';
import * as useAuthHook from '../../src/hooks/useAuth';

vi.mock('../../src/services/profileService', () => ({
  profileService: {
    getMyProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Settings Page', () => {
  const mockLogout = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthHook.useAuth.mockReturnValue({
      user: { full_name: 'Settings User', email: 'settings@example.com' },
      logout: mockLogout
    });
    profileService.getMyProfile.mockResolvedValue({ ai_language: 'es' });
    profileService.updateProfile.mockResolvedValue({});
  });

  it('renders settings and loads initial language', async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Settings User')).toBeInTheDocument();

    await waitFor(() => {
      // The select should have 'es' as value
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('es');
    });
  });

  it('changes language and calls updateProfile', async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(profileService.getMyProfile).toHaveBeenCalled();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en' } });

    await waitFor(() => {
      expect(profileService.updateProfile).toHaveBeenCalledWith({ ai_language: 'en' });
      expect(select.value).toBe('en');
    });
  });

  it('logs out when logout button is clicked', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByText('LOG OUT');
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to profile when View Profile is clicked', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const profileBtn = screen.getByText('View Profile');
    fireEvent.click(profileBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
