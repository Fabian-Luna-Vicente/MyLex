import React from 'react';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListeningGame } from '../hooks/useListeningGame';
import { GrPrevious, GrLinkNext } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { CiPlay1 } from 'react-icons/ci';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListeningGame() {
  const navigate = useNavigate();
  const [subIndex, setSubIndex] = useState(0);
  const {
    lists, loading, showGame, shuffledWords, index, userAnswers, setUserAnswers,
    gameStatus, selectedListId, setSelectedListId, score, setGameStatus,
    loadLists, startGame, handleAnswer, nextLevel, quitGame, playFullAudio
  } = useListeningGame();

  const inputRef = useRef(null);
  const currentWord = shuffledWords[index];
  useEffect(() => { loadLists(); }, [loadLists]);

  useEffect(() => {
    if (showGame && gameStatus === 'playing') {
      inputRef.current?.focus();
    }
  }, [index, showGame, gameStatus]);

  useEffect(() => {
    if (showGame && currentWord) {
      console.log(" [DEBUG] Answers for", currentWord.name);
    }
  }, [currentWord, showGame]);



  const puzzle = useMemo(() => {
    if (!currentWord) return null;
    const correctAnswers = {};
    const baseWordLower = currentWord.name.toLowerCase();

    const baseRoot = baseWordLower.length > 4 ? baseWordLower.slice(0, -2) : baseWordLower;

    const processedExamples = (currentWord.examples || []).map((ex, exIdx) => {
      const words = ex.split(' ');
      let extraBlanksCount = 0;
      const targetExtra = words.length > 8 ? 2 : 1;

      return words.map((w, wIdx) => {
        const match = w.match(/^([^a-zA-Z]*)([a-zA-Z'-]+)([^a-zA-Z]*)$/);
        const prefix = match ? match[1] : '';
        const clean = match ? match[2] : w.replace(/[.,!?;:()"]/g, '');
        const suffix = match ? match[3] : '';
        const isMain = clean.toLowerCase() === baseWordLower ||
          (clean.toLowerCase().startsWith(baseRoot) && Math.abs(clean.length - baseWordLower.length) <= 4);

        if (isMain) {
          const id = `ex-${exIdx}-main-${wIdx}`;
          correctAnswers[id] = clean;
          return { type: 'blank', id, correct: clean, prefix, suffix, isMain: true };
        }

        if (extraBlanksCount < targetExtra && clean.length > 4 && Math.random() > 0.6) {
          const id = `ex-${exIdx}-extra-${wIdx}`;
          correctAnswers[id] = clean;
          extraBlanksCount++;
          return { type: 'blank', id, correct: clean, prefix, suffix, isMain: false };
        }

        return { type: 'text', content: w + ' ' };
      });
    });

    return { examples: processedExamples, correctAnswers };
  }, [currentWord]);


  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>

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

        <h1 className="text-xl md:text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] flex items-center gap-2">
          Listening <span className="text-[#00c3ff]">Practice</span>
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
                    onClick={() => { startGame(selectedListId); setSubIndex(0); }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-[#00c3ff]/10 border border-[#00c3ff]/50 text-[#00c3ff] hover:from-blue-500/20 hover:to-[#00c3ff]/20 shadow-[0_0_20px_rgba(0,195,255,0.2)] font-bold uppercase tracking-wider rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" />
                    ) : (
                      <><MdNotStarted size={22} /> Play Now</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {showGame && currentWord && (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-4 md:gap-8 mt-2 md:mt-4"
            >
              <div className="text-center space-y-4 md:space-y-6 flex flex-col items-center">
                <h2 className="text-[#a0a0a0] uppercase tracking-[2px] md:tracking-[4px] font-bold text-xs md:text-sm">
                  What did you hear?
                </h2>
                <button
                  onClick={() => playFullAudio(currentWord)}
                  className="relative group w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#0e0c1d] to-[#071320] border-2 border-[#00c3ff] shadow-[0_0_20px_rgba(0,195,255,0.3)] flex items-center justify-center hover:scale-105 transition-all"
                >
                  <div className="absolute inset-0 rounded-full bg-[#00c3ff]/20 animate-ping opacity-30 group-hover:opacity-100"></div>
                  <CiPlay1 className="text-[#00c3ff] ml-1.5 relative z-10 w-8 h-8 md:w-10 md:h-10" />
                </button>
                <p className="text-[10px] text-[#00c3ff]/60 uppercase tracking-widest font-bold">Listen to word and examples</p>
              </div>

              <div className="w-full max-w-3xl bg-[#0e0c1d]/40 backdrop-blur-md border border-[#ffffff05] rounded-[20px] md:rounded-[40px] p-4 md:p-8 shadow-2xl space-y-4 md:space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-[#00c3ff] uppercase tracking-[4px]">
                      Example {subIndex + 1} of {puzzle?.examples.length || 1}
                    </h3>
                    <div className="h-1 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00c3ff] transition-all duration-500"
                        style={{ width: `${((subIndex + 1) / (puzzle?.examples.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {puzzle?.examples[subIndex] && (
                    <div className="bg-white/5 p-4 md:p-8 rounded-[20px] md:rounded-[35px] border border-white/5 leading-loose text-base md:text-xl flex flex-wrap items-center justify-center gap-x-2 gap-y-2 md:gap-y-4 shadow-inner min-h-[100px] md:min-h-[140px]">
                      {puzzle.examples[subIndex].map((item, j) => (
                        item.type === 'text' ? (
                          <span key={j} className="text-white/80 tracking-normal mx-1">{item.content}</span>
                        ) : (
                          <span key={j} className="inline-flex items-center mx-1">
                            {item.prefix && <span className="text-white/80 mr-1">{item.prefix}</span>}
                            <input
                              ref={item.isMain ? inputRef : null}
                              type="text"
                              value={userAnswers[item.id] || ''}
                              onChange={(e) => setUserAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && gameStatus === 'playing' && document.getElementById('verify-btn').click()}
                              disabled={gameStatus !== 'playing'}
                              autoFocus={item.isMain}
                              placeholder={item.isMain ? '???' : '...'}
                              style={{ width: `${(item.correct.length * 1.2) + 2}ch` }}
                              className={`bg-[#071320] border-b-2 px-3 py-0.5 text-center transition-all outline-none font-bold ${gameStatus === 'playing'
                                ? item.isMain ? 'border-[#00c3ff] text-white' : 'border-[#00c3ff]/30 focus:border-[#00c3ff] text-[#00c3ff]'
                                : (userAnswers[item.id] || '').trim().toLowerCase() === item.correct.toLowerCase()
                                  ? 'border-[#00c3ff] text-[#00c3ff]'
                                  : 'border-white text-white'
                                }`}
                            />
                            {item.suffix && <span className="text-white/20 ml-1">{item.suffix}</span>}
                          </span>
                        )
                      ))}
                    </div>
                  )}

                  {(!currentWord.examples || currentWord.examples.length === 0) && (
                    <div className="text-center py-10 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                      <p className="text-[#a0a0a0] font-bold uppercase tracking-widest text-xs mb-6">Type the word you hear</p>
                      <input
                        type="text"
                        value={userAnswers['main'] || ''}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, 'main': e.target.value }))}
                        disabled={gameStatus !== 'playing'}
                        className={`bg-[#071320] border-4 rounded-3xl px-10 py-5 text-center text-3xl font-black outline-none transition-all ${gameStatus === 'playing' ? 'border-[#00c3ff]/30 focus:border-[#00c3ff] text-white' : (userAnswers['main'] || '').trim().toLowerCase() === currentWord.name.toLowerCase() ? 'border-[#00c3ff] text-[#00c3ff]' : 'border-white text-white'
                          }`}
                        placeholder="???"
                      />
                    </div>
                  )}
                </div>

                {gameStatus === 'playing' ? (
                  <button
                    id="verify-btn"
                    onClick={() => {
                      const currentBlanks = {};
                      if (puzzle?.examples[subIndex]) {
                        puzzle.examples[subIndex].forEach(item => {
                          if (item.type === 'blank') currentBlanks[item.id] = item.correct;
                        });
                      } else {
                        currentBlanks['main'] = currentWord.name;
                      }
                      handleAnswer(currentBlanks);
                    }}
                    className="w-full py-4 md:py-6 bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black font-black rounded-full uppercase tracking-[2px] shadow-[0_0_30px_rgba(0,195,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-base"
                  >
                    Verify Example
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className={`text-sm md:text-xl font-black uppercase tracking-widest ${gameStatus === 'won' ? 'text-[#00c3ff]' : 'text-white'}`}>
                      {gameStatus === 'won' ? '✓ Perfectly Done!' : '✗ Check your mistakes'}
                    </div>
                    {subIndex + 1 < (puzzle?.examples.length || 0) ? (
                      <button
                        onClick={() => {
                          setSubIndex(subIndex + 1);
                          setGameStatus('playing');
                        }}
                        className="w-full py-4 md:py-6 bg-white text-black font-black rounded-full uppercase tracking-[2px] flex items-center justify-center gap-4 hover:bg-[#00c3ff] transition-all shadow-xl text-xs md:text-base"
                      >
                        Next Example <GrLinkNext />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSubIndex(0);
                          nextLevel();
                        }}
                        className="w-full py-4 md:py-6 bg-[#00c3ff] text-black font-black rounded-full uppercase tracking-[2px] flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(0,195,255,0.5)] transition-all text-xs md:text-base"
                      >
                        Complete Round <GrLinkNext />
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2 md:gap-5 text-center mt-2 md:mt-4"
                >
                  <p className="text-sm md:text-xl">
                    The spoken word was <span className="text-white font-bold">"{currentWord.name}"</span>
                  </p>

                  {puzzle?.examples?.[subIndex]?.some(item => item.type === 'blank' && !item.isMain) && (
                    <p className="text-xs md:text-base text-[#00c3ff]">
                      Hidden words: {puzzle.examples[subIndex]
                        .filter(item => item.type === 'blank' && !item.isMain)
                        .map((item, idx, arr) => (
                          <React.Fragment key={item.id}>
                            <span className="font-bold text-white">"{item.correct}"</span>
                            {idx < arr.length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                    </p>
                  )}

                  <p className="text-[#a0a0a0] italic text-xs md:text-sm">Meaning: {currentWord.meaning}</p>
                </motion.div>
              )}

              <div className="mt-4 md:mt-8 flex items-center justify-center gap-2 md:gap-4 w-full">
                <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest">Progress</span>
                <div className="flex gap-1.5">
                  {shuffledWords.map((_, i) => (
                    <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i < index ? 'bg-[#00c3ff]' : i === index ? 'bg-white scale-y-150' : 'bg-[#a0a0a0]/10'}`} />
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