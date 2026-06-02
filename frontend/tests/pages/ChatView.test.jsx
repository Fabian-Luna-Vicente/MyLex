import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChatView from '../../src/pages/ChatView';
import * as useAuthHook from '../../src/hooks/useAuth';
import * as useChatViewHook from '../../src/hooks/useChatView';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));
vi.mock('../../src/hooks/useChatView', () => ({
  useChatView: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChatView Page', () => {
  const mockChatViewState = {
    room: { id: 1, name: 'Test Room', participants: [{ id: 1, is_ai: false, user_id: 1, name_display: 'Alice' }] },
    messages: [
      { content: 'Hello', participant: { user_id: 1, name_display: 'Alice' }, created_at: '2026-05-28T10:00:00Z' },
      { content: 'Hi Alice', participant: { user_id: 2, name_display: 'Bob' }, created_at: '2026-05-28T10:01:00Z' }
    ],
    vocabData: [],
    input: '',
    setInput: vi.fn(),
    loading: false,
    sending: false,
    isRecording: false,
    loadingIcebreaker: false,
    showVocabPanel: false,
    setShowVocabPanel: vi.fn(),
    showListSelector: false,
    setShowListSelector: vi.fn(),
    messagesEndRef: { current: { scrollIntoView: vi.fn() } },
    handleSend: vi.fn(),
    toggleRecording: vi.fn(),
    speak: vi.fn(),
    handleLinkList: vi.fn(),
    handleIcebreaker: vi.fn(),
    handleUpdateRoomInfo: vi.fn(),
    handleLeaveRoom: vi.fn(),
    handleGrammarCheck: vi.fn(),
    checkingGrammar: false,
    grammarResult: null,
    setGrammarResult: vi.fn(),
    lists: [],
    interimResult: '',
    speechStatus: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthHook.useAuth.mockReturnValue({ user: { id: 1 } });
    useChatViewHook.useChatView.mockReturnValue(mockChatViewState);

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders loading state', () => {
    useChatViewHook.useChatView.mockReturnValue({ ...mockChatViewState, loading: true });
    const { container } = render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders room name and messages', () => {
    render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi Alice')).toBeInTheDocument();
  });

  it('handles input and send', () => {
    render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'New Message', selectionStart: 11 } });

    expect(mockChatViewState.setInput).toHaveBeenCalledWith('New Message');

    // Instead of finding exact button, just test if pressing Enter works.
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockChatViewState.handleSend).toHaveBeenCalled();
  });

  it('toggles room info panel', () => {
    render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );

    const titleBtn = screen.getByText('Test Room');
    fireEvent.click(titleBtn);

    expect(screen.getByText('Room Details')).toBeInTheDocument();
    expect(screen.getByText('Current Context')).toBeInTheDocument();
  });

  it('renders vocab panel when toggled', () => {
    useChatViewHook.useChatView.mockReturnValue({ ...mockChatViewState, showVocabPanel: true });

    render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Word Target')).toBeInTheDocument();
  });

  it('shows grammar result modal', () => {
    useChatViewHook.useChatView.mockReturnValue({
      ...mockChatViewState,
      grammarResult: { has_errors: true, corrected_text: 'Fixed text', explanation: 'Because reason' }
    });

    render(
      <MemoryRouter initialEntries={['/chat/1']}>
        <Routes>
          <Route path="/chat/:roomId" element={<ChatView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Corrección Gramatical')).toBeInTheDocument();
    expect(screen.getByText('Fixed text')).toBeInTheDocument();
    expect(screen.getByText('Because reason')).toBeInTheDocument();
  });
});
