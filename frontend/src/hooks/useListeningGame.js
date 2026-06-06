import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useVocabulary } from './useVocabulary';
import { progressService } from '../services/progressService';
import { getLangCode } from '../config/constants';

export const useListeningGame = () => {
    const { fetchWordsForGame, lists, fetchLists } = useVocabulary();

    const [loading, setLoading] = useState(false);
    const [showGame, setShowGame] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');
    const [overrideLang, setOverrideLang] = useState('auto');

    const [shuffledWords, setShuffledWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [audioState, setAudioState] = useState('stopped'); // stopped, playing, paused

    // Estados para "Rellenar huecos"
    const [userAnswers, setUserAnswers] = useState({});
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [pendingProgress, setPendingProgress] = useState([]);

    const loadLists = useCallback(async () => {
        if (lists.length === 0) await fetchLists();
    }, [lists.length, fetchLists]);

    useEffect(() => {
        loadLists();
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, [loadLists]);

    const [subIndex, setSubIndex] = useState(0);
    const inputRef = useRef(null);
    const currentAudioRef = useRef(null);

    const currentWord = shuffledWords[index];

    useEffect(() => {
        if (showGame && gameStatus === 'playing') {
            inputRef.current?.focus();
        }
    }, [index, showGame, gameStatus]);

    useEffect(() => {
        if (showGame && currentWord) {
            console.log(" [DEBUG] Answers for", currentWord.name);
        }
    }, [currentWord, showGame]);

    const puzzle = useMemo(() => {
        if (!currentWord) return null;
        const correctAnswers = {};
        const baseWordLower = currentWord.name.toLowerCase();

        const baseRoot = baseWordLower.length > 4 ? baseWordLower.slice(0, -2) : baseWordLower;

        const processedExamples = (currentWord.examples || []).map((ex, exIdx) => {
            const words = ex.split(' ');
            let extraBlanksCount = 0;
            const targetExtra = words.length > 8 ? 2 : 1;

            return words.map((w, wIdx) => {
                const match = w.match(/^([^a-zA-Z]*)([a-zA-Z'-]+)([^a-zA-Z]*)$/);
                const prefix = match ? match[1] : '';
                const clean = match ? match[2] : w.replace(/[.,!?;:()"]/g, '');
                const suffix = match ? match[3] : '';
                const isMain = clean.toLowerCase() === baseWordLower ||
                    (clean.toLowerCase().startsWith(baseRoot) && Math.abs(clean.length - baseWordLower.length) <= 4);

                if (isMain) {
                    const id = `ex-${exIdx}-main-${wIdx}`;
                    correctAnswers[id] = clean;
                    return { type: 'blank', id, correct: clean, prefix, suffix, isMain: true };
                }

                if (extraBlanksCount < targetExtra && clean.length > 4 && Math.random() > 0.6) {
                    const id = `ex-${exIdx}-extra-${wIdx}`;
                    correctAnswers[id] = clean;
                    extraBlanksCount++;
                    return { type: 'blank', id, correct: clean, prefix, suffix, isMain: false };
                }

                return { type: 'text', content: w + ' ' };
            });
        });

        return { examples: processedExamples, correctAnswers };
    }, [currentWord]);

    const stopAudio = useCallback(() => {
        window.speechSynthesis.cancel();
        if (currentAudioRef.current) {
            currentAudioRef.current.onended = null; // Prevent next chunk
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }
        setAudioState('stopped');
    }, []);

    // 1) Reproducir audio de la palabra + el ejemplo actual
    const playFullAudio = useCallback((wordObj, specificSubIndex = subIndex) => {
        if (!wordObj) return;
        stopAudio();

        let textToSpeak = wordObj.name + ". ";
        if (wordObj.examples && wordObj.examples.length > specificSubIndex) {
            textToSpeak += wordObj.examples[specificSubIndex];
        }

        const currentList = lists.find(l => l.id === selectedListId);
        const targetLangName = overrideLang !== 'auto' ? overrideLang : (currentList ? currentList.language : 'English');
        const langCode = getLangCode(targetLangName);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langCode;
        utterance.rate = 0.85; // Un poco más lento para dictado
        
        utterance.onstart = () => setAudioState('playing');
        utterance.onend = () => setAudioState('stopped');
        utterance.onerror = () => setAudioState('stopped');
        utterance.onpause = () => setAudioState('paused');
        utterance.onresume = () => setAudioState('playing');

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const matchingVoices = voices.filter(v => v.lang === langCode || v.lang.replace('_', '-') === langCode || v.lang.startsWith(langCode.split('-')[0]));
            if (matchingVoices.length > 0) {
                let voice = matchingVoices.find(v => v.name.includes("Google"));
                if (!voice) voice = matchingVoices[0];
                utterance.voice = voice;
                window.speechSynthesis.speak(utterance);
                return;
            }
        }

        const fallbackCode = langCode.split('-')[0];
        
        // El usuario pidió usar la voz nativa para inglés y español
        if (fallbackCode === 'en' || fallbackCode === 'es') {
            window.speechSynthesis.speak(utterance);
            return;
        }

        const sentences = [wordObj.name];
        if (wordObj.examples && wordObj.examples.length > specificSubIndex) {
            sentences.push(wordObj.examples[specificSubIndex]);
        }

        const playSequential = (idx) => {
            if (idx >= sentences.length) return;
            const chunk = sentences[idx];
            
            // Limit chunk size if needed, though usually examples are short enough
            const safeChunk = chunk.substring(0, 199);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const url = `${API_URL}/api/vocabulary/tts?lang=${fallbackCode}&text=${encodeURIComponent(safeChunk)}`;
            const audio = new Audio(url);
            currentAudioRef.current = audio;
            audio.playbackRate = 0.85;

            audio.onplay = () => setAudioState('playing');
            audio.onpause = () => {
                if (audio.currentTime !== 0 && !audio.ended) setAudioState('paused');
            };

            audio.onended = () => {
                if (idx + 1 >= sentences.length) {
                    setAudioState('stopped');
                } else {
                    playSequential(idx + 1);
                }
            };

            audio.onerror = (e) => {
                console.error("[TTS Debug] Fallback audio chunk failed:", e);
                setAudioState('stopped');
                if (idx === 0) window.speechSynthesis.speak(utterance); // fallback to native only if first chunk fails
            };

            audio.play().catch(e => {
                console.error("[TTS Debug] Fallback audio play failed:", e);
                setAudioState('stopped');
                if (idx === 0) window.speechSynthesis.speak(utterance);
            });
        };

        playSequential(0);
    }, [lists, selectedListId, stopAudio]);

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
            setSubIndex(0);
            setGameStatus('playing');
            setShowGame(true);

            setTimeout(() => playFullAudio(words[0], 0), 500);

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
            setSubIndex(0);
            setGameStatus('playing');
            setTimeout(() => playFullAudio(shuffledWords[nextIdx], 0), 500);
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
        stopAudio();
        setShowGame(false);
        setPendingProgress([]);
    };

    const toggleAudio = useCallback(() => {
        if (audioState === 'playing') {
            window.speechSynthesis.pause();
            if (currentAudioRef.current) currentAudioRef.current.pause();
            setAudioState('paused');
        } else if (audioState === 'paused') {
            window.speechSynthesis.resume();
            if (currentAudioRef.current) currentAudioRef.current.play();
            setAudioState('playing');
        } else {
            playFullAudio(currentWord, subIndex);
        }
    }, [audioState, playFullAudio, currentWord, subIndex]);

    return {
        lists, loading, showGame, shuffledWords, index, userAnswers, setUserAnswers,
        gameStatus, setGameStatus, selectedListId, setSelectedListId, score,
        loadLists, startGame, handleAnswer, nextLevel, quitGame, playFullAudio, stopAudio,
        subIndex, setSubIndex, inputRef, currentWord, puzzle, overrideLang, setOverrideLang,
        audioState, toggleAudio
    };
};