import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHangmanGame } from '../hooks/useHangmanGame';
import { GrPrevious, GrLinkNext } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';

const HangmanFigure = ({ mistakes }) => (
  <svg viewBox="0 0 200 250" className="w-48 h-48 md:w-56 md:h-56" strokeLinecap="round">
    {/* Gallows */}
    <line x1="20" y1="230" x2="180" y2="230" stroke="#00c3ff" strokeWidth="4" />
    <line x1="60" y1="230" x2="60" y2="20" stroke="#00c3ff" strokeWidth="4" />
    <line x1="60" y1="20" x2="130" y2="20" stroke="#00c3ff" strokeWidth="4" />
    <line x1="130" y1="20" x2="130" y2="50" stroke="#00c3ff" strokeWidth="4" />
    {/* Head */}
    {mistakes >= 1 && <circle cx="130" cy="70" r="20" stroke="white" strokeWidth="3" fill="none" />}
    {/* Body */}
    {mistakes >= 2 && <line x1="130" y1="90" x2="130" y2="155" stroke="white" strokeWidth="3" />}
    {/* Left Arm */}
    {mistakes >= 3 && <line x1="130" y1="105" x2="100" y2="135" stroke="white" strokeWidth="3" />}
    {/* Right Arm */}
    {mistakes >= 4 && <line x1="130" y1="105" x2="160" y2="135" stroke="white" strokeWidth="3" />}
    {/* Left Leg */}
    {mistakes >= 5 && <line x1="130" y1="155" x2="100" y2="195" stroke="white" strokeWidth="3" />}
    {/* Right Leg */}
    {mistakes >= 6 && <line x1="130" y1="155" x2="160" y2="195" stroke="white" strokeWidth="3" />}
  </svg>
);

const HideWord = ({ example, wordName, past, gerund, participle }) => {
  let hidden = example;
  const replacements = [
    { word: participle, label: '(Participle)' },
    { word: past, label: '(Past)' },
    { word: gerund, label: '(ing)' },
    { word: wordName, label: '' },
  ];
  replacements.forEach(({ word, label }) => {
    if (word) {
      const regex = new RegExp(word, 'gi');
      hidden = hidden.replace(regex, `______ ${label}`);
    }
  });
  return hidden.includes('______') ? (
    <li className="before:content-['•'] before:mr-2 before:text-[#00c3ff]">{hidden}</li>
  ) : null;
};

export default function HangmanGame() {
  const navigate = useNavigate();
  const {
    lists, loading, showGame, shuffledWords, index, currentWord,
    mistakes, alphabet, foundLetters, splitWord, remainingLetters,
    selectedListId, setSelectedListId, score, isWon, isLost,
    loadLists, startGame, checkLetter, goNext, quitGame
  } = useHangmanGame();

  const [showMeaning, setShowMeaning] = useState(true);

  useEffect(() => { loadLists(); }, [loadLists]);

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 pt-8 pb-4 border-b border-[#00c3ff]/20">
        <button
          onClick={() => { quitGame(); navigate('/dashboard'); }}
          className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <GrPrevious className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
          Hang<span className="text-[#00c3ff]">man</span>
        </h1>
        {showGame ? (
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="text-[#00c3ff]">✓ {score.correct}</span>
            <span className="text-white">✗ {score.wrong}</span>
            <button onClick={() => { quitGame(); }} className="text-[#a0a0a0] hover:text-white transition-colors">
              <FaArrowLeft />
            </button>
          </div>
        ) : <div className="w-28" />}
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">

        {/* --- LIST SELECTION MENU --- */}
        {!showGame && (
          <div className="flex flex-col items-center justify-center gap-6 mt-12">
            <div className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] p-8 w-full max-w-md shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold mb-6 text-center">Select a List to Play</h2>
              {lists.length === 0 ? (
                <p className="text-[#a0a0a0] text-center italic">You don't have any lists yet.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 mb-6 justify-center">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`px-4 py-2 rounded-[10px] text-sm font-bold tracking-wide transition-all border ${selectedListId === list.id
                            ? 'bg-[#00c3ff]/20 border-[#00c3ff] text-[#00c3ff] shadow-[0_0_10px_rgba(0,195,255,0.3)]'
                            : 'bg-[#071320] border-[#00c3ff]/30 text-[#a0a0a0] hover:border-[#00c3ff]/60 hover:text-white'
                          }`}
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!selectedListId || loading}
                    onClick={() => startGame(selectedListId)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#0e0c1d]/60 border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/20 shadow-[0_0_10px_rgba(0,195,255,0.2)] hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] font-bold uppercase tracking-wider rounded-full transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" />
                    ) : (
                      <><MdNotStarted size={22} /> Start Game</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- GAME AREA --- */}
        {showGame && currentWord && (
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

              {/* LEFT: Figure + Word slots */}
              <div className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] p-6 flex flex-col items-center shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                <HangmanFigure mistakes={mistakes} />

                {/* Mistakes bar */}
                <div className="flex gap-1.5 mt-3 mb-5">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className={`h-2 w-6 rounded-full transition-colors ${n <= mistakes ? 'bg-white' : 'bg-[#a0a0a0]/20'}`} />
                  ))}
                </div>

                {/* Word slots */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {splitWord.map((char, i) =>
                    char === '|' ? (
                      <div key={i} className="w-4" />
                    ) : (
                      <div
                        key={i}
                        className={`w-9 h-10 flex items-center justify-center border-b-2 text-xl font-extrabold transition-all ${foundLetters.includes(char)
                            ? 'border-[#00c3ff] text-[#00c3ff] drop-shadow-[0_0_5px_rgba(0,195,255,0.5)]'
                            : isLost
                              ? 'border-white text-white'
                              : 'border-[#a0a0a0]/40 text-transparent'
                          }`}
                      >
                        {foundLetters.includes(char) || isLost ? char : '_'}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* RIGHT: Meaning + Examples */}
              <div className={`bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] p-6 shadow-[0_5px_15px_rgba(0,0,0,0.3)] ${isLost ? 'opacity-40 pointer-events-none' : ''}`}>
                <div
                  className="flex justify-between items-center cursor-pointer group"
                  onClick={() => setShowMeaning(!showMeaning)}
                >
                  <p className="text-xs text-[#00c3ff] uppercase font-bold tracking-widest">Meaning & Examples</p>
                  <button className="text-[#a0a0a0] text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                    {showMeaning ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showMeaning && (
                  <div className="overflow-y-auto max-h-60 mt-4 pr-2 custom-scrollbar border-t border-[#00c3ff]/10 pt-4">
                    <p className="text-[#a0a0a0] text-sm leading-relaxed mb-4">{currentWord.meaning}</p>
                    {currentWord.examples?.length > 0 && (
                      <>
                        <p className="text-[10px] text-[#00c3ff]/70 uppercase font-bold tracking-widest mb-2">Examples</p>
                        <ul className="text-[#a0a0a0] text-sm italic space-y-2">
                          {currentWord.examples.map((ex, i) => (
                            <HideWord
                              key={i}
                              example={ex}
                              wordName={currentWord.name}
                              past={currentWord.past}
                              gerund={currentWord.gerund}
                              participle={currentWord.participle}
                            />
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alphabet Keyboard */}
            {!isWon && !isLost && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {alphabet.map((letter, i) => (
                  <button
                    key={i}
                    onClick={() => checkLetter(letter)}
                    disabled={remainingLetters === 0 || mistakes === 6}
                    className="w-10 h-10 bg-[#0e0c1d]/80 border border-[#00c3ff]/30 text-white font-bold rounded-lg hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:text-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] transition-all text-sm disabled:opacity-30"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {/* Win panel */}
            {isWon && (
              <div className="bg-[#00c3ff]/10 border border-[#00c3ff]/50 rounded-[20px] p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm">
                <p className="text-[#00c3ff] text-3xl font-extrabold"> You Found It!</p>
                <p className="text-[#a0a0a0] mb-4">You successfully guessed the word.</p>
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00c3ff]/20 border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/30 font-bold uppercase tracking-wider rounded-full transition-all"
                >
                  <GrLinkNext /> Next Word
                </button>
              </div>
            )}

            {/* Lose panel */}
            {isLost && (
              <div className="bg-white/10 border border-white/50 rounded-[20px] p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm">
                <p className="text-white text-3xl font-extrabold"> You Lost</p>
                <p className="text-[#a0a0a0] mb-4">The word was: <span className="text-white font-bold">{currentWord.name}</span></p>
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 border border-white/50 text-white hover:bg-white/30 font-bold uppercase tracking-wider rounded-full transition-all"
                >
                  <GrLinkNext /> Next Word
                </button>
              </div>
            )}

            {/* Progress */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-sm">
              {shuffledWords.map((_, i) => (
                <div key={i} className={`h-1.5 w-4 rounded-full transition-colors ${i < index ? 'bg-[#00c3ff]' : i === index ? 'bg-white' : 'bg-[#a0a0a0]/30'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
