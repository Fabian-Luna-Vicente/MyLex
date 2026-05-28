import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../src/pages/ForgotPassword';
import { authService } from '../../src/services/authService';

vi.mock('../../src/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
  }
}));

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows success message on successful request', async () => {
    authService.forgotPassword.mockResolvedValueOnce({ detail: 'Email sent' });
    
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('hello@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Email sent')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to login/i })).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    authService.forgotPassword.mockRejectedValueOnce({
      response: { data: { detail: 'User not found' } }
    });
    
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('hello@example.com'), { target: { value: 'wrong@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
