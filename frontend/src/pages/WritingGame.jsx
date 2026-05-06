import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWritingGame } from '../hooks/useWritingGame';
import { GrPrevious, GrLinkNext } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { FaRobot, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function WritingGame() {
  const navigate = useNavigate();
  const {
    lists, loading, showGame, shuffledWords, index, text, setText,
    selectedListId, setSelectedListId, aiFeedback, aiError, aiLoading,
    loadLists, startGame, handleCheck, nextLevel, quitGame
  } = useWritingGame();

  useEffect(() => { loadLists(); }, [loadLists]);

  const currentWords = [
    shuffledWords[index],
    shuffledWords[index + 1],
    shuffledWords[index + 2]
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>

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
          Writing <span className="text-[#00c3ff]">Skills</span>
        </h1>
        {showGame ? (
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">
            Batch {Math.floor(index / 3) + 1} / {Math.ceil(shuffledWords.length / 3)}
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
              <h2 className="text-xl font-bold mb-6 text-center text-white/90">Practice your grammar</h2>

              {lists.length === 0 ? (
                <p className="text-[#a0a0a0] text-center italic">No lists found. Go add some words first!</p>
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
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00c3ff]/10 to-[#00c3ff]/10 border border-[#00c3ff]/50 text-[#00c3ff] hover:from-[#00c3ff]/20 hover:to-[#00c3ff]/20 shadow-[0_0_20px_rgba(0,195,255,0.2)] font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" />
                    ) : (
                      <><MdNotStarted size={22} /> Start Writing</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* --- GAME AREA --- */}
        <AnimatePresence mode="wait">
          {showGame && currentWords.length > 0 && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-[#0e0c1d]/40 backdrop-blur-md border border-[#ffffff05] rounded-[30px] p-8 shadow-2xl">
                <h2 className="text-[#a0a0a0] uppercase tracking-[2px] font-bold text-sm text-center mb-6">
                  Write sentences using these words:
                </h2>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {currentWords.map((word, i) => (
                    <span key={i} className="px-6 py-3 bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/30 rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(0,195,255,0.2)]">
                      {word.name}
                    </span>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing your sentences here..."
                  className="w-full bg-[#071320]/80 border border-[#00c3ff]/30 rounded-[20px] p-6 text-white text-lg focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all min-h-[150px] resize-y"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <button
                    onClick={handleCheck}
                    disabled={aiLoading || !text.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#071320] border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/10 rounded-full font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" /> AI Thinking...</>
                    ) : (
                      <><FaRobot size={20} /> Check Grammar</>
                    )}
                  </button>

                  <button
                    onClick={nextLevel}
                    disabled={!aiFeedback || !aiFeedback.words_used_correctly}
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 font-black rounded-full transition-all uppercase tracking-widest text-sm group ${!aiFeedback || !aiFeedback.words_used_correctly
                      ? 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
                      : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95'
                      }`}
                  >
                    Continue <GrLinkNext className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-[15px] flex items-center gap-3">
                  <FaExclamationCircle /> {aiError}
                </div>
              )}

              {aiFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-br from-[#0e0c1d] to-[#071320] border border-[#00c3ff]/30 rounded-[30px] p-8 shadow-[0_10px_30px_rgba(0,195,255,0.15)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaRobot size={100} />
                  </div>

                  <h3 className="text-[#00c3ff] font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-sm">
                    <FaRobot /> AI Teacher Feedback
                  </h3>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <h4 className="text-[10px] text-[#a0a0a0] uppercase tracking-widest mb-2">Corrected Version</h4>
                      <p className="text-lg text-white italic border-l-4 border-[#00ff88]/50 pl-4 py-1">
                        "{aiFeedback.corrected_text}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] text-[#a0a0a0] uppercase tracking-widest mb-2">Explanation</h4>
                      <p className="text-[#e0e0e0] leading-relaxed">
                        {aiFeedback.explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#ffffff05]">
                      {aiFeedback.words_used_correctly ? (
                        <span className="flex items-center gap-2 text-[#00ff88] text-sm font-bold uppercase tracking-wider">
                          <FaCheckCircle /> Required words used correctly
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider">
                          <FaExclamationCircle /> Missing or incorrect usage of required words
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
