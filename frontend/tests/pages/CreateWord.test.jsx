import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateWord from '../../src/pages/CreateWord';
import * as useVocabularyHook from '../../src/hooks/useVocabulary';
import * as useAiHook from '../../src/hooks/useAi';
import * as useCreateWordHook from '../../src/hooks/useCreateWord';

vi.mock('../../src/hooks/useVocabulary', () => ({
  useVocabulary: vi.fn()
}));
vi.mock('../../src/hooks/useAi', () => ({
  useAi: vi.fn()
}));
vi.mock('../../src/hooks/useCreateWord', () => ({
  useCreateWord: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateWord Page', () => {
  const mockCreateWordState = {
    searchWord: '', setSearchWord: vi.fn(),
    useAiMode: false, setUseAiMode: vi.fn(),
    searchResults: [], aiContext: '', setAiContext: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    handleSelectResult: vi.fn(), handleSearch: vi.fn((e) => e.preventDefault()),
    setSelectedListId: vi.fn(), selectedListId: null,
    error: '', formData: { name: '', meaning: [], word_types: '', list_ids: [] },
    setFormData: vi.fn(), imageQuery: '', setImageQuery: vi.fn(), imageResults: [],
    isSearchingImages: false, imagePage: 1, setImagePage: vi.fn(), searchGoogleImages: vi.fn(),
    handleImageSearchSubmit: vi.fn(), handleLoadMoreImages: vi.fn(),
    toggleListSelection: vi.fn(), toggleWordType: vi.fn(), saving: false, setSaving: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useVocabularyHook.useVocabulary.mockReturnValue({ lists: [{ id: 1, name: 'List 1' }], addWord: vi.fn(), fetchLists: vi.fn() });
    useAiHook.useAi.mockReturnValue({ searchDictionary: vi.fn(), loading: false });
    useCreateWordHook.useCreateWord.mockReturnValue(mockCreateWordState);
  });

  it('renders search form and word details form', () => {
    render(
      <MemoryRouter>
        <CreateWord />
      </MemoryRouter>
    );
    expect(screen.getByText('Dictionary Search')).toBeInTheDocument();
    expect(screen.getByText('Word Full Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Word/i })).toBeInTheDocument();
  });

  it('shows AI context textarea when useAiMode is true', () => {
    useCreateWordHook.useCreateWord.mockReturnValue({ ...mockCreateWordState, useAiMode: true });
    render(
      <MemoryRouter>
        <CreateWord />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Where did you read this word/i)).toBeInTheDocument();
  });

  it('displays search results when available', () => {
    useCreateWordHook.useCreateWord.mockReturnValue({
      ...mockCreateWordState,
      searchResults: [{ name: 'Test', meaning: 'Test meaning' }]
    });
    render(
      <MemoryRouter>
        <CreateWord />
      </MemoryRouter>
    );
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test meaning')).toBeInTheDocument();
  });

  it('renders available lists for selection', () => {
    render(
      <MemoryRouter>
        <CreateWord />
      </MemoryRouter>
    );
    expect(screen.getByText('List 1')).toBeInTheDocument();
  });

  it('calls handleSubmit when form is submitted', () => {
    useCreateWordHook.useCreateWord.mockReturnValue({
      ...mockCreateWordState,
      formData: { name: 'NewWord', meaning: [], word_types: '', list_ids: [] }
    });
    render(
      <MemoryRouter>
        <CreateWord />
      </MemoryRouter>
    );
    
    // We mock handleSubmit in hook return, just checking if it is wired to the button
    fireEvent.click(screen.getByRole('button', { name: /Save Word/i }));
    expect(mockCreateWordState.handleSubmit).toHaveBeenCalled();
  });
});
