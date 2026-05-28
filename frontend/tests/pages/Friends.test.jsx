import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Friends from '../../src/pages/Friends';
import { profileService } from '../../src/services/profileService';

vi.mock('../../src/services/profileService', () => ({
  profileService: {
    getFriends: vi.fn(),
    getPendingRequests: vi.fn(),
    respondToRequest: vi.fn(),
  }
}));

describe('Friends Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    profileService.getFriends.mockReturnValue(new Promise(() => {})); // pending promise
    profileService.getPendingRequests.mockResolvedValue([]);
    
    const { container } = render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty states when no friends or requests', async () => {
    profileService.getFriends.mockResolvedValue([]);
    profileService.getPendingRequests.mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No friends yet')).toBeInTheDocument();
    });

    // Switch to requests tab
    fireEvent.click(screen.getByText('Requests'));
    expect(screen.getByText('No pending requests')).toBeInTheDocument();
  });

  it('renders friends list', async () => {
    profileService.getFriends.mockResolvedValue([
      { user_id: 1, username: 'testfriend', level: 'Beginner', learning_languages: ['English'] }
    ]);
    profileService.getPendingRequests.mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testfriend')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
    });
  });

  it('renders requests and allows responding', async () => {
    profileService.getFriends.mockResolvedValue([]);
    profileService.getPendingRequests.mockResolvedValue([
      { id: 10, sender_id: 2, sender_name: 'newuser' }
    ]);
    profileService.respondToRequest.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    // Switch to requests tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('Requests'));
    });
    
    expect(screen.getByText('newuser')).toBeInTheDocument();

    // Click accept (the first button in the request item)
    // We can find the buttons inside the component. We can just use the icons, but they are SVG.
    // Instead we'll grab all buttons in the request row.
    const buttons = screen.getAllByRole('button');
    // Last two buttons should be accept/reject
    const acceptBtn = buttons[buttons.length - 2];
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(profileService.respondToRequest).toHaveBeenCalledWith(10, 'accept');
    });
  });
});
