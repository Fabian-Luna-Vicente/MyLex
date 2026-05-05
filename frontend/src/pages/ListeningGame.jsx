import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListeningGame } from '../hooks/useListeningGame';
import { GrPrevious, GrLinkNext } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { CiPlay1 } from 'react-icons/ci';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListeningGame() {
  const navigate = useNavigate();
  const {
    lists, loading, showGame, shuffledWords, index, choices,
    gameStatus, selectedListId, setSelectedListId, score,
    loadLists, startGame, handleAnswer, nextLevel, quitGame, playAudio
  } = useListeningGame();

  useEffect(() => { loadLists(); }, [loadLists]);

  const currentWord = shuffledWords[index];

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00ff88]/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8 pb-4 border-b border-[#00c3ff]/20 backdrop-blur-md sticky top-0 bg-[#071320]/80">
        <button
          onClick={() => { quitGame(); navigate('/dashboard'); }}
          className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <GrPrevious className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] flex items-center gap-2">
          Listening <span className="text-[#00c3ff]">Practice</span>
        </h1>
        {showGame ? (
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="text-[#00ff88]">✓ {score.correct}</span>
            <span className="text-[#ff4d4d]">✗ {score.wrong}</span>
            <span className="text-[#a0a0a0] ml-2">{index + 1}/{shuffledWords.length}</span>
          </div>
        ) : <div className="w-24 md:block hidden" />}
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 relative z-10">

        {/* --- LIST SELECTION MENU --- */}
        {!showGame && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 mt-12"
          >
            <div className="bg-[#0e0c1d]/60 backdrop-blur-[20px] border border-[#00c3ff]/20 rounded-[30px] p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-center text-white/90">Sharpen your ears</h2>
              {lists.length === 0 ? (
                <p className="text-[#a0a0a0] text-center italic">No lists found. Go add some words first!</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all border ${
                          selectedListId === list.id
                            ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                            : 'bg-[#071320] border-[#00c3ff]/20 text-[#a0a0a0] hover:border-[#00ff88]/50 hover:text-white'
                        }`}
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!selectedListId || loading}
                    onClick={() => startGame(selectedListId)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00ff88]/10 to-[#00c3ff]/10 border border-[#00ff88]/50 text-[#00ff88] hover:from-[#00ff88]/20 hover:to-[#00c3ff]/20 shadow-[0_0_20px_rgba(0,255,136,0.2)] font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00ff88] border-t-transparent" />
                    ) : (
                      <><MdNotStarted size={22} /> Play Now</>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-8 mt-4"
            >
              <div className="text-center space-y-6 flex flex-col items-center">
                <h2 className="text-[#a0a0a0] uppercase tracking-[4px] font-bold text-sm">
                  What did you hear?
                </h2>
                
                <button
                  onClick={() => playAudio(currentWord.name)}
                  className="relative group w-32 h-32 rounded-full bg-gradient-to-br from-[#0e0c1d] to-[#071320] border-2 border-[#00c3ff] shadow-[0_0_30px_rgba(0,195,255,0.4)] flex items-center justify-center hover:scale-105 transition-all"
                >
                  <div className="absolute inset-0 rounded-full bg-[#00c3ff]/20 animate-ping opacity-50 group-hover:opacity-100"></div>
                  <CiPlay1 size={50} className="text-[#00c3ff] ml-2 relative z-10" />
                </button>
                
                <p className="text-xs text-[#00c3ff]/60 uppercase tracking-widest">Click to replay</p>
              </div>

              {/* Choices Container */}
              <div className="bg-[#0e0c1d]/40 backdrop-blur-md border border-[#ffffff05] rounded-[40px] p-10 w-full max-w-2xl shadow-2xl mt-4">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${gameStatus !== 'playing' ? 'pointer-events-none' : ''}`}>
                  {choices.map((choice, i) => {
                    let statusColor = "bg-[#071320] border-[#ffffff10] text-[#a0a0a0] hover:border-[#00ff88] hover:text-[#00ff88] hover:bg-[#00ff88]/5";
                    
                    if (gameStatus !== 'playing') {
                      if (choice.id === currentWord.id) statusColor = "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)]";
                      else statusColor = "bg-red-500/5 border-red-500/20 text-red-500/40";
                    }

                    return (
                      <motion.button
                        key={choice.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleAnswer(choice)}
                        className={`px-8 py-6 rounded-3xl border font-bold text-xl transition-all shadow-lg active:scale-95 flex items-center justify-center ${statusColor}`}
                      >
                        {choice.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Overlay */}
              {gameStatus !== 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5 text-center mt-4"
                >
                  <div className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-[4px] ${gameStatus === 'won' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/20 text-red-500'}`}>
                    {gameStatus === 'won' ? 'Correct!' : 'Incorrect'}
                  </div>
                  <p className="text-xl">
                    The spoken word was <span className="text-white font-bold">"{currentWord.name}"</span>
                  </p>
                  <p className="text-[#a0a0a0] italic text-sm">Meaning: {currentWord.meaning}</p>
                  <button 
                    onClick={nextLevel}
                    className="flex items-center gap-4 px-12 py-5 bg-white text-black font-black rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all uppercase tracking-widest text-sm group mt-2"
                  >
                    Continue <GrLinkNext className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* Progress */}
              <div className="mt-8 flex items-center gap-4">
                <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest">Progress</span>
                <div className="flex gap-1.5">
                  {shuffledWords.map((_, i) => (
                    <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i < index ? 'bg-[#00ff88]' : i === index ? 'bg-white scale-y-150' : 'bg-[#a0a0a0]/10'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
