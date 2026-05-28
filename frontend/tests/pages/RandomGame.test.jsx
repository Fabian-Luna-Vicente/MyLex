import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RandomGame from '../../src/pages/RandomGame';
import * as useRandomGameHook from '../../src/hooks/useRandomGame';

vi.mock('../../src/hooks/useRandomGame', () => ({
  useRandomGame: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RandomGame Page', () => {
  const mockGameState = {
    lists: [{ id: 1, name: 'List 1' }], loading: false, showGame: false,
    shuffledWords: [], index: 0, face: 1, setFace: vi.fn(),
    lap: 1, showElement: true, difficulty: {}, selectedListId: null, setSelectedListId: vi.fn(),
    loadLists: vi.fn(), startGame: vi.fn(), next: vi.fn(), quitGame: vi.fn(), playSound: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRandomGameHook.useRandomGame.mockReturnValue(mockGameState);
  });

  it('renders list selection initially', () => {
    render(
      <MemoryRouter>
        <RandomGame />
      </MemoryRouter>
    );
    expect(screen.getByText('Select a List to Practice')).toBeInTheDocument();
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('renders game UI front face', () => {
    useRandomGameHook.useRandomGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'TestWord', past: 'Tested' }],
      index: 0,
      face: 1
    });

    render(
      <MemoryRouter>
        <RandomGame />
      </MemoryRouter>
    );

    expect(screen.getAllByText('TestWord').length).toBeGreaterThan(0);
    expect(screen.getByText('Tested')).toBeInTheDocument();
    
    const revealBtn = screen.getByText('Reveal Meaning');
    fireEvent.click(revealBtn);
    expect(mockGameState.setFace).toHaveBeenCalledWith(2);
  });

  it('renders game UI back face and handles difficulty selection', () => {
    useRandomGameHook.useRandomGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'TestWord', meaning: 'Testing meaning' }],
      index: 0,
      face: 2
    });

    render(
      <MemoryRouter>
        <RandomGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Testing meaning')).toBeInTheDocument();
    
    const easyBtn = screen.getByText('Easy');
    fireEvent.click(easyBtn);
    expect(mockGameState.next).toHaveBeenCalledWith('easy', expect.any(Object), 0, 1);
  });

  it('renders loading state when showElement is false', () => {
    useRandomGameHook.useRandomGame.mockReturnValue({
      ...mockGameState,
      showGame: true,
      shuffledWords: [{ name: 'TestWord' }],
      index: 0,
      showElement: false
    });

    render(
      <MemoryRouter>
        <RandomGame />
      </MemoryRouter>
    );

    expect(screen.getByText('Preparing next lap...')).toBeInTheDocument();
  });
});
