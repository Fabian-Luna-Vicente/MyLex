import api from './extensionClient';

export const backgroundAiService = {
    searchDictionary: (payload) => api.post('/api/ai/dictionary/search', payload),
    analyzeGrammar: (payload) => api.post('/api/ai/grammar/analyze', payload),
    translateText: (payload) => api.post('/api/ai/translate', payload)
};

export const backgroundVocabularyService = {
    getLists: () => api.get('/api/vocabulary/lists'),
    addWord: (payload) => api.post('/api/vocabulary/words', payload)
};
