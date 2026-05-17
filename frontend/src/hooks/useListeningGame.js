import { useState, useCallback } from 'react';
import { useVocabulary } from './useVocabulary';
import { progressService } from '../services/progressService';

export const useListeningGame = () => {
    const { fetchWordsForGame, lists, fetchLists } = useVocabulary();

    const [loading, setLoading] = useState(false);
    const [showGame, setShowGame] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');

    const [shuffledWords, setShuffledWords] = useState([]);
    const [index, setIndex] = useState(0);

    // Estados para "Rellenar huecos"
    const [userAnswers, setUserAnswers] = useState({});
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [pendingProgress, setPendingProgress] = useState([]);

    const loadLists = useCallback(async () => {
        if (lists.length === 0) await fetchLists();
    }, [lists.length, fetchLists]);

    // 1) Reproducir audio de la palabra + los ejemplos
    const playFullAudio = useCallback((wordObj) => {
        if (!wordObj) return;
        window.speechSynthesis.cancel();

        let textToSpeak = wordObj.name + ". ";
        if (wordObj.examples && wordObj.examples.length > 0) {
            textToSpeak += wordObj.examples.map((e, i) => "Example " + (i + 1) + ". " + e).join(". ");
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // Un poco más lento para dictado
        window.speechSynthesis.speak(utterance);
    }, []);

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
            setUserAnswers({});
            setGameStatus('playing');
            setShowGame(true);

            setTimeout(() => playFullAudio(words[0]), 500);

        } catch (error) {
            console.error("Error starting game", error);
        } finally {
            setLoading(false);
        }
    };

    // 5) Validar las respuestas y mostrar aciertos/fallos
    const handleAnswer = (correctBlanks) => {
        if (gameStatus !== 'playing') return;

        let allCorrect = true;

        for (const [id, correctText] of Object.entries(correctBlanks)) {
            const userAnswer = (userAnswers[id] || '').trim().toLowerCase();
            const cleanCorrectText = correctText.trim().toLowerCase();

            if (userAnswer !== cleanCorrectText) {
                allCorrect = false;
            }
        }

        if (allCorrect) {
            setScore(s => ({ ...s, correct: s.correct + 1 }));
            setGameStatus('won');
        } else {
            setScore(s => ({ ...s, wrong: s.wrong + 1 }));
            setGameStatus('lost');
        }

        const correctWord = shuffledWords[index];
        const newProgress = { word_id: correctWord.id, game: 'listening', is_correct: allCorrect };

        setPendingProgress(prev => {
            const updated = [...prev, newProgress];
            if (updated.length >= 5) {
                saveBulkProgress(updated);
                return [];
            }
            return updated;
        });
    };

    // 6) Pasar al siguiente y reproducir automáticamente
    const nextLevel = () => {
        if (index + 1 < shuffledWords.length) {
            const nextIdx = index + 1;
            setIndex(nextIdx);
            setUserAnswers({});
            setGameStatus('playing');
            setTimeout(() => playFullAudio(shuffledWords[nextIdx]), 500);
        } else {
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
            await progressService.saveBulkProgress(progressArray);
        } catch (error) {
            console.error("Failed to save bulk progress", error);
        }
    };

    const quitGame = () => {
        if (pendingProgress.length > 0) {
            saveBulkProgress(pendingProgress);
        }
        window.speechSynthesis.cancel();
        setShowGame(false);
        setPendingProgress([]);
    };

    return {
        lists, loading, showGame, shuffledWords, index, userAnswers, setUserAnswers,
        gameStatus, setGameStatus, selectedListId, setSelectedListId, score,
        loadLists, startGame, handleAnswer, nextLevel, quitGame, playFullAudio
    };
};