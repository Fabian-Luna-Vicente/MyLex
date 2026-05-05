import { useState, useCallback } from 'react';
import { useVocabulary } from './useVocabulary';
import { useAi } from './useAi';

export const useWritingGame = () => {
    const { fetchWordsForGame, lists, fetchLists } = useVocabulary();
    const { correctWriting, loading: aiLoading } = useAi();
    
    const [loading, setLoading] = useState(false);
    const [showGame, setShowGame] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');
    
    const [shuffledWords, setShuffledWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [text, setText] = useState("");
    const [aiFeedback, setAiFeedback] = useState(null);
    const [aiError, setAiError] = useState(null);

    const loadLists = useCallback(async () => {
        if (lists.length === 0) await fetchLists();
    }, [lists.length, fetchLists]);

    const startGame = async (listId) => {
        setLoading(true);
        try {
            const words = await fetchWordsForGame(listId, 'writing');
            if (!words || words.length === 0) {
                alert("No words available in this list to play.");
                setLoading(false);
                return;
            }
            
            setShuffledWords(words);
            setIndex(0);
            setText("");
            setAiFeedback(null);
            setShowGame(true);
        } catch (error) {
            console.error("Error starting game", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = async () => {
        if (!text.trim()) return;
        setAiError(null);
        
        const currentWords = [
            shuffledWords[index]?.name,
            shuffledWords[index + 1]?.name,
            shuffledWords[index + 2]?.name
        ].filter(Boolean);

        try {
            const result = await correctWriting({
                userText: text,
                targetWords: currentWords,
                context: "Estudiante practicando redacción en inglés usando palabras específicas."
            });
            
            if (result.status) {
                setAiFeedback(result.response);
            } else {
                setAiError(result.message);
            }
        } catch (error) {
            setAiError("Failed to connect to AI teacher.");
        }
    };

    const saveProgress = async (wordsBatch) => {
        try {
            const items = wordsBatch.map(w => ({
                word_id: w.id,
                game: 'writing',
                is_correct: true // If they wrote something and continued, we mark as reviewed/correct
            }));
            
            const { axiosInstance } = await import('../services/api');
            await axiosInstance.default.post('/api/progress/bulk', { items });
        } catch (error) {
            console.error("Failed to save writing progress", error);
        }
    };

    const nextLevel = async () => {
        if (text.length < 5) {
            alert("Please write a longer sentence before continuing.");
            return;
        }

        const currentWordsBatch = shuffledWords.slice(index, index + 3);
        await saveProgress(currentWordsBatch);

        setText("");
        setAiFeedback(null);
        setAiError(null);

        if (index + 3 < shuffledWords.length) {
            setIndex(index + 3);
        } else {
            alert("Game Over! Session finished.");
            setShowGame(false);
        }
    };

    const quitGame = () => {
        setShowGame(false);
    };

    return {
        lists, loading, showGame, shuffledWords, index, text, setText,
        selectedListId, setSelectedListId, aiFeedback, aiError, aiLoading,
        loadLists, startGame, handleCheck, nextLevel, quitGame
    };
};
