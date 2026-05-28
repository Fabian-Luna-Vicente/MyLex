import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchUsers from '../../src/pages/SearchUsers';
import { profileService } from '../../src/services/profileService';

vi.mock('../../src/services/profileService', () => ({
  profileService: {
    searchUsers: vi.fn(),
    sendFriendRequest: vi.fn(),
  }
}));

describe('SearchUsers Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and button', () => {
    render(
      <MemoryRouter>
        <SearchUsers />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('searches for users and displays results', async () => {
    profileService.searchUsers.mockResolvedValue([
      { user_id: 1, username: 'johndoe', level: 'Advanced', is_friend: false, request_status: null }
    ]);
    
    render(
      <MemoryRouter>
        <SearchUsers />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(input, { target: { value: 'john' } });
    
    // Press Enter to search
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(profileService.searchUsers).toHaveBeenCalledWith('john');
      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
  });

  it('sends friend request', async () => {
    profileService.searchUsers.mockResolvedValue([
      { user_id: 2, username: 'janedoe', level: 'Intermediate', is_friend: false, request_status: null }
    ]);
    profileService.sendFriendRequest.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <SearchUsers />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(input, { target: { value: 'jane' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('janedoe')).toBeInTheDocument();
    });

    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(profileService.sendFriendRequest).toHaveBeenCalledWith(2);
      // Status should update to pending
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('shows no users found message', async () => {
    profileService.searchUsers.mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <SearchUsers />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(input, { target: { value: 'unknown' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});
