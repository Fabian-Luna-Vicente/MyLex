import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VerifyEmail from '../../src/pages/VerifyEmail';
import * as useAuthHook from '../../src/hooks/useAuth';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('VerifyEmail Page', () => {
  const mockVerifyEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthHook.useAuth.mockReturnValue({
      verifyEmail: mockVerifyEmail
    });
  });

  it('shows error if no token is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('No verification token provided.')).toBeInTheDocument();
    });
  });

  it('shows success message on successful verification', async () => {
    mockVerifyEmail.mockResolvedValueOnce({ success: true, message: 'Email verified successfully.' });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=valid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );
    
    // Initially shows verifying
    expect(screen.getByText('Verifying Email...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('valid-token');
      expect(screen.getByText('Verified!')).toBeInTheDocument();
      expect(screen.getByText('Email verified successfully.')).toBeInTheDocument();
    });
  });

  it('shows error message on failed verification', async () => {
    mockVerifyEmail.mockResolvedValueOnce({ success: false, message: 'Invalid or expired token.' });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=invalid-token']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('invalid-token');
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or expired token.')).toBeInTheDocument();
    });
  });
});
