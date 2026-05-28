import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListeningGame from '../../src/pages/ListeningGame';
import * as useListeningGameHook from '../../src/hooks/useListeningGame';

vi.mock('../../src/hooks/useListeningGame', () => ({
  useListeningGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ListeningGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, userAnswers: {}, setUserAnswers: vi.fn(),
    gameStatus: 'playing', selectedListId: null, setSelectedListId: vi.fn(),
    score: { correct: 0, wrong: 0 }, setGameStatus: vi.fn(),
    loadLists: vi.fn(), startGame: vi.fn(), handleAnswer: vi.fn(), nextLevel: vi.fn(),
    quitGame: vi.fn(), playFullAudio: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useListeningGameHook.useListeningGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <ListeningGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Sharpen your ears')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('renders game UI when playing with examples', () => {
    useListeningGameHook.useListeningGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Test', meaning: 'Testing', examples: ['This is a test.'] }],
      index: 0,
      userAnswers: {}
    });

    render(
      <MemoryRouter>
        <ListeningGame />
      </MemoryRouter>
    );

    expect(screen.getByText('What did you hear?')).toBeInTheDocument();
    expect(screen.getByText('Listen to word and examples')).toBeInTheDocument();
    
    // There should be input for "test" (since it's the main word)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders simple input when no examples', () => {
    useListeningGameHook.useListeningGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Word', meaning: 'Just a word', examples: [] }],
      index: 0,
      userAnswers: {}
    });

    render(
      <MemoryRouter>
        <ListeningGame />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('???')).toBeInTheDocument();
  });

  it('calls handleAnswer when verify button clicked', () => {
    useListeningGameHook.useListeningGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Test', meaning: 'Testing', examples: [] }],
      index: 0,
      userAnswers: { main: 'test' }
    });

    render(
      <MemoryRouter>
        <ListeningGame />
      </MemoryRouter>
    );

    const verifyBtn = screen.getByText('Verify Example');
    fireEvent.click(verifyBtn);
    expect(mockGameState.handleAnswer).toHaveBeenCalled();
  });

  it('shows success message when gameStatus is won', () => {
    useListeningGameHook.useListeningGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      gameStatus: 'won',
      shuffledWords: [{ name: 'Test', meaning: 'Testing', examples: [] }],
      index: 0,
    });

    render(
      <MemoryRouter>
        <ListeningGame />
      </MemoryRouter>
    );

    expect(screen.getByText('✓ Perfectly Done!')).toBeInTheDocument();
    expect(screen.getByText(/The spoken word was/i)).toBeInTheDocument();
  });
});
