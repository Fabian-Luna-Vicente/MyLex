import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HangmanGame from '../../src/pages/HangmanGame';
import * as useHangmanGameHook from '../../src/hooks/useHangmanGame';

vi.mock('../../src/hooks/useHangmanGame', () => ({
  useHangmanGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HangmanGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, currentWord: null,
    mistakes: 0, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), foundLetters: [],
    splitWord: [], remainingLetters: 0, selectedListId: null, setSelectedListId: vi.fn(),
    score: { correct: 0, wrong: 0 }, isWon: false, isLost: false,
    loadLists: vi.fn(), startGame: vi.fn(), checkLetter: vi.fn(), goNext: vi.fn(), quitGame: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useHangmanGameHook.useHangmanGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <HangmanGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Select a List to Play')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeDisabled();
  });

  it('enables start button when list is selected', () => {
    useHangmanGameHook.useHangmanGame.mockReturnValue({ ...mockGameState, selectedListId: 1 });
    render(
      <MemoryRouter>
        <HangmanGame />
      </MemoryRouter>
    );
    
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);
    expect(mockGameState.startGame).toHaveBeenCalledWith(1);
  });

  it('renders game UI when playing', () => {
    useHangmanGameHook.useHangmanGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      currentWord: { name: 'APPLE', meaning: 'A fruit' },
      splitWord: ['A', 'P', 'P', 'L', 'E'],
      foundLetters: ['A'],
      mistakes: 1
    });

    render(
      <MemoryRouter>
        <HangmanGame />
      </MemoryRouter>
    );

    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getByText('A fruit')).toBeInTheDocument(); // meaning
  });

  it('renders win panel', () => {
    useHangmanGameHook.useHangmanGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      currentWord: { name: 'APPLE' },
      splitWord: ['A', 'P', 'P', 'L', 'E'],
      foundLetters: ['A', 'P', 'L', 'E'],
      isWon: true
    });

    render(
      <MemoryRouter>
        <HangmanGame />
      </MemoryRouter>
    );

    expect(screen.getByText('🎉 You Found It!')).toBeInTheDocument();
    
    const nextBtn = screen.getByRole('button', { name: /Next Word/i });
    fireEvent.click(nextBtn);
    expect(mockGameState.goNext).toHaveBeenCalled();
  });

  it('renders lose panel', () => {
    useHangmanGameHook.useHangmanGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      currentWord: { name: 'APPLE' },
      splitWord: ['A', 'P', 'P', 'L', 'E'],
      foundLetters: ['A'],
      mistakes: 6,
      isLost: true
    });

    render(
      <MemoryRouter>
        <HangmanGame />
      </MemoryRouter>
    );

    expect(screen.getByText('💀 You Lost')).toBeInTheDocument();
  });
});
