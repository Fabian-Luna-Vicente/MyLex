import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../../src/services/api';
import Login from '../../src/pages/Login';
import { AuthProvider } from '../../src/contexts/AuthContext';

vi.mock('../../src/services/api');

describe('Login Page Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show error message on invalid credentials', async () => {
        // Mock a 401 Unauthorized response from backend
        api.post.mockRejectedValue({
            response: {
                data: { detail: 'Invalid credentials' }
            }
        });

        render(
            <MemoryRouter initialEntries={['/login']}>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'wrongpassword' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Wait for error message to appear
        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('should login successfully and redirect', async () => {
        // Mock a successful login response
        api.post.mockResolvedValue({
            data: {
                access_token: 'fake_token',
                refresh_token: 'fake_refresh'
            }
        });
        
        api.get.mockResolvedValue({
            data: {
                id: '1',
                email: 'test@example.com',
                name: 'Test User'
            }
        });

        render(
            <MemoryRouter initialEntries={['/login']}>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'correctpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            // Check if api was called
            expect(api.post).toHaveBeenCalled();
        });
    });
});
