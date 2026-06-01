import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualMemoryGame } from '../hooks/useVisualMemoryGame';
import { GrPrevious, GrLinkNext } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export default function VisualMemoryGame() {
  const navigate = useNavigate();
  const {
    lists, loading, showGame, shuffledWords, index, choices,
    gameStatus, selectedListId, setSelectedListId, score,
    loadLists, startGame, handleAnswer, nextLevel, quitGame
  } = useVisualMemoryGame();

  useEffect(() => { loadLists(); }, [loadLists]);

  const currentWord = shuffledWords[index];

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00c3ff]/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00c3ff]/5 blur-[100px] rounded-full"></div>

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-center justify-between px-4 md:px-12 pt-4 md:pt-8 pb-4 border-b border-[#00c3ff]/20 backdrop-blur-md sticky top-0 bg-[#071320]/80 gap-3">
        <div className="flex w-full md:w-auto justify-between items-center">
          <button
            onClick={() => { quitGame(); navigate('/dashboard'); }}
            className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors font-bold uppercase tracking-widest text-[10px] md:text-xs"
          >
            <GrPrevious className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>

          {/* Progress (Mobile only) */}
          {showGame && (
            <div className="md:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-[#00c3ff]">✓ {score.correct}</span>
              <span className="text-white">✗ {score.wrong}</span>
              <span className="text-[#a0a0a0] ml-1">{index + 1}/{shuffledWords.length}</span>
            </div>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
          Visual <span className="text-[#00c3ff]">Memory</span>
        </h1>
        {showGame ? (
          <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="text-[#00c3ff]">✓ {score.correct}</span>
            <span className="text-white">✗ {score.wrong}</span>
            <span className="text-[#a0a0a0] ml-2">{index + 1}/{shuffledWords.length}</span>
          </div>
        ) : <div className="w-24 hidden md:block" />}
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 md:px-12 py-4 md:py-10 relative z-10">

        {/* --- LIST SLECTION MENU --- */}
        {!showGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 mt-12"
          >
            <div className="bg-[#0e0c1d]/60 backdrop-blur-[20px] border border-[#00c3ff]/20 rounded-[30px] p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-center text-white/90">Choose a list to test your memory</h2>
              {lists.length === 0 ? (
                <p className="text-[#a0a0a0] text-center italic">No lists found. Create one first!</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all border ${selectedListId === list.id
                          ? 'bg-[#00c3ff]/20 border-[#00c3ff] text-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.3)]'
                          : 'bg-[#071320] border-[#00c3ff]/20 text-[#a0a0a0] hover:border-[#00c3ff]/50 hover:text-white'
                          }`}
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!selectedListId || loading}
                    onClick={() => startGame(selectedListId)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00c3ff]/10 to-blue-500/10 border border-[#00c3ff]/50 text-[#00c3ff] hover:from-[#00c3ff]/20 hover:to-blue-500/20 shadow-[0_0_20px_rgba(0,195,255,0.2)] font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" />
                    ) : (
                      <><MdNotStarted size={22} /> Start Session</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* --- GAME AREA --- */}
        <AnimatePresence mode="wait">
          {showGame && currentWord && (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-8 mt-4"
            >
              <h2 className="text-lg md:text-2xl font-bold text-center text-white/80">What does this represent?</h2>

              {/* Image Container */}
              <div className="relative w-full max-w-lg h-[25vh] min-h-[150px] md:h-[350px] bg-[#0e0c1d]/60 backdrop-blur-md border border-[#ffffff10] rounded-[20px] md:rounded-[30px] p-2 md:p-6 shadow-2xl flex items-center justify-center overflow-hidden group">
                <img
                  src={currentWord.image}
                  alt="Game visual"
                  className="max-h-full max-w-full object-contain rounded-xl md:rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071320] to-transparent opacity-30 pointer-events-none"></div>
              </div>

              {/* Choices Grid */}
              <div className={`grid grid-cols-2 gap-2 md:gap-4 w-full max-w-2xl ${gameStatus !== 'playing' ? 'pointer-events-none' : ''}`}>
                {choices.map((choice, i) => {
                  let statusColor = "bg-[#0e0c1d]/60 border-[#ffffff10] text-[#a0a0a0] hover:border-[#00c3ff] hover:text-white";

                  if (gameStatus !== 'playing') {
                    if (choice.id === currentWord.id) statusColor = "bg-[#00c3ff]/20 border-[#00c3ff] text-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.3)]";
                    else statusColor = "bg-white/10 border-white/50 text-white opacity-50";
                  }

                  return (
                    <motion.button
                      key={choice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleAnswer(choice)}
                      className={`px-2 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl border font-bold text-xs md:text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center text-center leading-tight ${statusColor}`}
                    >
                      {choice.name}
                    </motion.button>
                  );
                })}
              </div>

              {/* Result Feedback & Next Button */}
              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2 md:gap-4 mt-2 md:mt-4"
                >
                  <p className={`text-xl md:text-2xl font-extrabold uppercase tracking-widest ${gameStatus === 'won' ? 'text-[#00c3ff] drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}>
                    {gameStatus === 'won' ? 'Brilliant!' : 'Not Quite!'}
                  </p>
                  <p className="text-[#a0a0a0] text-sm md:text-base mb-1 font-medium">The correct word was: <span className="text-white font-bold">{currentWord.name}</span></p>
                  <button
                    onClick={nextLevel}
                    className="flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 bg-[#00c3ff] text-black font-extrabold rounded-full hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-xs md:text-sm"
                  >
                    <GrLinkNext className="text-black" /> Next Challenge
                  </button>
                </motion.div>
              )}

              {/* Progress Tracker */}
              <div className="flex gap-1 md:gap-2 mt-4 md:mt-8 flex-wrap justify-center">
                {shuffledWords.map((_, i) => (
                  <div key={i} className={`h-1.5 w-4 md:w-6 rounded-full transition-all duration-500 ${i < index ? 'bg-[#00c3ff]' : i === index ? 'bg-white w-6 md:w-10 shadow-[0_0_10px_white]' : 'bg-[#a0a0a0]/20'}`} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
