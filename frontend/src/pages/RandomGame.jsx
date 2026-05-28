import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRandomGame } from '../hooks/useRandomGame';
import { GrPrevious } from 'react-icons/gr';
import { MdNotStarted } from 'react-icons/md';
import { FaGrinSquint, FaLaugh, FaMeh, FaDizzy, FaVolumeUp, FaUndo } from 'react-icons/fa';
import { MdOutlineFlipCameraAndroid } from 'react-icons/md';

export default function RandomGame() {
  const navigate = useNavigate();
  const {
    lists, loading, showGame, shuffledWords, index, face, setFace,
    lap, showElement, difficulty, selectedListId, setSelectedListId,
    loadLists, startGame, next, quitGame, playSound
  } = useRandomGame();

  useEffect(() => { loadLists(); }, [loadLists]);

  const word = shuffledWords[index];

  const diffLabels = [
    { key: 'easy',      icon: <FaGrinSquint />, color: 'bg-yellow-400 text-black',  label: 'Easy' },
    { key: 'normal',    icon: <FaLaugh />,      color: 'bg-orange-400 text-black',  label: 'Normal' },
    { key: 'hard',      icon: <FaMeh />,        color: 'bg-red-500 text-white',     label: 'Hard' },
    { key: 'ultrahard', icon: <FaDizzy />,      color: 'bg-red-900 text-white',     label: 'Ultra' },
  ];

  const totalByDiff = (key) => difficulty[key]?.length || 0;

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans relative overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 pt-8 pb-4 border-b border-[#00c3ff]/20">
        <button
          onClick={() => { quitGame(); navigate('/dashboard'); }}
          className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors duration-300 font-bold uppercase tracking-widest text-xs"
        >
          <GrPrevious className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
          Random <span className="text-[#00c3ff]">Repetition</span>
        </h1>
        {showGame && (
          <span className="text-xs text-[#a0a0a0] uppercase tracking-widest font-bold">
            Lap <span className="text-[#00c3ff]">{lap}</span>/5 · Card <span className="text-[#00c3ff]">{index + 1}</span>/{shuffledWords.length}
          </span>
        )}
        {!showGame && <div className="w-28" />}
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">

        {/* --- LIST SELECTION MENU --- */}
        {!showGame && (
          <div className="flex flex-col items-center justify-center gap-6 mt-12">
            <div className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] p-8 w-full max-w-md shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold mb-6 text-center">Select a List to Practice</h2>

              {lists.length === 0 ? (
                <p className="text-[#a0a0a0] text-center italic">You don't have any lists yet.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 mb-6 justify-center">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`px-4 py-2 rounded-[10px] text-sm font-bold tracking-wide transition-all border ${
                          selectedListId === list.id
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
                      <><MdNotStarted size={22} /> Start Session</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- GAME AREA --- */}
        {showGame && word && showElement && (
          <div className="flex flex-col items-center gap-6 mt-4">

            {/* Flip Card */}
            <div className="relative w-full max-w-lg h-[420px]" style={{ perspective: '1200px' }}>
              <div
                className="w-full h-full relative transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: face === 2 ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* FRONT */}
                <div
                  className="absolute inset-0 bg-[#0e0c1d]/80 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] p-8 flex flex-col items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-y-auto"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {word.word_types?.map((t, i) => (
                      <span key={i} className="text-[9px] uppercase font-bold px-2 py-1 bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/30 rounded-md">{t}</span>
                    ))}
                  </div>
                  <h2 className="text-5xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(0,195,255,0.4)] mb-4 text-center">{word.name}</h2>
                  {word.past && <p className="text-sm text-[#a0a0a0] italic mb-1"><span className="text-[#00c3ff] font-bold">Past:</span> {word.past}</p>}
                  {word.examples?.length > 0 && (
                    <ul className="mt-4 text-[#a0a0a0] text-sm italic text-left w-full space-y-1">
                      {word.examples.slice(0, 3).map((ex, i) => <li key={i} className="before:content-['•'] before:mr-2 before:text-[#00c3ff]">{ex}</li>)}
                    </ul>
                  )}
                  <button
                    onClick={() => playSound(word.name)}
                    className="mt-4 text-[#a0a0a0] hover:text-[#00c3ff] transition-colors"
                    title="Listen"
                  >
                    <FaVolumeUp size={22} />
                  </button>
                  <button
                    onClick={() => setFace(2)}
                    className="mt-auto flex items-center gap-2 text-sm text-[#00c3ff]/70 hover:text-[#00c3ff] transition-colors font-bold uppercase tracking-widest"
                  >
                    <MdOutlineFlipCameraAndroid size={20} /> Reveal Meaning
                  </button>
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0 bg-[#0e0c1d]/90 backdrop-blur-[10px] border border-[#00c3ff]/40 rounded-[20px] p-8 flex flex-col items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-y-auto"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <h2 className="text-3xl font-extrabold text-[#00c3ff] mb-3 text-center">{word.name}</h2>
                  <p className="text-[#a0a0a0] text-center leading-relaxed mb-4">{word.meaning}</p>
                  {word.synonyms && <p className="text-sm text-[#a0a0a0] mb-1"><span className="text-[#00c3ff] font-bold">Syn:</span> {word.synonyms}</p>}
                  {word.antonyms && <p className="text-sm text-[#a0a0a0] mb-4"><span className="text-[#00c3ff] font-bold">Ant:</span> {word.antonyms}</p>}

                  {/* Difficulty Buttons */}
                  <div className="mt-auto grid grid-cols-4 gap-2 w-full">
                    {diffLabels.map(({ key, icon, color, label }) => (
                      <button
                        key={key}
                        onClick={() => next(key, word, index, lap)}
                        className={`${color} flex flex-col items-center py-2 px-1 rounded-xl font-bold text-xs transition-all hover:scale-105 shadow-lg`}
                      >
                        <span className="text-xl mb-1">{icon}</span>
                        <span>{label}</span>
                        <span className="text-[9px] opacity-70 mt-0.5">({totalByDiff(key)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-sm">
              {shuffledWords.map((_, i) => (
                <div key={i} className={`h-1.5 w-4 rounded-full transition-colors ${i < index ? 'bg-[#00c3ff]' : i === index ? 'bg-white' : 'bg-[#a0a0a0]/30'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Waiting for discriminator (between laps) */}
        {showGame && !showElement && (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00c3ff] border-t-transparent" />
            <p className="text-[#a0a0a0] italic">Preparing next lap...</p>
          </div>
        )}

      </div>
    </div>
  );
}
