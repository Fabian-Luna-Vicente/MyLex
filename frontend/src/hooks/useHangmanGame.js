import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from './useVocabulary';

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
  const { lists, fetchLists, fetchListDetails } = useVocabulary();

  const [shuffledWords, setShuffledWords] = useState([]);
  const [showGame, setShowGame] = useState(false);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0); // 0-6, 6 = lose
  const [alphabet, setAlphabet] = useState(INITIAL_ALPHABET);
  const [foundLetters, setFoundLetters] = useState([]);
  const [splitWord, setSplitWord] = useState([]);
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

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
      const listData = await fetchListDetails(listId);
      const words = listData?.words || [];

      if (words.length === 0) {
        alert('This list has no words!');
        return;
      }

      const shuffled = shuffler(words);
      setShuffledWords(shuffled);
      setIndex(0);
      setMistakes(0);
      setAlphabet(INITIAL_ALPHABET);
      setFoundLetters([]);
      setScore({ correct: 0, wrong: 0 });
      splitAndSet(shuffled[0]?.name);
      setShowGame(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    if (isWin) setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    else setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    if (shuffledWords[index + 1]) {
      setIndex(prev => {
        const next = prev + 1;
        splitAndSet(shuffledWords[next]?.name);
        return next;
      });
      setMistakes(0);
      setAlphabet(INITIAL_ALPHABET);
      setFoundLetters([]);
    } else {
      setShowGame(false);
      navigate('/games/hangman');
      alert('Game Finished!');
    }
  };

  const quitGame = () => {
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
