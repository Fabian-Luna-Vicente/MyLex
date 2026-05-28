import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SynAntGame from '../../src/pages/SynAntGame';
import * as useSynAntGameHook from '../../src/hooks/useSynAntGame';

vi.mock('../../src/hooks/useSynAntGame', () => ({
  useSynAntGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SynAntGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, choices: [],
    gameStatus: 'playing', synOrAnt: 'Syn', targetRelation: 'RelatedWord', selectedListId: null,
    setSelectedListId: vi.fn(), score: { correct: 0, wrong: 0 },
    loadLists: vi.fn(), startGame: vi.fn(), handleAnswer: vi.fn(), nextLevel: vi.fn(), quitGame: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSynAntGameHook.useSynAntGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <SynAntGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Test your word relationships')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('renders game UI when playing', () => {
    useSynAntGameHook.useSynAntGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ id: 1, name: 'CurrentWord' }],
      index: 0,
      choices: [{ id: 1, name: 'CurrentWord' }, { id: 2, name: 'WrongWord' }]
    });

    render(
      <MemoryRouter>
        <SynAntGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Synonym')).toBeInTheDocument();
    expect(screen.getByText('"RelatedWord"')).toBeInTheDocument();
    
    const correctBtn = screen.getByText('CurrentWord');
    fireEvent.click(correctBtn);
    expect(mockGameState.handleAnswer).toHaveBeenCalled();
  });

  it('renders feedback when won', () => {
    useSynAntGameHook.useSynAntGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ id: 1, name: 'CurrentWord' }],
      index: 0,
      choices: [{ id: 1, name: 'CurrentWord' }],
      gameStatus: 'won'
    });

    render(
      <MemoryRouter>
        <SynAntGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    const nextBtn = screen.getByText(/Continue/i);
    fireEvent.click(nextBtn);
    expect(mockGameState.nextLevel).toHaveBeenCalled();
  });

  it('renders feedback when lost', () => {
    useSynAntGameHook.useSynAntGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ id: 1, name: 'CurrentWord' }],
      index: 0,
      choices: [{ id: 1, name: 'CurrentWord' }],
      gameStatus: 'lost'
    });

    render(
      <MemoryRouter>
        <SynAntGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });
});
