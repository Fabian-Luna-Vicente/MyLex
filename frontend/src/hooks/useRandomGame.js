import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from './useVocabulary';
import { progressService } from '../services/progressService';

function shuffler(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useRandomGame = () => {
  const navigate = useNavigate();
  const { lists, fetchLists } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [face, setFace] = useState(1);
  const [lap, setLap] = useState(1);
  const [showElement, setShowElement] = useState(true);
  const [difficulty, setDifficulty] = useState({ easy: [], normal: [], hard: [], ultrahard: [] });
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);

  // Accumulate pending progress to bulk-save at end / every 5 words
  const [pendingProgress, setPendingProgress] = useState([]);

  const loadLists = useCallback(async () => {
    if (lists.length === 0) await fetchLists();
  }, [lists.length, fetchLists]);

  const startGame = async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      // Fetch words with spaced-repetition ordering from the backend
      const words = await progressService.getWordsForGame(listId, 'random');

      if (!words || words.length === 0) {
        alert('This list has no words!');
        return;
      }

      // Shuffle the pre-filtered list for extra randomness within priority groups
      const shuffled = shuffler(words);
      setShuffledWords(shuffled);
      setIndex(0);
      setLap(1);
      setFace(1);
      setDifficulty({ easy: [], normal: [], hard: [], ultrahard: [] });
      setPendingProgress([]);
      setShowElement(true);
      setShowGame(true);
    } catch (e) {
      console.error('Error starting game:', e);
      alert('Could not load words. Make sure the list has words.');
    } finally {
      setLoading(false);
    }
  };

  /** Flush all pending progress records to the backend */
  const flushProgress = async (pending) => {
    if (!pending || pending.length === 0) return;
    try {
      await progressService.saveBulkProgress(pending);
    } catch (e) {
      console.error('Progress save error (non-critical):', e);
    }
  };

  function removeAndAdd(typeLevel, word, currentDifficulty) {
    const updated = { ...currentDifficulty };
    for (const key in updated) {
      updated[key] = updated[key].filter(w => w.id !== word.id);
    }
    updated[typeLevel] = [...updated[typeLevel], word];
    return updated;
  }

  /**
   * Queue a progress record. Flushed every 5 decisions or at end of game.
   */
  const queueProgress = (word, difficultyLevel, pending) => {
    const newEntry = { word_id: word.id, game: 'random', difficulty: difficultyLevel };
    const updated = [...pending.filter(p => p.word_id !== word.id), newEntry];
    // Flush every 5 queued records
    if (updated.length >= 5) {
      flushProgress(updated);
      return [];
    }
    return updated;
  };

  const discriminator = (nextIndex, nextLap, updatedDifficulty) => {
    const word = shuffledWords[nextIndex];
    if (!word) return;
    const { ultrahard, hard, normal } = updatedDifficulty;

    const isPending =
      (nextLap === 3 && (ultrahard.find(w => w.id === word.id) || hard.find(w => w.id === word.id) || normal.find(w => w.id === word.id))) ||
      (nextLap === 4 && (ultrahard.find(w => w.id === word.id) || hard.find(w => w.id === word.id))) ||
      (nextLap === 5 && ultrahard.find(w => w.id === word.id));

    if (isPending) {
      setIndex(nextIndex);
      setLap(nextLap);
      setShowElement(true);
    } else {
      next('', word, nextIndex, nextLap, updatedDifficulty);
    }
  };

  const next = (typeLevel, word, currentIndex, currentLap, currentDifficulty = difficulty) => {
    setFace(1);

    const updatedDifficulty = typeLevel ? removeAndAdd(typeLevel, word, currentDifficulty) : currentDifficulty;
    if (typeLevel) {
      setDifficulty(updatedDifficulty);
      // Queue progress for this word
      setPendingProgress(prev => queueProgress(word, typeLevel, prev));
    }

    let nextIndex = currentIndex + 1;
    let nextLap = currentLap;

    if (!shuffledWords[nextIndex]) {
      nextIndex = 0;
      nextLap = currentLap + 1;

      if (nextLap > 5) {
        // End of session — flush all remaining progress
        setPendingProgress(prev => {
          flushProgress(prev);
          return [];
        });
        setShowGame(false);
        setIndex(0);
        navigate('/games/random');
        alert('Great! Session Finished. 🎉');
        return;
      }

      setShowElement(false);
      discriminator(nextIndex, nextLap, updatedDifficulty);
      return;
    }

    if (nextLap >= 3) {
      setShowElement(false);
      discriminator(nextIndex, nextLap, updatedDifficulty);
    } else {
      setIndex(nextIndex);
      setLap(nextLap);
      setShowElement(true);
    }
  };

  const quitGame = () => {
    // Flush on quit too
    flushProgress(pendingProgress);
    setPendingProgress([]);
    setShowGame(false);
    setShuffledWords([]);
    setIndex(0);
  };

  const playSound = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return {
    lists, loading, showGame, shuffledWords, index, face, setFace,
    lap, showElement, difficulty, selectedListId, setSelectedListId,
    loadLists, startGame, next, quitGame, playSound
  };
};
