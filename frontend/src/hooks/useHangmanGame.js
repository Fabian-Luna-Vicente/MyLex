import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from './useVocabulary';
import { progressService } from '../services/progressService';

const INITIAL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function shuffler(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeAccents(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const useHangmanGame = () => {
  const navigate = useNavigate();
  const { lists, fetchLists } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [showGame, setShowGame] = useState(false);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [alphabet, setAlphabet] = useState(INITIAL_ALPHABET);
  const [foundLetters, setFoundLetters] = useState([]);
  const [splitWord, setSplitWord] = useState([]);
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  // Accumulate progress to bulk-save at end of session
  const [pendingProgress, setPendingProgress] = useState([]);

  const loadLists = useCallback(async () => {
    if (lists.length === 0) await fetchLists();
  }, [lists.length, fetchLists]);

  const splitAndSet = (wordName) => {
    if (!wordName) return;
    const clean = removeAccents(wordName);
    const chars = clean.replace(/ /g, '|').toUpperCase().split('');
    setSplitWord(chars);
    const count = chars.filter(c => c !== '|').length;
    setRemainingLetters(count);
  };

  const startGame = async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      // Fetch words with spaced-repetition ordering from backend
      // Backend excludes words answered correctly less than 2 days ago
      const words = await progressService.getWordsForGame(listId, 'hangman');

      if (!words || words.length === 0) {
        alert('This list has no words available for Hangman right now. Come back later!');
        return;
      }

      const shuffled = shuffler(words);
      setShuffledWords(shuffled);
      setIndex(0);
      setMistakes(0);
      setAlphabet(INITIAL_ALPHABET);
      setFoundLetters([]);
      setScore({ correct: 0, wrong: 0 });
      setPendingProgress([]);
      splitAndSet(shuffled[0]?.name);
      setShowGame(true);
    } catch (e) {
      console.error('Error starting hangman:', e);
      alert('Could not load words. Make sure the list has words.');
    } finally {
      setLoading(false);
    }
  };

  const flushProgress = async (pending) => {
    if (!pending || pending.length === 0) return;
    try {
      await progressService.saveBulkProgress(pending);
    } catch (e) {
      console.error('Progress save error (non-critical):', e);
    }
  };

  const checkLetter = (letter) => {
    if (remainingLetters === 0 || mistakes === 6) return;

    setAlphabet(prev => prev.filter(l => l !== letter));

    if (splitWord.includes(letter)) {
      const count = splitWord.filter(c => c === letter).length;
      const newRemaining = remainingLetters - count;
      setRemainingLetters(newRemaining);
      setFoundLetters(prev => [...prev, letter]);
    } else {
      setMistakes(prev => prev + 1);
    }
  };

  const goNext = () => {
    const isWin = remainingLetters === 0 && mistakes < 6;
    const currentWord = shuffledWords[index];

    // Queue progress record for this word
    const progressEntry = {
      word_id: currentWord.id,
      game: 'hangman',
      is_correct: isWin,
    };

    const newPending = [...pendingProgress.filter(p => p.word_id !== currentWord.id), progressEntry];

    // Update score
    if (isWin) setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    else setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    if (shuffledWords[index + 1]) {
      // Flush every 5 words
      if (newPending.length >= 5) {
        flushProgress(newPending);
        setPendingProgress([]);
      } else {
        setPendingProgress(newPending);
      }

      const nextIdx = index + 1;
      splitAndSet(shuffledWords[nextIdx]?.name);
      setIndex(nextIdx);
      setMistakes(0);
      setAlphabet(INITIAL_ALPHABET);
      setFoundLetters([]);
    } else {
      // Last word — flush everything
      flushProgress(newPending);
      setPendingProgress([]);
      setShowGame(false);
      navigate('/games/hangman');
      alert(`Game Finished! ✅ ${score.correct + (isWin ? 1 : 0)} correct / ❌ ${score.wrong + (isWin ? 0 : 1)} wrong`);
    }
  };

  const quitGame = () => {
    flushProgress(pendingProgress);
    setPendingProgress([]);
    setShowGame(false);
    setShuffledWords([]);
    setIndex(0);
  };

  const isWon = remainingLetters === 0 && mistakes < 6;
  const isLost = mistakes === 6;
  const currentWord = shuffledWords[index];

  return {
    lists, loading, showGame, shuffledWords, index, currentWord,
    mistakes, alphabet, foundLetters, splitWord, remainingLetters,
    selectedListId, setSelectedListId, score, isWon, isLost,
    loadLists, startGame, checkLetter, goNext, quitGame
  };
};
