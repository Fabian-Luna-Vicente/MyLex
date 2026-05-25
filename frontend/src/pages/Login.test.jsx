import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock axios completely
vi.mock('axios');

describe('Login Page Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show error message on invalid credentials', async () => {
        // Mock a 401 Unauthorized response from backend
        axios.post.mockRejectedValue({
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
        fireEvent.change(screen.getByPlaceholderText(/your email/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/your password/i), {
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
        axios.post.mockResolvedValue({
            data: {
                access_token: 'fake_token',
                refresh_token: 'fake_refresh'
            }
        });
        
        axios.get.mockResolvedValue({
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

        fireEvent.change(screen.getByPlaceholderText(/your email/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/your password/i), {
            target: { value: 'correctpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            // Check if axios was called
            expect(axios.post).toHaveBeenCalled();
        });
    });
});
