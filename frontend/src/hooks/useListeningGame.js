import { useState, useCallback } from 'react';
import { useVocabulary } from './useVocabulary';

export const useListeningGame = () => {
    const { fetchWordsForGame, lists, fetchLists } = useVocabulary();
    
    const [loading, setLoading] = useState(false);
    const [showGame, setShowGame] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');
    
    const [shuffledWords, setShuffledWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [choices, setChoices] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [pendingProgress, setPendingProgress] = useState([]);

    const loadLists = useCallback(async () => {
        if (lists.length === 0) await fetchLists();
    }, [lists.length, fetchLists]);

    const playAudio = useCallback((text) => {
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for clear listening
        window.speechSynthesis.speak(utterance);
    }, []);

    const generateChoices = (words, currentIndex) => {
        if (words.length < 4) {
            setChoices(words);
            return;
        }

        let tempChoices = [];
        const correctWord = words[currentIndex];

        while (tempChoices.length < 3) {
            const randomWord = words[Math.floor(Math.random() * words.length)];
            if (randomWord.id !== correctWord.id && !tempChoices.find(w => w.id === randomWord.id)) {
                tempChoices.push(randomWord);
            }
        }

        const insertPos = Math.floor(Math.random() * 4);
        tempChoices.splice(insertPos, 0, correctWord);
        setChoices(tempChoices);
    };

    const startGame = async (listId) => {
        setLoading(true);
        try {
            const words = await fetchWordsForGame(listId, 'listening');
            if (!words || words.length === 0) {
                alert("No words available in this list to play.");
                setLoading(false);
                return;
            }
            
            setShuffledWords(words);
            setIndex(0);
            setScore({ correct: 0, wrong: 0 });
            setGameStatus('playing');
            generateChoices(words, 0);
            setShowGame(true);
            
            // Auto play the first word
            setTimeout(() => playAudio(words[0].name), 500);

        } catch (error) {
            console.error("Error starting game", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (selectedChoice) => {
        if (gameStatus !== 'playing') return;

        const correctWord = shuffledWords[index];
        const isCorrect = selectedChoice.id === correctWord.id;

        if (isCorrect) {
            setScore(s => ({ ...s, correct: s.correct + 1 }));
            setGameStatus('won');
        } else {
            setScore(s => ({ ...s, wrong: s.wrong + 1 }));
            setGameStatus('lost');
        }

        const newProgress = { word_id: correctWord.id, game: 'listening', is_correct: isCorrect };
        
        setPendingProgress(prev => {
            const updated = [...prev, newProgress];
            if (updated.length >= 5) {
                saveBulkProgress(updated);
                return [];
            }
            return updated;
        });
    };

    const nextLevel = () => {
        if (index + 1 < shuffledWords.length) {
            const nextIdx = index + 1;
            setIndex(nextIdx);
            setGameStatus('playing');
            generateChoices(shuffledWords, nextIdx);
            setTimeout(() => playAudio(shuffledWords[nextIdx].name), 500);
        } else {
            // End of game
            if (pendingProgress.length > 0) {
                saveBulkProgress(pendingProgress);
                setPendingProgress([]);
            }
            alert("Game Over! Session finished.");
            setShowGame(false);
        }
    };

    const saveBulkProgress = async (progressArray) => {
        try {
            const { axiosInstance } = await import('../services/api');
            await axiosInstance.default.post('/api/progress/bulk', { items: progressArray });
        } catch (error) {
            console.error("Failed to save bulk progress", error);
        }
    };

    const quitGame = () => {
        if (pendingProgress.length > 0) {
            saveBulkProgress(pendingProgress);
        }
        setShowGame(false);
        setPendingProgress([]);
    };

    return {
        lists, loading, showGame, shuffledWords, index, choices,
        gameStatus, selectedListId, setSelectedListId, score,
        loadLists, startGame, handleAnswer, nextLevel, quitGame, playAudio
    };
};
