import { useState } from 'react';
import { aiService } from '../services/aiService';

export const useAiActions = () => {
    const [translation, setTranslation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyzeGrammar = async (text, language) => {
        if (!text || text.trim().split(/\s+/).length < 2) {
            setTranslation("Select a full phrase for grammar analysis.");
            return null;
        }

        setTranslation("Analyzing...");
        setIsLoading(true);
        setError(null);

        try {
            const data = await aiService.analyzeGrammar({ text, language });
            setTranslation("");
            return data;
        } catch (err) {
            setTranslation("Error or not logged in.");
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const translateText = async (text, sourceLang, targetLang) => {
        if (!text) return null;

        setTranslation("Translating...");
        setIsLoading(true);
        setError(null);

        try {
            const data = await aiService.translateText({ text, source: sourceLang, target: targetLang });
            setTranslation(data.translation);
            return data;
        } catch (err) {
            setTranslation("Error or not logged in.");
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const processDictionary = async (payload) => {
        if (!payload.word) return null;

        setTranslation("Searching...");
        setIsLoading(true);
        setError(null);

        try {
            const data = await aiService.searchDictionary(payload);
            
            if (Array.isArray(data) && data.length > 0 && !data[0].error) {
                setTranslation("");
                return data;
            } else {
                setTranslation(data[0]?.meaning || "Definition not found.");
                return null;
            }
        } catch (err) {
            setTranslation("Error or not logged in.");
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        translation,
        setTranslation,
        isLoading,
        error,
        analyzeGrammar,
        translateText,
        processDictionary
    };
};
