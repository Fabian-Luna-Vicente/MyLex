import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../../src/pages/ResetPassword';
import { authService } from '../../src/services/authService';

vi.mock('../../src/services/authService', () => ({
  authService: {
    resetPassword: vi.fn(),
  }
}));

describe('ResetPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );
    expect(screen.getByText('Invalid or missing password reset token.')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <ResetPassword />
      </MemoryRouter>
    );
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'password123' } });
    fireEvent.change(inputs[1], { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('shows error when password is too short', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <ResetPassword />
      </MemoryRouter>
    );
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'short' } });
    fireEvent.change(inputs[1], { target: { value: 'short' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });

  it('submits successfully and shows success message', async () => {
    authService.resetPassword.mockResolvedValueOnce({ detail: 'Password reset successfully!' });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <ResetPassword />
      </MemoryRouter>
    );
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'newpassword' } });
    fireEvent.change(inputs[1], { target: { value: 'newpassword' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('valid-token', 'newpassword');
      expect(screen.getByText('Password reset successfully!')).toBeInTheDocument();
    });
  });
});
