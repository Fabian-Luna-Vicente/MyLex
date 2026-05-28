import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListWords from '../../src/pages/ListWords';
import * as useListWordsHook from '../../src/hooks/useListWords';
import * as usePaginateHook from '../../src/hooks/usePaginate';

vi.mock('../../src/hooks/useListWords', () => ({
  useListWords: vi.fn()
}));

vi.mock('../../src/hooks/usePaginate', () => ({
  usePaginate: vi.fn()
}));

describe('ListWords Page', () => {
  const mockNavigate = vi.fn();
  
  const mockHookState = {
    list: { id: 1, name: 'My List', language: 'English', privacy: 'public', words: [] },
    lists: [{ id: 1, name: 'My List' }],
    loading: false,
    id: '1',
    navigate: mockNavigate,
    showEditListMenu: false, setShowEditListMenu: vi.fn(),
    showMoveMenu: false, setShowMoveMenu: vi.fn(),
    showConfirmDelete: false, setShowConfirmDelete: vi.fn(),
    showDetailModal: false, setShowDetailModal: vi.fn(),
    newTitle: '', setNewTitle: vi.fn(),
    newPrivacy: 'public', setNewPrivacy: vi.fn(),
    newLanguage: 'English', setNewLanguage: vi.fn(),
    wordToMove: null, setWordToMove: vi.fn(),
    wordToDelete: null, setWordToDelete: vi.fn(),
    wordForDetail: null, setWordForDetail: vi.fn(),
    deleteMode: false, setDeleteMode: vi.fn(),
    currentPage: 1, setCurrentPage: vi.fn(),
    itemsPerPage: 10,
    playSound: vi.fn(),
    handleEditList: vi.fn(), handleDeleteList: vi.fn(), handleDeleteWord: vi.fn(), handleMoveWord: vi.fn(),
    openDetail: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useListWordsHook.useListWords.mockReturnValue(mockHookState);
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: [], totalPages: 0 });
  });

  it('renders loading state', () => {
    useListWordsHook.useListWords.mockReturnValue({ ...mockHookState, loading: true });
    const { container } = render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders list not found', () => {
    useListWordsHook.useListWords.mockReturnValue({ ...mockHookState, list: null });
    render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );
    expect(screen.getByText('List not found')).toBeInTheDocument();
  });

  it('renders list details and empty state', () => {
    render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );
    
    expect(screen.getByText('My List')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('public')).toBeInTheDocument();
    expect(screen.getByText('No words yet')).toBeInTheDocument();
  });

  it('renders word items', () => {
    const word = { id: 1, name: 'Apple', meaning: 'Fruit', word_types: ['noun'] };
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: [word], totalPages: 1 });
    
    render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('noun')).toBeInTheDocument();
    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  it('calls navigate when Add Word is clicked', () => {
    render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Word/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/create-word?listId=1');
  });

  it('renders edit list modal when showEditListMenu is true', () => {
    useListWordsHook.useListWords.mockReturnValue({ ...mockHookState, showEditListMenu: true });
    render(
      <MemoryRouter>
        <ListWords />
      </MemoryRouter>
    );

    expect(screen.getByText(/Edit/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New List Name')).toBeInTheDocument();
  });
});
