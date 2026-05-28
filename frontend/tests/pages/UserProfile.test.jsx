import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserProfile from '../../src/pages/UserProfile';
import { profileService } from '../../src/services/profileService';
import { vocabularyService } from '../../src/services/vocabularyService';

vi.mock('../../src/services/profileService', () => ({
  profileService: {
    getUserProfile: vi.fn(),
    sendFriendRequest: vi.fn(),
    removeFriend: vi.fn(),
  }
}));

vi.mock('../../src/services/vocabularyService', () => ({
  vocabularyService: {
    getUserLists: vi.fn(),
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    profileService.getUserProfile.mockReturnValue(new Promise(() => {})); 
    vocabularyService.getUserLists.mockResolvedValue([]);
    
    const { container } = render(
      <MemoryRouter initialEntries={['/user/1']}>
        <Routes>
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders user not found', async () => {
    profileService.getUserProfile.mockResolvedValue(null);
    vocabularyService.getUserLists.mockResolvedValue([]);
    
    render(
      <MemoryRouter initialEntries={['/user/1']}>
        <Routes>
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('renders profile data and lists', async () => {
    profileService.getUserProfile.mockResolvedValue({
      id: 1, username: 'charlie', level: 'Beginner', is_friend: false, request_status: null,
      total_words: 10, total_lists: 1, friend_count: 0,
      native_language: 'Spanish', learning_languages: ['English']
    });
    vocabularyService.getUserLists.mockResolvedValue([
      { id: 1, name: 'Public List 1', privacy: 'public', language: 'English' }
    ]);
    
    render(
      <MemoryRouter initialEntries={['/user/1']}>
        <Routes>
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('charlie')).toBeInTheDocument();
      expect(screen.getByText('Public List 1')).toBeInTheDocument();
      expect(screen.getByText('Add Friend')).toBeInTheDocument();
    });
  });

  it('sends friend request', async () => {
    profileService.getUserProfile.mockResolvedValue({
      id: 1, username: 'charlie', level: 'Beginner', is_friend: false, request_status: null,
      total_words: 0, total_lists: 0, friend_count: 0
    });
    vocabularyService.getUserLists.mockResolvedValue([]);
    profileService.sendFriendRequest.mockResolvedValue({});
    
    render(
      <MemoryRouter initialEntries={['/user/1']}>
        <Routes>
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('charlie')).toBeInTheDocument();
    });

    const addBtn = screen.getByText('Add Friend');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(profileService.sendFriendRequest).toHaveBeenCalledWith('1');
      expect(screen.getByText(/Request Pending/i)).toBeInTheDocument();
    });
  });
});
