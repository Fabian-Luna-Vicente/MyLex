import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditWord from '../../src/pages/EditWord';
import * as useVocabularyHook from '../../src/hooks/useVocabulary';
import * as useAiHook from '../../src/hooks/useAi';
import * as useEditWordHook from '../../src/hooks/useEditWord';

vi.mock('../../src/hooks/useVocabulary', () => ({
  useVocabulary: vi.fn()
}));
vi.mock('../../src/hooks/useAi', () => ({
  useAi: vi.fn()
}));
vi.mock('../../src/hooks/useEditWord', () => ({
  useEditWord: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EditWord Page', () => {
  const mockEditWordState = {
    searchWord: '', setSearchWord: vi.fn(),
    useAiMode: false, setUseAiMode: vi.fn(),
    searchResults: [], aiContext: '', setAiContext: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    handleSelectResult: vi.fn(), handleSearch: vi.fn((e) => e.preventDefault()),
    setSelectedListId: vi.fn(), selectedListId: null,
    error: '', formData: { name: 'Existing Word', meaning: ['Meaning'], word_types: '', list_ids: [] },
    setFormData: vi.fn(), imageQuery: '', setImageQuery: vi.fn(), imageResults: [],
    isSearchingImages: false, imagePage: 1, setImagePage: vi.fn(),
    handleImageSearchSubmit: vi.fn(), handleLoadMoreImages: vi.fn(),
    toggleListSelection: vi.fn(), toggleWordType: vi.fn(), saving: false, loadingWord: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useVocabularyHook.useVocabulary.mockReturnValue({ lists: [{ id: 1, name: 'List 1' }], updateWord: vi.fn(), fetchLists: vi.fn(), fetchWordDetails: vi.fn() });
    useAiHook.useAi.mockReturnValue({ searchDictionary: vi.fn(), loading: false });
    useEditWordHook.useEditWord.mockReturnValue(mockEditWordState);
  });

  it('renders loading state when loadingWord is true', () => {
    useEditWordHook.useEditWord.mockReturnValue({ ...mockEditWordState, loadingWord: true });
    const { container } = render(
      <MemoryRouter initialEntries={['/word/edit/1']}>
        <Routes>
          <Route path="/word/edit/:id" element={<EditWord />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the edit form with pre-filled data', () => {
    render(
      <MemoryRouter initialEntries={['/word/edit/1']}>
        <Routes>
          <Route path="/word/edit/:id" element={<EditWord />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if the title reflects the word name
    expect(screen.getByText(/"Existing Word"/i)).toBeInTheDocument();
    
    // Check if the form is rendered
    expect(screen.getByDisplayValue('Existing Word')).toBeInTheDocument();
    expect(screen.getByText('Update Word')).toBeInTheDocument();
  });

  it('calls handleSubmit when save button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/word/edit/1']}>
        <Routes>
          <Route path="/word/edit/:id" element={<EditWord />} />
        </Routes>
      </MemoryRouter>
    );
    
    const saveBtn = screen.getByText('Update Word');
    fireEvent.click(saveBtn);
    
    expect(mockEditWordState.handleSubmit).toHaveBeenCalled();
  });

  it('navigates back when Back button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/word/edit/1']}>
        <Routes>
          <Route path="/word/edit/:id" element={<EditWord />} />
        </Routes>
      </MemoryRouter>
    );
    
    const backBtn = screen.getByText(/Back/i);
    fireEvent.click(backBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
