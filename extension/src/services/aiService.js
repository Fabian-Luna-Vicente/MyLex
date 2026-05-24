export const aiService = {
    searchDictionary: (payload) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "PROCESS_DICTIONARY", payload }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error searching dictionary");
                }
            });
        });
    },

    analyzeGrammar: (payload) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "ANALYZE_GRAMMAR", payload }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error analyzing grammar");
                }
            });
        });
    },

    translateText: (payload) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "TRANSLATE_TEXT", payload }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error translating text");
                }
            });
        });
    }
};
