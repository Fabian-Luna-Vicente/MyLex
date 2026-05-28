import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WritingGame from '../../src/pages/WritingGame';
import * as useWritingGameHook from '../../src/hooks/useWritingGame';

vi.mock('../../src/hooks/useWritingGame', () => ({
  useWritingGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('WritingGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, text: '', setText: vi.fn(),
    selectedListId: null, setSelectedListId: vi.fn(), aiFeedback: null, aiError: null, aiLoading: false,
    loadLists: vi.fn(), startGame: vi.fn(), handleCheck: vi.fn(), nextLevel: vi.fn(), quitGame: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useWritingGameHook.useWritingGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <WritingGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Practice your grammar')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('renders game UI with words and textarea', () => {
    useWritingGameHook.useWritingGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Word1' }, { name: 'Word2' }, { name: 'Word3' }],
      index: 0
    });

    render(
      <MemoryRouter>
        <WritingGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Write sentences using these words:')).toBeInTheDocument();
    expect(screen.getByText('Word1')).toBeInTheDocument();
    expect(screen.getByText('Word2')).toBeInTheDocument();
    expect(screen.getByText('Word3')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText(/Start typing your sentences here/i);
    fireEvent.change(textarea, { target: { value: 'Testing words.' } });
    expect(mockGameState.setText).toHaveBeenCalledWith('Testing words.');
  });

  it('calls handleCheck when grammar check clicked', () => {
    useWritingGameHook.useWritingGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Word1' }],
      index: 0,
      text: 'My sentence'
    });

    render(
      <MemoryRouter>
        <WritingGame />
      </MemoryRouter>
    );

    const checkBtn = screen.getByRole('button', { name: /Check Grammar/i });
    fireEvent.click(checkBtn);
    expect(mockGameState.handleCheck).toHaveBeenCalled();
  });

  it('displays AI feedback', () => {
    useWritingGameHook.useWritingGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'Word1' }],
      index: 0,
      text: 'My sentence',
      aiFeedback: {
        corrected_text: 'Corrected sentence',
        explanation: 'Because it was wrong',
        words_used_correctly: true
      }
    });

    render(
      <MemoryRouter>
        <WritingGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Corrected sentence')).toBeInTheDocument();
    expect(screen.getByText('Because it was wrong')).toBeInTheDocument();
    expect(screen.getByText('Required words used correctly')).toBeInTheDocument();
    
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);
    expect(mockGameState.nextLevel).toHaveBeenCalled();
  });
});
