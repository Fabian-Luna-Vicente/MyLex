import api from './api';

export const aiService = {
  searchDictionary: async (wordData) => {
    const response = await api.post('/api/ai/dictionary/search', wordData);
    return response.data;
  },
  
  analyzeGrammar: async (grammarData) => {
    const response = await api.post('/api/ai/grammar/analyze', grammarData);
    return response.data;
  },
  
  correctWriting: async (writingData) => {
    const response = await api.post('/api/ai/corrector/assist', writingData);
    return response.data;
  }
};
