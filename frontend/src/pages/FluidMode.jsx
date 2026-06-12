import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone, FaMicrophoneSlash, FaHandPaper, FaRedo,
  FaTimes, FaCheck, FaUserCircle, FaVolumeUp, FaSpinner, FaQuestionCircle
} from 'react-icons/fa';
import { MdClosedCaption, MdRecordVoiceOver } from 'react-icons/md';
import { RiRobot3Fill } from 'react-icons/ri';
import { chatService } from '../services/chatService';

export default function FluidMode({ room, user, fluidState, onExit }) {
  const {
    isAISpeaking,
    isAIThinking,
    isBlocked,
    currentSpeaker,
    handQueue,
    selectedAIs,
    subtitlesEnabled,
    currentSubtitle,
    lastAIText,
    lastAISpeakerName,
    isFluidMicActive,
    fluidTranscript,
    fluidInterimResult,
    toggleSubtitles,
    raiseHand,
    lowerHand,
    toggleAISelection,
    replayLastAudio,
    activateMic,
    deactivateMic,
  } = fluidState;

  const aiParticipants = room?.participants?.filter(p => p.is_ai) || [];
  const humanParticipants = room?.participants?.filter(p => !p.is_ai) || [];
  const hasFloor = currentSpeaker === user?.id;
  const isInQueue = handQueue.some(h => h.user_id === user?.id);
  const isMultiAI = aiParticipants.length > 1;

  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [helpInput, setHelpInput] = useState('');
  const [helpStyle, setHelpStyle] = useState('native');
  const [helpResult, setHelpResult] = useState('');
  const [isHelpLoading, setIsHelpLoading] = useState(false);

  const getLangCode = (langName) => {
    const map = {
      'english': 'en-US', 'spanish': 'es-ES', 'french': 'fr-FR',
      'german': 'de-DE', 'italian': 'it-IT', 'portuguese': 'pt-BR',
      'russian': 'ru-RU', 'japanese': 'ja-JP', 'korean': 'ko-KR', 'chinese': 'zh-CN'
    };
    return map[langName?.toLowerCase()] || 'en-US';
  };

  const handleGetHelp = async () => {
    if (!helpInput.trim()) return;
    setIsHelpLoading(true);
    setHelpResult('');
    try {
      const lang = room?.language || 'en';
      const nativeLang = user?.native_language || 'es';
      const res = await chatService.getPronunciationHelp(helpInput, lang, helpStyle, nativeLang);
      if (res.status && res.data) {
        setHelpResult(res.data.pronunciation);
      }
    } catch (e) {
      console.error(e);
      setHelpResult('Error getting pronunciation.');
    } finally {
      setIsHelpLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!helpInput || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(helpInput);
    utterance.lang = getLangCode(room?.language);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveCorrection = () => {
    if (!fluidState.fluidGrammarCorrection) return;
    const existing = JSON.parse(localStorage.getItem('fluid_grammar_saved') || '[]');
    existing.push(fluidState.fluidGrammarCorrection);
    localStorage.setItem('fluid_grammar_saved', JSON.stringify(existing));
    fluidState.setFluidGrammarCorrection(null);
  };

  const handleDismissCorrection = () => {
    fluidState.setFluidGrammarCorrection(null);
  };

  const handleGetSummary = async () => {
    const existing = JSON.parse(localStorage.getItem('fluid_grammar_saved') || '[]');
    if (existing.length === 0) {
      alert("No hay correcciones guardadas para resumir.");
      return;
    }
    fluidState.setShowGrammarSummary(true);
    fluidState.setGrammarSummaryData(null);
    try {
      const lang = room?.language || 'en';
      const aiLang = localStorage.getItem('ai_language') || 'es';
      const res = await chatService.getGrammarSummary(existing, lang, aiLang);
      if (res.status && res.summary) {
        fluidState.setGrammarSummaryData(res.summary);
        localStorage.setItem('fluid_grammar_summary_last', res.summary);
        localStorage.removeItem('fluid_grammar_saved'); // Optional: clear after summary
      } else {
        fluidState.setGrammarSummaryData("Error al generar el resumen.");
      }
    } catch (e) {
      console.error(e);
      fluidState.setGrammarSummaryData("Error al generar el resumen.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0a0820 0%, #04030e 70%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,195,255,0.06) 0%, transparent 70%)' }}
          animate={isAISpeaking ? { opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: isAISpeaking ? '#00c3ff' : isAIThinking ? '#f97316' : '#4ade80',
            }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: isAISpeaking ? '0 0 8px #00c3ff' : isAIThinking ? '0 0 8px #f97316' : '0 0 8px #4ade80' }}
          />
          <span className="text-white font-black text-sm truncate max-w-[160px]">{room?.name}</span>
          <span className="text-[9px] text-[#00c3ff] uppercase tracking-widest font-black bg-[#00c3ff]/10 border border-[#00c3ff]/20 px-2 py-0.5 rounded-full flex-shrink-0">
            FLUID MODE
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleGetSummary}
            title="Grammar Summary"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all bg-white/5 text-[#a0a0a0] border-white/10 hover:border-[#00c3ff]/40 hover:text-[#00c3ff]"
          >
            <FaCheck size={14} /> Summary
          </button>
          <button
            onClick={() => setShowHelpPanel(true)}
            title="Pronunciation Help"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all bg-white/5 text-[#a0a0a0] border-white/10 hover:border-white/20 hover:text-[#00c3ff]"
          >
            <FaQuestionCircle size={14} /> Help
          </button>
          <button
            onClick={fluidState.toggleDirectAudio}
            title={fluidState.isDirectAudioEnabled ? "Direct Audio: ON (Gemini 2.0)" : "Direct Audio: OFF (Local TTS)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              fluidState.isDirectAudioEnabled
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-white/5 text-[#a0a0a0] border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <RiRobot3Fill size={14} /> AI Voice
          </button>
          <button
            onClick={toggleSubtitles}
            title="Toggle subtitles"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              subtitlesEnabled
                ? 'bg-[#00c3ff]/20 text-[#00c3ff] border-[#00c3ff]/40 shadow-[0_0_10px_rgba(0,195,255,0.2)]'
                : 'bg-white/5 text-[#a0a0a0] border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <MdClosedCaption size={14} /> CC
          </button>
          <button
            onClick={onExit}
            className="w-8 h-8 rounded-full bg-white/5 text-[#a0a0a0] flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/5"
          >
            <FaTimes size={11} />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-4 relative z-10 overflow-hidden">

        {/* Status banner */}
        <AnimatePresence>
          {isAIThinking && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="flex items-center gap-2 bg-black/40 border border-orange-400/20 px-5 py-2 rounded-full backdrop-blur-sm"
            >
              <FaSpinner size={10} className="text-orange-400 animate-spin" />
              <span className="text-xs text-orange-300 font-bold tracking-widest uppercase">Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint to select AI when multiple exist and nothing selected */}
        <AnimatePresence>
          {isMultiAI && selectedAIs.length === 0 && !isAISpeaking && !isAIThinking && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] text-[#a0a0a0] uppercase tracking-widest font-bold"
            >
              Tap an AI to select who responds
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── AI AVATARS ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-10">
          {aiParticipants.map(ai => {
            const isSpeakingNow = isAISpeaking && lastAISpeakerName === ai.name_display;
            const isSelected = selectedAIs.includes(ai.id);
            // If only one AI exists, treat it as always selected
            const showAsSelected = isSelected || !isMultiAI;

            return (
              <motion.div
                key={ai.id}
                className={`flex flex-col items-center gap-3 ${isMultiAI ? 'cursor-pointer' : ''}`}
                onClick={() => isMultiAI && !isBlocked && !showHelpPanel && toggleAISelection(ai.id)}
                whileHover={isMultiAI && !isBlocked && !showHelpPanel ? { scale: 1.05 } : {}}
                whileTap={isMultiAI && !isBlocked && !showHelpPanel ? { scale: 0.97 } : {}}
              >
                <div className="relative">
                  {/* Speaking pulse rings */}
                  {isSpeakingNow && (
                    <>
                      {[8, 16, 24].map((offset, i) => (
                        <motion.div
                          key={offset}
                          className="absolute rounded-full border border-[#00c3ff]"
                          style={{ inset: -offset, opacity: 0.5 - i * 0.15 }}
                          animate={{ scale: [1, 1.3 + i * 0.1, 1], opacity: [0.5 - i * 0.15, 0, 0.5 - i * 0.15] }}
                          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                        />
                      ))}
                    </>
                  )}

                  {/* Avatar */}
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all duration-500 ${
                    isSpeakingNow
                      ? 'border-[#00c3ff] shadow-[0_0_50px_rgba(0,195,255,0.5)] bg-[#00c3ff]/10'
                      : showAsSelected
                      ? 'border-[#00c3ff]/50 shadow-[0_0_20px_rgba(0,195,255,0.15)] bg-[#00c3ff]/5'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}>
                    {ai.avatar_display
                      ? <img src={ai.avatar_display} className="w-full h-full object-cover" alt={ai.name_display} />
                      : <RiRobot3Fill size={50} className={
                          isSpeakingNow ? 'text-[#00c3ff]'
                            : showAsSelected ? 'text-[#00c3ff]/60'
                            : 'text-[#2a2840]'
                        } />
                    }
                  </div>

                  {/* Selected badge */}
                  {showAsSelected && !isSpeakingNow && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-[#00c3ff] rounded-full flex items-center justify-center shadow-lg shadow-[#00c3ff]/40"
                    >
                      <FaCheck size={10} className="text-black" />
                    </motion.div>
                  )}

                  {/* Speaking badge */}
                  {isSpeakingNow && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00c3ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,195,255,0.7)]"
                    >
                      <FaVolumeUp size={11} className="text-black" />
                    </motion.div>
                  )}
                </div>

                <div className="text-center">
                  <p className={`font-black text-sm transition-colors ${isSpeakingNow ? 'text-[#00c3ff]' : 'text-white'}`}>
                    {ai.name_display}
                  </p>
                  <p className="text-[9px] text-[#a0a0a0] uppercase tracking-widest font-bold mt-0.5">
                    {ai.role || 'AI'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── HUMAN PARTICIPANTS ───────────────────────────────────────────────── */}
        {humanParticipants.length > 0 && (
          <div className="flex items-end justify-center gap-6 flex-wrap">
            {humanParticipants.map(human => {
              const isSpeakingHuman = currentSpeaker === human.user_id;
              const queuePos = handQueue.findIndex(h => h.user_id === human.user_id);
              const isMe = human.user_id === user?.id;

              return (
                <div key={human.id} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {isSpeakingHuman && (
                      <motion.div
                        className="absolute inset-[-6px] rounded-full border border-green-400/60"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${
                      isSpeakingHuman
                        ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]'
                        : isMe ? 'border-white/30' : 'border-white/10'
                    }`}>
                      {human.avatar_display
                        ? <img src={human.avatar_display} className="w-full h-full object-cover" />
                        : <FaUserCircle size={28} className={isSpeakingHuman ? 'text-green-400' : 'text-[#3a3850]'} />
                      }
                    </div>
                    {isSpeakingHuman && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <MdRecordVoiceOver size={11} className="text-black" />
                      </div>
                    )}
                    {queuePos >= 0 && !isSpeakingHuman && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-[9px] font-black text-black">
                        {queuePos + 1}
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold tracking-wide ${isMe ? 'text-white' : 'text-[#a0a0a0]'}`}>
                    {isMe ? 'You' : human.name_display}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SUBTITLES ────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {subtitlesEnabled && currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-center shadow-2xl">
                <p className="text-white text-sm md:text-base leading-relaxed font-medium">{currentSubtitle}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── USER TRANSCRIPTION (Real-time Speech-to-Text) ────────────────────── */}
        <AnimatePresence>
          {isFluidMicActive && (fluidTranscript || fluidInterimResult) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-2xl mt-4"
            >
              <div className="bg-black/70 backdrop-blur-md border border-green-400/20 rounded-2xl px-6 py-4 text-center shadow-2xl">
                <p className="text-white text-sm md:text-base leading-relaxed font-medium">
                  {fluidTranscript}
                  <span className="text-gray-400 italic ml-1">{fluidInterimResult}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CONTROLS ─────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-5 border-t border-white/5 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">

          {/* Replay */}
          <button
            onClick={replayLastAudio}
            disabled={!lastAIText || isBlocked || showHelpPanel}
            title="Replay last AI response"
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <FaRedo size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Replay</span>
          </button>

          {/* Main action: Mic (if has floor) OR Raise/Lower Hand */}
          <AnimatePresence mode="wait">
            {hasFloor ? (
              <motion.button
                key="mic"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={isFluidMicActive ? deactivateMic : activateMic}
                disabled={isBlocked || showHelpPanel}
                className={`flex flex-col items-center gap-1.5 px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isFluidMicActive
                    ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-400/50'
                    : 'bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black shadow-[0_0_25px_rgba(0,195,255,0.35)] border border-[#00c3ff]/50 hover:shadow-[0_0_35px_rgba(0,195,255,0.5)]'
                }`}
              >
                {isFluidMicActive
                  ? <><FaMicrophoneSlash size={24} /><span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Send</span></>
                  : <><FaMicrophone size={24} /><span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Speak</span></>
                }
              </motion.button>
            ) : (
              <motion.button
                key="hand"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={isInQueue ? lowerHand : raiseHand}
                disabled={(isBlocked || showHelpPanel) && !isInQueue}
                className={`flex flex-col items-center gap-1.5 px-8 py-4 rounded-2xl font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isInQueue
                    ? 'bg-orange-500/20 border-orange-400/40 text-orange-300 hover:bg-orange-500/30'
                    : 'bg-white/5 border-white/10 text-[#a0a0a0] hover:border-[#00c3ff]/40 hover:text-[#00c3ff] hover:bg-[#00c3ff]/5'
                }`}
              >
                <FaHandPaper size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">
                  {isInQueue ? 'Lower Hand' : 'Raise Hand'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Warning: no AI selected (only when multiple AIs exist) */}
        <AnimatePresence>
          {isMultiAI && selectedAIs.length === 0 && hasFloor && !isBlocked && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-3"
            >
              Select at least one AI avatar above before speaking
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── HELP PANEL OVERLAY ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHelpPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0820] border border-[#00c3ff]/30 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(0,195,255,0.15)] flex flex-col gap-4 relative overflow-hidden"
            >
              <button
                onClick={() => setShowHelpPanel(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <FaTimes />
              </button>

              <h2 className="text-[#00c3ff] font-black text-xl mb-1 flex items-center gap-2">
                <FaQuestionCircle /> Pronunciation Help
              </h2>
              <p className="text-sm text-[#a0a0a0] font-medium leading-relaxed">
                Struggling to pronounce something? Type it below and we'll show you how it sounds.
              </p>

              <textarea
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                placeholder="What do you want to say?"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#00c3ff]/50 min-h-[100px] resize-none mt-2"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <select
                  value={helpStyle}
                  onChange={(e) => setHelpStyle(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00c3ff]/50 font-medium cursor-pointer"
                >
                  <option value="native">Native Phonetics</option>
                  <option value="ipa">Universal (IPA)</option>
                </select>

                <button
                  onClick={handleGetHelp}
                  disabled={isHelpLoading || !helpInput.trim()}
                  className="bg-[#00c3ff] hover:bg-[#00c3ff]/80 text-black font-bold py-2.5 px-6 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                >
                  {isHelpLoading ? <FaSpinner className="animate-spin" /> : "Get Pronunciation"}
                </button>
              </div>

              <AnimatePresence>
                {helpResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[#00c3ff]/10 border border-[#00c3ff]/20 rounded-xl p-4 mt-2 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-[#00c3ff] font-black uppercase tracking-widest mb-1">Pronunciation</p>
                      <p className="text-white font-medium text-lg truncate" title={helpResult}>{helpResult}</p>
                    </div>
                    <button
                      onClick={handlePlayAudio}
                      className="w-10 h-10 rounded-full bg-[#00c3ff] flex items-center justify-center text-black hover:scale-105 transition-transform flex-shrink-0 shadow-[0_0_15px_rgba(0,195,255,0.4)]"
                    >
                      <FaVolumeUp />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRAMMAR CORRECTION MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {fluidState.fluidGrammarCorrection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0820] border border-orange-400/30 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] flex flex-col gap-4"
            >
              <h2 className="text-orange-400 font-black text-xl mb-1 flex items-center gap-2">
                Grammar Correction
              </h2>
              
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Original</p>
                <p className="text-[#a0a0a0] line-through">{fluidState.fluidGrammarCorrection.original_text}</p>
                <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-1 mt-3">Correction</p>
                <p className="text-white font-medium">{fluidState.fluidGrammarCorrection.corrected_text}</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] text-[#00c3ff] font-black uppercase tracking-widest mb-1">Explanation</p>
                <p className="text-white text-sm">{fluidState.fluidGrammarCorrection.explanation}</p>
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  onClick={handleDismissCorrection}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSaveCorrection}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
                >
                  Save Correction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRAMMAR SUMMARY MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {fluidState.showGrammarSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0820] border border-[#00c3ff]/30 rounded-3xl w-full max-w-2xl p-6 shadow-[0_0_50px_rgba(0,195,255,0.15)] flex flex-col gap-4 max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-[#00c3ff] font-black text-xl flex items-center gap-2">
                  <FaCheck /> Grammar Summary
                </h2>
                <button
                  onClick={() => fluidState.setShowGrammarSummary(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                {!fluidState.grammarSummaryData ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <FaSpinner className="animate-spin text-[#00c3ff]" size={24} />
                    <p className="text-[#a0a0a0] font-medium">Generating your grammar summary...</p>
                  </div>
                ) : (
                  <div 
                    className="text-white text-sm space-y-4 prose prose-invert prose-p:leading-relaxed prose-a:text-[#00c3ff]"
                    dangerouslySetInnerHTML={{ __html: fluidState.grammarSummaryData }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
