import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useChatView } from '../hooks/useChatView';
import {
  FaPaperPlane, FaMicrophone, FaVolumeUp, FaArrowLeft,
  FaBookOpen, FaTimes, FaUserCircle, FaPlus,
  FaEdit, FaSave, FaGlobe, FaComments, FaSpellCheck, FaSignOutAlt
} from 'react-icons/fa';
import { RiRobot3Fill } from 'react-icons/ri';
import { GiMeltingIceCube } from "react-icons/gi";

export default function ChatView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    room,
    messages,
    vocabData,
    input,
    setInput,
    loading,
    sending,
    isRecording,
    loadingIcebreaker,
    showVocabPanel,
    setShowVocabPanel,
    showListSelector,
    setShowListSelector,
    messagesEndRef,
    handleSend,
    toggleRecording,
    speak,
    handleLinkList,
    handleIcebreaker,
    handleUpdateRoomInfo,
    handleLeaveRoom,
    handleGrammarCheck,
    checkingGrammar,
    grammarResult,
    setGrammarResult,
    lists,
    interimResult,
    speechStatus,
    showParticipants,
    setShowParticipants,
    showRoomInfo,
    setShowRoomInfo,
    isEditingInfo,
    setIsEditingInfo,
    editData,
    setEditData,
    inputRef,
    scrollContainerRef,
    startEditing,
    saveEditing,
    handleInputChange,
    handleMentionSelect,
    mentionSuggestions
  } = useChatView(roomId, user);

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#00c3ff]/20 border-t-[#00c3ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 pt-4 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">

      {/* --- CHAT AREA --- */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className={`flex-1 flex flex-col bg-[#0e0c1d] border border-white/5 rounded-3xl overflow-hidden ${showVocabPanel ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chat')} className="text-[#a0a0a0] hover:text-white transition-colors">
              <FaArrowLeft />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c3ff]/20 to-[#0080ff]/20 border border-[#00c3ff]/30 flex items-center justify-center overflow-hidden">
                <FaUserCircle size={20} className="text-[#00c3ff]/50" />
              </div>
              <div>
                <button
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  className="text-white font-black hover:underline text-left"
                >
                  {room.name}
                </button>
                <div
                  className="text-[#00c3ff] text-[10px] font-bold uppercase tracking-widest text-left"
                >
                  {room.participants?.length || 0} Participants
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowVocabPanel(!showVocabPanel)}
            className={`p-2.5 rounded-xl transition-all ${showVocabPanel ? 'bg-[#00c3ff] text-black' : 'bg-white/5 text-[#a0a0a0] hover:bg-white/10 hover:text-white'}`}
          >
            <FaBookOpen />
          </button>
        </div>

        {/* Messages or Room Info */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {showRoomInfo ? (
            <div className="h-full flex flex-col p-4 animate-fadeIn max-w-3xl mx-auto w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-white tracking-wide">Room Details</h3>
                <div className="flex gap-2">
                  {isEditingInfo ? (
                    <button onClick={saveEditing} className="bg-[#00c3ff] text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"><FaSave /> Save</button>
                  ) : (
                    <button onClick={startEditing} className="bg-white/10 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"><FaEdit /> Edit</button>
                  )}
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to leave this room?")) {
                        const success = await handleLeaveRoom();
                        if (success) navigate('/chat');
                      }
                    }}
                    className="bg-white/5 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <FaSignOutAlt /> Leave
                  </button>
                  <button onClick={() => { setShowRoomInfo(false); setIsEditingInfo(false); }} className="bg-white/5 text-[#a0a0a0] px-4 py-2 rounded-full font-bold hover:bg-white/10 hover:text-white transition-colors">Close</button>
                </div>
              </div>

              {isEditingInfo ? (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs text-[#00c3ff] font-bold uppercase tracking-widest ml-2">Room Name</label>
                    <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-[#00c3ff]/50 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[#00c3ff] font-bold uppercase tracking-widest ml-2">Description</label>
                    <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-[#00c3ff]/50 outline-none h-24 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[#00c3ff] font-bold uppercase tracking-widest ml-2">Context Setting</label>
                    <input type="text" value={editData.context} onChange={e => setEditData({ ...editData, context: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-[#00c3ff]/50 outline-none" />
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[#00c3ff] mb-4">{room.name}</h2>
                  <p className="text-[#a0a0a0] text-lg leading-relaxed">{room.description || "No description provided."}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#00c3ff]/10 to-transparent border border-[#00c3ff]/20 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><FaComments size={80} /></div>
                  <h4 className="text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2 relative z-10">Current Context</h4>
                  <p className="text-white font-medium text-lg relative z-10">{room.context || "General conversation"}</p>
                </div>
                <div className="bg-gradient-to-br from-[#00c3ff]/10 to-transparent border border-[#00c3ff]/20 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00c3ff]/5 rounded-full blur-[30px] group-hover:bg-[#00c3ff]/10 transition-colors duration-500"></div>
                  <h4 className="text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2 relative z-10">Target Language</h4>
                  <p className="text-white font-medium text-lg capitalize relative z-10">{room.language || "English"}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-white mb-4">Cast & Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.participants?.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00c3ff]/20 to-[#0080ff]/20 border border-[#00c3ff]/30 text-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.1)]">
                      {p.avatar_display ? <img src={p.avatar_display} className="w-full h-full rounded-full object-cover" /> : (p.is_ai ? <RiRobot3Fill size={24} /> : <FaUserCircle size={24} />)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-lg">{p.name_display}</p>
                        {p.user_id === user.id && <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-bold">YOU</span>}
                        {p.is_ai && <span className="text-[10px] bg-[#00c3ff]/20 text-[#00c3ff] border border-[#00c3ff]/30 px-2 py-0.5 rounded-full font-bold uppercase">AI</span>}
                      </div>
                      <p className="text-[#a0a0a0] text-xs uppercase font-bold tracking-widest mt-1">Role: <span className="text-white">{p.role || 'Participant'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#00c3ff]/10 flex items-center justify-center mb-4">
                <FaPaperPlane className="text-[#00c3ff] text-2xl ml-1" />
              </div>
              <p className="text-white font-bold text-lg mb-1">Start the conversation</p>
              <p className="text-[#a0a0a0] text-sm max-w-xs">Link a vocabulary list to practice specific words while chatting.</p>
              {loadingIcebreaker && (
                <div className="text-[#00c3ff] italic text-center animate-pulse mt-10">
                  La IA está pensando en cómo iniciar la conversación...
                </div>
              )}
            </div>

          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.participant && msg.participant.user_id === user.id;
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${isMine
                    ? 'bg-gradient-to-br from-[#00c3ff] to-[#0080ff] text-black rounded-tr-sm shadow-[0_5px_15px_rgba(0,195,255,0.2)]'
                    : 'bg-[#1a182c] border border-white/5 text-white rounded-tl-sm'
                    }`}>
                    {!isMine && (
                      <div className="text-[10px] text-[#00c3ff] font-bold mb-1">
                        {msg.participant?.name_display} {msg.participant?.role && `(${msg.participant.role})`}
                      </div>
                    )}
                    <p className={`text-sm ${isMine ? 'font-medium' : ''}`}>{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-bold uppercase ${isMine ? 'text-black/50' : 'text-[#a0a0a0]'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isMine && msg.participant?.is_ai && (
                        <button onClick={() => speak(msg.content)} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors">
                          <FaVolumeUp size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {sending && (
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-[#00c3ff]/50 to-[#0080ff]/50 text-black rounded-2xl p-4 rounded-tr-sm opacity-50">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent border-t border-white/5 relative">
          <AnimatePresence>
            {mentionSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-4 left-4 bg-[#1a182c] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-2 z-10 min-w-[200px]"
              >
                <div className="text-[10px] uppercase tracking-widest text-[#a0a0a0] font-bold mb-2 px-2">Mention:</div>
                {mentionSuggestions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleMentionSelect(p.ai_name)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00c3ff]/20 text-[#00c3ff] flex items-center justify-center">
                      {p.avatar_display ? <img src={p.avatar_display} className="w-full h-full rounded-full object-cover" /> : <RiRobot3Fill size={12} />}
                    </div>
                    <span className="text-white font-bold text-sm">{p.ai_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-full px-4"
              >
                {interimResult && (
                  <div className="bg-black/60 backdrop-blur-md border border-[#00c3ff]/30 px-4 py-2 rounded-2xl max-w-full truncate shadow-lg">
                    <p className="text-sm text-[#00c3ff] italic animate-pulse text-center">
                      {interimResult}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#1a182c] border border-white/30 px-4 py-1.5 rounded-full shadow-lg">
                  <div className={`w-2 h-2 rounded-full bg-white ${speechStatus === 'speaking' || speechStatus === 'detecting_sound' ? 'animate-ping' : ''}`}></div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {speechStatus === 'listening' ? 'Escuchando ambiente...' :
                      speechStatus === 'detecting_sound' ? 'Detectando sonido...' :
                        speechStatus === 'speaking' ? 'Capturando voz...' :
                          speechStatus === 'processing' ? 'Procesando frase...' :
                            speechStatus === 'no_match' ? 'No se entendió, repite' : 'Iniciando micro...'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile auxiliary buttons */}
          <div className="flex md:hidden items-center gap-2 mb-2 px-1">
            <button
              onClick={toggleRecording}
              className={`w-10 h-10 rounded-full flex-none flex items-center justify-center transition-all ${isRecording
                ? 'bg-white/20 text-white animate-pulse'
                : 'bg-white/5 text-[#a0a0a0] hover:bg-[#00c3ff]/10 hover:text-[#00c3ff]'
                }`}
            >
              <FaMicrophone size={14} />
            </button>
            <button
              onClick={handleIcebreaker}
              disabled={loadingIcebreaker}
              className="w-10 h-10 rounded-full flex-none bg-white/5 text-[#00c3ff] flex items-center justify-center transition-all hover:bg-[#00c3ff]/10 hover:scale-105 disabled:opacity-50"
            >
              <GiMeltingIceCube size={16} className={loadingIcebreaker ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleGrammarCheck}
              disabled={checkingGrammar || !input.trim()}
              className="w-10 h-10 rounded-full flex-none bg-white/5 text-[#00c3ff] flex items-center justify-center transition-all hover:bg-[#00c3ff]/10 hover:scale-105 disabled:opacity-50"
              title="Autocorregir texto actual antes de enviar"
            >
              <FaSpellCheck size={14} className={checkingGrammar ? "animate-pulse" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#1a182c] p-1.5 rounded-full border border-white/10 shadow-2xl relative z-20">
            {/* Desktop auxiliary buttons */}
            <button
              onClick={toggleRecording}
              className={`hidden md:flex w-11 h-11 rounded-full flex-none items-center justify-center transition-all ${isRecording
                ? 'bg-white/20 text-white animate-pulse'
                : 'bg-white/5 text-[#a0a0a0] hover:bg-[#00c3ff]/10 hover:text-[#00c3ff]'
                }`}
            >
              <FaMicrophone size={16} />
            </button>
            <button
              onClick={handleIcebreaker}
              disabled={loadingIcebreaker}
              className="hidden md:flex w-11 h-11 rounded-full flex-none bg-white/5 text-[#00c3ff] items-center justify-center transition-all hover:bg-[#00c3ff]/10 hover:scale-105 disabled:opacity-50"
            >
              <GiMeltingIceCube size={18} className={loadingIcebreaker ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleGrammarCheck}
              disabled={checkingGrammar || !input.trim()}
              className="hidden md:flex w-11 h-11 rounded-full flex-none bg-white/5 text-[#00c3ff] items-center justify-center transition-all hover:bg-[#00c3ff]/10 hover:scale-105 disabled:opacity-50"
              title="Autocorregir texto actual antes de enviar"
            >
              <FaSpellCheck size={16} className={checkingGrammar ? "animate-pulse" : ""} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (mentionSuggestions.length > 0) {
                    e.preventDefault();
                    handleMentionSelect(mentionSuggestions[0].ai_name);
                  } else {
                    handleSend();
                  }
                }
              }}
              placeholder="Type a message... Use @ to mention"
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none placeholder-[#a0a0a0]/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-full flex-none bg-gradient-to-tr from-[#00c3ff] to-[#0080ff] text-black flex items-center justify-center transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] disabled:opacity-50"
            >
              <FaPaperPlane size={14} className="ml-0.5" />
            </button>
          </div>
        </div>
      </motion.div >

      {/* --- VOCABULARY PANEL --- */}
      < AnimatePresence >
        {showVocabPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: '320px' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className={`flex-none bg-[#0e0c1d] border border-white/5 rounded-3xl overflow-hidden flex flex-col ${!showVocabPanel ? 'hidden' : 'flex md:flex'}`}
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="font-black text-white flex items-center gap-2">
                <FaBookOpen className="text-[#00c3ff]" /> Word Target
              </h3>
              <button onClick={() => setShowVocabPanel(false)} className="md:hidden text-[#a0a0a0] hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {vocabData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#a0a0a0] text-sm mb-4">No vocabulary lists linked to this chat.</p>
                  <button
                    onClick={() => setShowListSelector(true)}
                    className="px-4 py-2 w-full rounded-xl bg-[#00c3ff]/10 border border-[#00c3ff]/20 text-[#00c3ff] font-bold text-sm hover:bg-[#00c3ff]/20 transition-all"
                  >
                    Link a List
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowListSelector(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-white/20 text-[#a0a0a0] hover:border-[#00c3ff]/50 hover:text-[#00c3ff] transition-all text-sm font-bold"
                  >
                    <FaPlus size={10} /> Add Another List
                  </button>

                  {vocabData.map(list => (
                    <div key={list.list_id}>
                      <h4 className="text-[10px] font-bold text-[#00c3ff] uppercase tracking-widest mb-3 border-b border-white/5 pb-1">
                        {list.list_name}
                      </h4>
                      <div className="space-y-2">
                        {list.words.map(w => {
                          const used = w.usage_count > 0;
                          return (
                            <div key={w.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${used ? 'bg-[#00c3ff]/5 border-[#00c3ff]/20' : 'bg-white/5 border-transparent'} hover:border-[#00c3ff]/30`}>
                              <div>
                                <p className={`font-bold text-sm ${used ? 'text-[#00c3ff] line-through opacity-70' : 'text-white'}`}>
                                  {w.name}
                                </p>
                                <p className="text-[10px] text-[#a0a0a0] truncate max-w-[150px]">{w.meaning}</p>
                              </div>
                              {used && (
                                <div className="text-[10px] font-bold text-black bg-[#00c3ff] px-2 py-0.5 rounded-full">
                                  {w.usage_count}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )
        }
      </AnimatePresence >

      {/* --- LIST SELECTOR MODAL --- */}
      {
        showListSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0e0c1d] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white">Select a List to Practice</h2>
                <button onClick={() => setShowListSelector(false)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {lists.map(list => {
                  const isLinked = vocabData.some(v => v.list_id === list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => !isLinked && handleLinkList(list.id)}
                      disabled={isLinked}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${isLinked
                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 border-transparent hover:bg-[#00c3ff]/10 hover:border-[#00c3ff]/30 hover:shadow-[0_0_15px_rgba(0,195,255,0.1)]'
                        }`}
                    >
                      <h3 className="font-bold text-white mb-1">{list.name}</h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#a0a0a0]">{list.description}</span>
                        {isLinked && <span className="text-[#00c3ff] font-bold text-[10px] uppercase">Linked</span>}
                      </div>
                    </button>
                  )
                })}
                {lists.length === 0 && (
                  <p className="text-center text-[#a0a0a0] py-4">You don't have any vocabulary lists yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )
      }

      {/* --- PARTICIPANTS MODAL --- */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0c1d] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Cast & Characters</h2>
              <button onClick={() => setShowParticipants(false)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {room.participants?.map(p => {
                const isMe = p.user_id === user.id;
                return (
                  <div key={p.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#00c3ff]/10 text-[#00c3ff]">
                      {p.avatar_display ? <img src={p.avatar_display} className="w-full h-full rounded-full object-cover" /> : (p.is_ai ? <RiRobot3Fill size={24} /> : <FaUserCircle size={24} />)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm">
                          {p.name_display}
                        </p>
                        {isMe && <span className="text-[9px] bg-white/10 text-[#a0a0a0] px-1.5 py-0.5 rounded font-bold">YOU</span>}
                        {p.is_ai && <span className="text-[9px] bg-[#00c3ff]/20 text-[#00c3ff] px-1.5 py-0.5 rounded font-bold uppercase">AI ({p.ai_gender})</span>}
                      </div>
                      <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-widest mt-0.5">Role: {p.role || 'Participant'}</p>
                      {p.is_ai && p.ai_personality && (
                        <p className="text-[#a0a0a0] text-xs mt-1 italic line-clamp-2">"{p.ai_personality}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* --- GRAMMAR RESULT MODAL --- */}
      {grammarResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0e0c1d] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><FaSpellCheck size={80} className="text-[#00c3ff]" /></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FaSpellCheck className="text-[#00c3ff]" /> Corrección Gramatical
              </h2>
              <button onClick={() => setGrammarResult(null)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
            </div>

            <div className="space-y-4 relative z-10">
              {grammarResult.has_errors ? (
                <>
                  <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                    <h3 className="text-[10px] text-white font-bold uppercase tracking-widest mb-1">Se encontraron errores</h3>
                    <p className="text-[#a0a0a0] text-sm italic">Tu texto necesita mejoras.</p>
                  </div>
                  <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
                    <h3 className="text-[10px] text-white font-bold uppercase tracking-widest mb-1">Corrección Sugerida</h3>
                    <p className="text-white font-medium text-lg leading-relaxed">{grammarResult.corrected_text}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <h3 className="text-[10px] text-[#00c3ff] font-bold uppercase tracking-widest mb-2">Explicación</h3>
                    <p className="text-[#a0a0a0] text-sm">{grammarResult.explanation}</p>
                  </div>
                </>
              ) : (
                <div className="bg-[#00c3ff]/10 border border-[#00c3ff]/20 p-6 rounded-2xl text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00c3ff]/20 flex items-center justify-center mx-auto mb-4">
                    <FaSpellCheck size={30} className="text-[#00c3ff]" />
                  </div>
                  <h3 className="text-lg font-black text-[#00c3ff] mb-2">¡Excelente Trabajo!</h3>
                  <p className="text-[#a0a0a0] text-sm">{grammarResult.explanation || "Tu mensaje no tiene errores gramaticales."}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div >
  );
}
