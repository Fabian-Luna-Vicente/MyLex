import api from './api';

const getAiLanguage = () => localStorage.getItem('ai_language') || 'es';

export const aiService = {
  searchDictionary: async (wordData) => {
    const payload = { ...wordData, ai_language: getAiLanguage() };
    const response = await api.post('/api/ai/dictionary/search', payload);
    return response.data;
  },
  
  analyzeGrammar: async (grammarData) => {
    const payload = { ...grammarData, ai_language: getAiLanguage() };
    const response = await api.post('/api/ai/grammar/analyze', payload);
    return response.data;
  },
  
  correctWriting: async (writingData) => {
    const payload = { ...writingData, ai_language: getAiLanguage() };
    const response = await api.post('/api/ai/corrector/assist', payload);
    return response.data;
  }
};
