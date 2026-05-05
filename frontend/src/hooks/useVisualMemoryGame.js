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

export const useVisualMemoryGame = () => {
  const navigate = useNavigate();
  const { lists, fetchLists } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [showGame, setShowGame] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [pendingProgress, setPendingProgress] = useState([]);

  const loadLists = useCallback(async () => {
    if (lists.length === 0) await fetchLists();
  }, [lists.length, fetchLists]);

  const generateChoices = (currentWord, allWords) => {
    const distractors = allWords.filter(w => w.id !== currentWord.id);
    const shuffledDistractors = shuffler(distractors).slice(0, 3);
    const options = [...shuffledDistractors, currentWord];
    return shuffler(options);
  };

  const startGame = async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      // Backend automatically excludes words played correctly recently
      const words = await progressService.getWordsForGame(listId, 'visual_memory');

      // We need words with images
      const validWords = words.filter(w => w.image && w.image.trim() !== "");

      if (validWords.length < 4) {
        alert('Not enough words with images in this list (Minimum 4 required). Try adding images or play later!');
        return;
      }

      const shuffled = shuffler(validWords);
      setShuffledWords(shuffled);
      setIndex(0);
      setScore({ correct: 0, wrong: 0 });
      setPendingProgress([]);
      setChoices(generateChoices(shuffled[0], shuffled));
      setGameStatus('playing');
      setShowGame(true);
    } catch (e) {
      console.error('Error starting game:', e);
      alert('Could not load words.');
    } finally {
      setLoading(false);
    }
  };

  const flushProgress = async (pending) => {
    if (!pending || pending.length === 0) return;
    try {
      await progressService.saveBulkProgress(pending);
    } catch (e) {
      console.error('Progress save error:', e);
    }
  };

  const handleAnswer = (selectedWord) => {
    if (gameStatus !== 'playing') return;

    const correctWord = shuffledWords[index];
    const isCorrect = selectedWord.id === correctWord.id;

    const progressEntry = {
      word_id: correctWord.id,
      game: 'visual_memory',
      is_correct: isCorrect
    };

    const newPending = [...pendingProgress.filter(p => p.word_id !== correctWord.id), progressEntry];
    setPendingProgress(newPending);

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setGameStatus('won');
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setGameStatus('lost');
    }
  };

  const nextLevel = () => {
    if (index + 1 < shuffledWords.length) {
      const nextIdx = index + 1;

      // Flush every 5 words
      if (pendingProgress.length >= 5) {
        flushProgress(pendingProgress);
        setPendingProgress([]);
      }

      setIndex(nextIdx);
      setChoices(generateChoices(shuffledWords[nextIdx], shuffledWords));
      setGameStatus('playing');
    } else {
      flushProgress(pendingProgress);
      setPendingProgress([]);
      setShowGame(false);
      navigate('/dashboard');
      alert(`Game Finished!  ${score.correct} Correct / ${score.wrong} Mistakes`);
    }
  };

  const quitGame = () => {
    flushProgress(pendingProgress);
    setPendingProgress([]);
    setShowGame(false);
  };

  return {
    lists, loading, showGame, shuffledWords, index, choices,
    gameStatus, selectedListId, setSelectedListId, score,
    loadLists, startGame, handleAnswer, nextLevel, quitGame
  };
};
