import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg } from 'react-icons/bs';
import { CiPlay1 } from 'react-icons/ci';
import { MdOutlineModeEdit } from 'react-icons/md';

export default function WordDetailModal({ word, onClose, onPlay, onEdit }) {
  if (!word) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#071320]/90 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-[#0e0c1d]/90 backdrop-blur-[20px] rounded-[30px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#00c3ff]/30 flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-[#071320]/50 text-[#a0a0a0] hover:text-white hover:bg-[#00c3ff]/20 transition-all"
        >
          <BsXLg size={20} />
        </button>

        {/* Left Side: Image & Title */}
        <div className="w-full md:w-[40%] bg-[#071320]/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#00c3ff]/10">
          <div className="w-full aspect-square mb-6 rounded-2xl overflow-hidden border border-[#00c3ff]/20 shadow-2xl">
            {word.image ? (
              <img src={word.image} alt={word.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0e0c1d] flex items-center justify-center text-[#a0a0a0]/20 italic text-sm">
                No Image Available
              </div>
            )}
          </div>
          
          <h2 className="text-4xl font-black text-white text-center mb-2 drop-shadow-[0_0_15px_rgba(0,195,255,0.3)]">
            {word.name}
          </h2>
          
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {word.word_types?.map((type, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/30 rounded-lg text-xs font-bold uppercase tracking-widest">
                {type}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => onPlay(word.name)}
              className="flex items-center gap-2 px-6 py-3 bg-[#00c3ff] text-black rounded-full font-bold hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] transition-all active:scale-95"
            >
              <CiPlay1 size={20} /> Listen
            </button>
            <button 
              onClick={() => onEdit(word.id)}
              className="p-3 bg-[#0e0c1d] border border-[#00c3ff]/30 text-[#00c3ff] rounded-full hover:bg-[#00c3ff]/10 transition-all"
            >
              <MdOutlineModeEdit size={24} />
            </button>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-[60%] p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Meaning Section */}
          <section>
            <h4 className="text-[#00c3ff] text-xs font-black uppercase tracking-[3px] mb-3">Meaning</h4>
            <p className="text-lg text-white/90 leading-relaxed bg-[#ffffff05] p-5 rounded-2xl border border-[#ffffff05]">
              {word.meaning || "No meaning provided."}
            </p>
          </section>

          {/* Examples Section */}
          <section>
            <h4 className="text-[#00c3ff] text-xs font-black uppercase tracking-[3px] mb-4">Example Sentences</h4>
            <div className="space-y-4">
              {word.examples && word.examples.length > 0 ? (
                word.examples.map((ex, i) => (
                  <div key={i} className="relative bg-gradient-to-br from-[#0e0c1d] to-[#071320] p-6 rounded-2xl border border-[#00c3ff]/10 shadow-lg group hover:border-[#00c3ff]/30 transition-all">
                    <div className="absolute top-[-10px] left-4 bg-[#071320] px-2 text-[#00c3ff]/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 3C15.1216 3 16.017 3.89543 16.017 5V5.5C16.017 6.05228 16.4647 6.5 17.017 6.5H20.017C21.1216 6.5 22.017 7.39543 22.017 8.5V15.5C22.017 16.6046 21.1216 17.5 20.017 17.5H17.017C16.4647 17.5 16.017 17.9477 16.017 18.5V21H14.017ZM2.0166 21L2.0166 18C2.0166 16.8954 2.91203 16 4.0166 16H7.0166C7.56889 16 8.0166 15.5523 8.0166 15V9C8.0166 8.44772 7.56889 8 7.0166 8H4.0166C2.91203 8 2.0166 7.10457 2.0166 6V3L2.0166 3C3.12117 3 4.0166 3.89543 4.0166 5V5.5C4.0166 6.05228 4.46432 6.5 5.0166 6.5H8.0166C9.12117 6.5 10.0166 7.39543 10.0166 8.5V15.5C10.0166 16.6046 9.12117 17.5 8.0166 17.5H5.0166C4.46432 17.5 4.0166 17.9477 4.0166 18.5V21H2.0166Z"/></svg>
                    </div>
                    <p className="text-[#e0e0e0] italic leading-relaxed group-hover:text-white transition-colors">
                      {ex}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-[#0e0c1d] p-6 rounded-2xl border border-[#ffffff05] text-[#a0a0a0] italic text-sm text-center">
                  No examples provided yet.
                </div>
              )}
            </div>
          </section>

          {/* Conjugations / Forms */}
          {(word.past || word.gerund || word.participle) && (
            <section>
              <h4 className="text-[#00c3ff] text-xs font-black uppercase tracking-[3px] mb-4">Word Forms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {word.past && (
                  <div className="bg-[#071320] p-4 rounded-xl border border-[#ffffff05]">
                    <span className="text-[10px] text-[#a0a0a0] uppercase block mb-1">Past</span>
                    <span className="text-white font-bold">{word.past}</span>
                  </div>
                )}
                {word.gerund && (
                  <div className="bg-[#071320] p-4 rounded-xl border border-[#ffffff05]">
                    <span className="text-[10px] text-[#a0a0a0] uppercase block mb-1">Gerund</span>
                    <span className="text-white font-bold">{word.gerund}</span>
                  </div>
                )}
                {word.participle && (
                  <div className="bg-[#071320] p-4 rounded-xl border border-[#ffffff05]">
                    <span className="text-[10px] text-[#a0a0a0] uppercase block mb-1">Participle</span>
                    <span className="text-white font-bold">{word.participle}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <section>
              <h4 className="text-[#00ff88] text-xs font-black uppercase tracking-[3px] mb-3">Synonyms</h4>
              <div className="text-sm text-[#a0a0a0] bg-[#00ff88]/5 p-4 rounded-xl border border-[#00ff88]/10 min-h-[60px]">
                {word.synonyms || "None"}
              </div>
            </section>
            <section>
              <h4 className="text-[#ff4d4d] text-xs font-black uppercase tracking-[3px] mb-3">Antonyms</h4>
              <div className="text-sm text-[#a0a0a0] bg-[#ff4d4d]/5 p-4 rounded-xl border border-[#ff4d4d]/10 min-h-[60px]">
                {word.antonyms || "None"}
              </div>
            </section>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
