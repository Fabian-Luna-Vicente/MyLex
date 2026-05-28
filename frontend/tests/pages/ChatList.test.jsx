import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChatList from '../../src/pages/ChatList';
import { chatService } from '../../src/services/chatService';

vi.mock('../../src/services/chatService', () => ({
  chatService: {
    getRooms: vi.fn(),
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

// Mock modals to verify they are rendered
vi.mock('../../src/components/chat/CreateChatModal', () => ({
  default: ({ onClose }) => <div data-testid="create-chat-modal"><button onClick={onClose}>Close Create</button></div>
}));

vi.mock('../../src/components/chat/AIPersonasModal', () => ({
  default: ({ onClose }) => <div data-testid="ai-personas-modal"><button onClick={onClose}>Close Personas</button></div>
}));

describe('ChatList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    chatService.getRooms.mockReturnValue(new Promise(() => {})); 
    
    const { container } = render(
      <MemoryRouter>
        <ChatList />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no chats', async () => {
    chatService.getRooms.mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <ChatList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });
  });

  it('renders list of rooms', async () => {
    chatService.getRooms.mockResolvedValue([
      { id: 1, name: 'Practice English', is_ai_chat: true, participants: [{ is_ai: true }] },
      { id: 2, name: 'Chat with Bob', is_ai_chat: false, participants: [{}] }
    ]);
    
    render(
      <MemoryRouter>
        <ChatList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Practice English')).toBeInTheDocument();
      expect(screen.getByText('Chat with Bob')).toBeInTheDocument();
      expect(screen.getByText('AI INSIDE')).toBeInTheDocument();
    });
  });

  it('navigates to room on click', async () => {
    chatService.getRooms.mockResolvedValue([
      { id: 1, name: 'Practice English' }
    ]);
    
    render(
      <MemoryRouter>
        <ChatList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Practice English')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Practice English'));
    expect(mockNavigate).toHaveBeenCalledWith('/chat/1');
  });

  it('opens and closes modals', async () => {
    chatService.getRooms.mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <ChatList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    // Open AI Personas Modal
    fireEvent.click(screen.getByText(/AI Menu/i));
    expect(screen.getByTestId('ai-personas-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Personas'));
    expect(screen.queryByTestId('ai-personas-modal')).not.toBeInTheDocument();

    // Open Custom Chat Modal
    fireEvent.click(screen.getByText(/Custom Chat/i));
    expect(screen.getByTestId('create-chat-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Create'));
    expect(screen.queryByTestId('create-chat-modal')).not.toBeInTheDocument();
  });
});
