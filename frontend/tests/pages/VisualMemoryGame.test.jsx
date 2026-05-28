import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisualMemoryGame from '../../src/pages/VisualMemoryGame';
import * as useVisualMemoryGameHook from '../../src/hooks/useVisualMemoryGame';

vi.mock('../../src/hooks/useVisualMemoryGame', () => ({
  useVisualMemoryGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('VisualMemoryGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, choices: [],
    gameStatus: 'playing', selectedListId: null, setSelectedListId: vi.fn(), score: { correct: 0, wrong: 0 },
    loadLists: vi.fn(), startGame: vi.fn(), handleAnswer: vi.fn(), nextLevel: vi.fn(), quitGame: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useVisualMemoryGameHook.useVisualMemoryGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <VisualMemoryGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Choose a list to test your memory')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('renders game UI when playing', () => {
    useVisualMemoryGameHook.useVisualMemoryGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ id: 1, name: 'Apple', image: 'apple.jpg' }],
      index: 0,
      choices: [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }]
    });

    render(
      <MemoryRouter>
        <VisualMemoryGame />
      </MemoryRouter>
    );

    expect(screen.getByText('What does this represent?')).toBeInTheDocument();
    expect(screen.getByAltText('Game visual')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    
    const choiceBtn = screen.getByText('Apple');
    fireEvent.click(choiceBtn);
    expect(mockGameState.handleAnswer).toHaveBeenCalled();
  });

  it('shows feedback when won', () => {
    useVisualMemoryGameHook.useVisualMemoryGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      gameStatus: 'won',
      shuffledWords: [{ id: 1, name: 'Apple', image: 'apple.jpg' }],
      index: 0,
      choices: [{ id: 1, name: 'Apple' }]
    });

    render(
      <MemoryRouter>
        <VisualMemoryGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Brilliant!')).toBeInTheDocument();
  });

  it('shows feedback when lost', () => {
    useVisualMemoryGameHook.useVisualMemoryGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      gameStatus: 'lost',
      shuffledWords: [{ id: 1, name: 'Apple', image: 'apple.jpg' }],
      index: 0,
      choices: [{ id: 1, name: 'Apple' }]
    });

    render(
      <MemoryRouter>
        <VisualMemoryGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Not Quite!')).toBeInTheDocument();
  });
});
