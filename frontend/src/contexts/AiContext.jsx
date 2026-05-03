import { createContext, useState } from 'react';
import { aiService } from '../services/aiService';

export const AiContext = createContext();

export const AiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const searchDictionary = async (wordData) => {
    setLoading(true);
    try {
      return await aiService.searchDictionary(wordData);
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
      return await aiService.analyzeGrammar(grammarData);
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
      return await aiService.correctWriting(writingData);
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
