import { createContext, useState, useCallback } from 'react';
import api from '../services/api';

export const VocabularyContext = createContext();

export const VocabularyProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Words ---
  const fetchWords = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/api/words${search ? `?search=${search}` : ''}`);
      setWords(response.data);
    } catch (error) {
      console.error("Error fetching words", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWord = async (wordData) => {
    try {
      const response = await api.post('/api/words', wordData);
      setWords(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding word", error);
      throw error;
    }
  };

  const updateWord = async (wordId, wordData) => {
    try {
      const response = await api.put(`/api/words/${wordId}`, wordData);
      setWords(prev => prev.map(w => w.id === wordId ? response.data : w));
      return response.data;
    } catch (error) {
      console.error("Error updating word", error);
      throw error;
    }
  };

  const deleteWord = async (wordId) => {
    try {
      await api.delete(`/api/words/${wordId}`);
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
      const response = await api.get('/api/lists');
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addList = async (listData) => {
    try {
      const response = await api.post('/api/lists', listData);
      setLists(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding list", error);
      throw error;
    }
  };

  const deleteList = async (listId) => {
    try {
      await api.delete(`/api/lists/${listId}`);
      setLists(prev => prev.filter(l => l.id !== listId));
    } catch (error) {
      console.error("Error deleting list", error);
      throw error;
    }
  };

  return (
    <VocabularyContext.Provider value={{
      words, lists, loading,
      fetchWords, addWord, updateWord, deleteWord,
      fetchLists, addList, deleteList
    }}>
      {children}
    </VocabularyContext.Provider>
  );
};
