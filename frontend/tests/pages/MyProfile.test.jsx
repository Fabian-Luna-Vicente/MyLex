import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyProfile from '../../src/pages/MyProfile';
import { profileService } from '../../src/services/profileService';
import { vocabularyService } from '../../src/services/vocabularyService';

vi.mock('../../src/services/profileService', () => ({
  profileService: {
    getMyProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

vi.mock('../../src/services/vocabularyService', () => ({
  vocabularyService: {
    getUserLists: vi.fn(),
  }
}));

describe('MyProfile Page', () => {
  const mockProfile = {
    user_id: 1,
    username: 'testuser',
    bio: 'Test Bio',
    country: 'Spain',
    native_language: 'Spanish',
    learning_languages: ['English'],
    level: 'Advanced',
    avatar_url: '',
    total_words: 50,
    total_lists: 2,
    friend_count: 5
  };

  const mockLists = [
    { id: 1, name: 'List 1', language: 'English', privacy: 'public' },
    { id: 2, name: 'List 2', language: 'Spanish', privacy: 'friends' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    profileService.getMyProfile.mockResolvedValue(mockProfile);
    vocabularyService.getUserLists.mockResolvedValue(mockLists);
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    // There's a spinner, we wait for it to disappear
  });

  it('renders profile data and lists after loading', async () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test Bio')).toBeInTheDocument();
      expect(screen.getByText('Spain')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('List 1')).toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });
  });

  it('toggles edit mode and updates profile', async () => {
    profileService.updateProfile.mockResolvedValueOnce({
      ...mockProfile,
      bio: 'New Bio'
    });

    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const editBtn = screen.getByText('Edit Profile');
    fireEvent.click(editBtn);

    const bioInput = screen.getByPlaceholderText('Tell others about yourself...');
    fireEvent.change(bioInput, { target: { value: 'New Bio' } });

    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(profileService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ bio: 'New Bio' }));
    });
  });
});
