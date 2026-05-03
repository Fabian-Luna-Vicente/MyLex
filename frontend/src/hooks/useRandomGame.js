import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from './useVocabulary';

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
  const { lists, fetchLists, fetchListDetails } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [face, setFace] = useState(1);
  const [lap, setLap] = useState(1);
  const [showElement, setShowElement] = useState(true);
  const [difficulty, setDifficulty] = useState({ easy: [], normal: [], hard: [], ultrahard: [] });
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLists = useCallback(async () => {
    if (lists.length === 0) await fetchLists();
  }, [lists.length, fetchLists]);

  const startGame = async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      const listData = await fetchListDetails(listId);
      const words = listData?.words || [];

      if (words.length === 0) {
        alert('This list has no words!');
        return;
      }

      const shuffled = shuffler(words);
      setShuffledWords(shuffled);
      setIndex(0);
      setLap(1);
      setFace(1);
      setDifficulty({ easy: [], normal: [], hard: [], ultrahard: [] });
      setShowElement(true);
      setShowGame(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = (currentIndex, currentDifficulty) => {
    const payload = {
      game: 'random',
      listId: selectedListId,
      position: currentIndex,
      difficulty: currentDifficulty,
    };
    localStorage.setItem(`mylex_random_${selectedListId}`, JSON.stringify(payload));
  };

  function removeAndAdd(typeLevel, word, currentDifficulty) {
    const updated = { ...currentDifficulty };
    for (const key in updated) {
      updated[key] = updated[key].filter(w => w.id !== word.id);
    }
    updated[typeLevel] = [...updated[typeLevel], word];
    return updated;
  }

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
    if (currentIndex > 0 && currentIndex % 5 === 0) saveProgress(currentIndex, currentDifficulty);
    setFace(1);

    let nextIndex = currentIndex + 1;
    let nextLap = currentLap;

    const updatedDifficulty = typeLevel ? removeAndAdd(typeLevel, word, currentDifficulty) : currentDifficulty;
    if (typeLevel) setDifficulty(updatedDifficulty);

    if (!shuffledWords[nextIndex]) {
      nextIndex = 0;
      nextLap = currentLap + 1;

      if (nextLap > 5) {
        saveProgress(currentIndex, updatedDifficulty);
        setShowGame(false);
        setIndex(0);
        navigate('/games/random');
        alert('Great! Session Finished.');
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
