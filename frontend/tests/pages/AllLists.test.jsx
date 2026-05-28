import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AllLists from '../../src/pages/AllLists';
import * as useVocabularyHook from '../../src/hooks/useVocabulary';
import * as usePaginateHook from '../../src/hooks/usePaginate';

vi.mock('../../src/hooks/useVocabulary', () => ({
  useVocabulary: vi.fn()
}));

vi.mock('../../src/hooks/usePaginate', () => ({
  usePaginate: vi.fn()
}));

describe('AllLists Page', () => {
  const mockFetchLists = vi.fn();
  const mockAddList = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    useVocabularyHook.useVocabulary.mockReturnValue({
      lists: [],
      fetchLists: mockFetchLists,
      addList: mockAddList,
      loading: true
    });
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: [], totalPages: 0 });

    const { container } = render(
      <MemoryRouter>
        <AllLists />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no lists exist', () => {
    useVocabularyHook.useVocabulary.mockReturnValue({
      lists: [],
      fetchLists: mockFetchLists,
      addList: mockAddList,
      loading: false
    });
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: [], totalPages: 0 });

    render(
      <MemoryRouter>
        <AllLists />
      </MemoryRouter>
    );

    expect(screen.getByText('No lists yet')).toBeInTheDocument();
  });

  it('renders lists when they exist', () => {
    const mockLists = [
      { id: 1, name: 'Travel Vocab' },
      { id: 2, name: 'Business English' }
    ];

    useVocabularyHook.useVocabulary.mockReturnValue({
      lists: mockLists,
      fetchLists: mockFetchLists,
      addList: mockAddList,
      loading: false
    });
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: mockLists, totalPages: 1 });

    render(
      <MemoryRouter>
        <AllLists />
      </MemoryRouter>
    );

    expect(screen.getByText('Travel Vocab')).toBeInTheDocument();
    expect(screen.getByText('Business English')).toBeInTheDocument();
  });

  it('opens CreateListModal on button click', () => {
    useVocabularyHook.useVocabulary.mockReturnValue({
      lists: [],
      fetchLists: mockFetchLists,
      addList: mockAddList,
      loading: false
    });
    usePaginateHook.usePaginate.mockReturnValue({ currentItems: [], totalPages: 0 });

    render(
      <MemoryRouter>
        <AllLists />
      </MemoryRouter>
    );

    const createBtn = screen.getByText(/Create New List/i);
    fireEvent.click(createBtn);

    // Modal should now be visible (testing by text that appears in modal)
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });
});
