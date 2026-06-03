import { createContext, useState, useCallback } from 'react';
import { vocabularyService } from '../services/vocabularyService';
import { progressService } from '../services/progressService';

export const VocabularyContext = createContext();

export const VocabularyProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);


  // --- Words ---
  const fetchWords = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const data = await vocabularyService.getWords(search);
      setWords(data);
      return data;
    } catch (error) {
      console.error("Error fetching words", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addWord = async (wordData) => {
    try {
      const data = await vocabularyService.addWord(wordData);
      setWords(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding word", error);
      throw error;
    }
  };

  const updateWord = async (wordId, wordData) => {
    try {
      const data = await vocabularyService.updateWord(wordId, wordData);
      setWords(prev => prev.map(w => w.id === wordId ? data : w));
      return data;
    } catch (error) {
      console.error("Error updating word", error);
      throw error;
    }
  };

  const deleteWord = async (wordId) => {
    try {
      await vocabularyService.deleteWord(wordId);
      setWords(prev => prev.filter(w => w.id !== wordId));
    } catch (error) {
      console.error("Error deleting word", error);
      throw error;
    }
  };

  // --- Lists ---
  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vocabularyService.getLists();
      setLists(data);
      return data;
    } catch (error) {
      console.error("Error fetching lists", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await vocabularyService.getListDetails(id);
      return data;
    } catch (error) {
      console.error("Error fetching list", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addList = async (listData) => {
    try {
      const data = await vocabularyService.addList(listData);
      setLists(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding list", error);
      throw error;
    }
  };

  const editList = async (id, listData) => {
    if (!listData.name.trim()) return;
    try {
      const data = await vocabularyService.updateList(id, listData);
      setLists(prev => prev.map(l => l.id === id ? { ...l, ...listData } : l));
      return data;
    } catch (error) {
      console.error("Error updating list", error);
      throw error;
    }
  };

  const deleteList = async (listId) => {
    try {
      await vocabularyService.deleteList(listId);
      setLists(prev => prev.filter(l => l.id !== listId));
    } catch (error) {
      console.error("Error deleting list", error);
      throw error;
    }
  };

  const copyList = async (listId) => {
    try {
      const data = await vocabularyService.copyList(listId);
      setLists(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error copying list", error);
      throw error;
    }
  };

  const fetchWordDetails = async (id) => {
    setLoading(true);
    try {
      const data = await vocabularyService.getWordDetails(id);
      return data;
    } catch (error) {
      console.error("Error fetching word details", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- Games ---
  const fetchWordsForGame = useCallback(async (listId, game) => {
    setLoading(true);
    try {
      const data = await progressService.getWordsForGame(listId, game);
      return data;
    } catch (error) {
      console.error("Error fetching words for game", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMoveWord = async (wordId, targetListId) => {
    // TODO: Implement move logic when available in backend/hook
    console.log(`Moving word ${wordId} to list ${targetListId}`);
  };

  return (
    <VocabularyContext.Provider value={{
      words, lists, loading,
      fetchWords, addWord, updateWord, deleteWord,
      fetchLists, addList, deleteList, editList, fetchListDetails, copyList, handleMoveWord, fetchWordDetails,
      fetchWordsForGame
    }}>
      {children}
    </VocabularyContext.Provider>
  );
};
