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

export const useSynAntGame = () => {
  const navigate = useNavigate();
  const { lists, fetchLists } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [showGame, setShowGame] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [synOrAnt, setSynOrAnt] = useState('Syn');
  const [targetRelation, setTargetRelation] = useState('');
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

  const decideSynOrAnt = (word) => {
    const hasSyn = word.synonyms && word.synonyms.trim().length > 0;
    const hasAnt = word.antonyms && word.antonyms.trim().length > 0;

    if (hasSyn && hasAnt) {
      const isSyn = Math.random() > 0.5;
      setSynOrAnt(isSyn ? 'Syn' : 'Ant');
      setTargetRelation(isSyn ? word.synonyms : word.antonyms);
    } else if (hasSyn) {
      setSynOrAnt('Syn');
      setTargetRelation(word.synonyms);
    } else {
      setSynOrAnt('Ant');
      setTargetRelation(word.antonyms);
    }
  };

  const startGame = async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      const words = await progressService.getWordsForGame(listId, 'syn_ant');
      
      // Filter words that have at least one synonym or antonym
      const validWords = words.filter(w => 
        (w.synonyms && w.synonyms.trim() !== "") || 
        (w.antonyms && w.antonyms.trim() !== "")
      );

      if (validWords.length < 4) {
        alert('Not enough words with synonyms or antonyms in this list (Minimum 4 required).');
        return;
      }

      const shuffled = shuffler(validWords);
      setShuffledWords(shuffled);
      setIndex(0);
      setScore({ correct: 0, wrong: 0 });
      setPendingProgress([]);
      decideSynOrAnt(shuffled[0]);
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
      game: 'syn_ant',
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
      
      if (pendingProgress.length >= 5) {
        flushProgress(pendingProgress);
        setPendingProgress([]);
      }

      setIndex(nextIdx);
      decideSynOrAnt(shuffledWords[nextIdx]);
      setChoices(generateChoices(shuffledWords[nextIdx], shuffledWords));
      setGameStatus('playing');
    } else {
      flushProgress(pendingProgress);
      setPendingProgress([]);
      setShowGame(false);
      navigate('/dashboard');
      alert(`Game Finished! 🎉 ${score.correct} Correct / ${score.wrong} Mistakes`);
    }
  };

  const quitGame = () => {
    flushProgress(pendingProgress);
    setPendingProgress([]);
    setShowGame(false);
  };

  return {
    lists, loading, showGame, shuffledWords, index, choices,
    gameStatus, synOrAnt, targetRelation, selectedListId, setSelectedListId, score,
    loadLists, startGame, handleAnswer, nextLevel, quitGame
  };
};
