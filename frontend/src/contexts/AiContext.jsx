import { createContext, useState } from 'react';
import api from '../services/api';

export const AiContext = createContext();

export const AiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const searchDictionary = async (wordData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/ai/dictionary/search', wordData);
      return response.data;
    } catch (error) {
      console.error("Dictionary Search Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeGrammar = async (grammarData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/ai/grammar/analyze', grammarData);
      return response.data;
    } catch (error) {
      console.error("Grammar Analysis Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const correctWriting = async (writingData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/ai/corrector/assist', writingData);
      return response.data;
    } catch (error) {
      console.error("Writing Corrector Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiContext.Provider value={{
      loading,
      searchDictionary,
      analyzeGrammar,
      correctWriting
    }}>
      {children}
    </AiContext.Provider>
  );
};
