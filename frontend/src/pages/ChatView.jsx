import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useChatView } from '../hooks/useChatView';
import {
  FaPaperPlane, FaMicrophone, FaVolumeUp, FaArrowLeft,
  FaBookOpen, FaTimes, FaRobot, FaUserCircle, FaPlus
} from 'react-icons/fa';
import { GiMeltingIceCube } from "react-icons/gi";

export default function ChatView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showParticipants, setShowParticipants] = useState(false);

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
    lists
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
                <h2 className="text-white font-black">{room.name}</h2>
                <button 
                  onClick={() => setShowParticipants(true)}
                  className="text-[#00ff88] text-[10px] font-bold uppercase tracking-widest hover:underline text-left"
                >
                  {room.participants?.length || 0} Participants
                </button>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
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
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${isRecording
                ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-[#0e0c1d] border-white/10 text-[#a0a0a0] hover:border-[#00c3ff]/50 hover:text-[#00c3ff]'
                }`}
            >
              <FaMicrophone />
            </button>
            <button
              onClick={handleIcebreaker}
              disabled={loadingIcebreaker}
              className="bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black font-bold px-4 rounded-xl flex items-center justify-center transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(0,195,255,0.5)] disabled:opacity-50"
            >
              <GiMeltingIceCube size={20} className={loadingIcebreaker ? "animate-spin" : ""} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[#0e0c1d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff]/50 focus:outline-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black font-black hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] transition-all disabled:opacity-50"
            >
              <FaPaperPlane />
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
                            <div key={w.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${used ? 'bg-[#00ff88]/5 border-[#00ff88]/20' : 'bg-white/5 border-transparent'
                              }`}>
                              <div>
                                <p className={`font-bold text-sm ${used ? 'text-[#00ff88] line-through opacity-70' : 'text-white'}`}>
                                  {w.name}
                                </p>
                                <p className="text-[10px] text-[#a0a0a0] truncate max-w-[150px]">{w.meaning}</p>
                              </div>
                              {used && (
                                <div className="text-[10px] font-bold text-black bg-[#00ff88] px-2 py-0.5 rounded-full">
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
                      {p.avatar_display ? <img src={p.avatar_display} className="w-full h-full rounded-full object-cover" /> : (p.is_ai ? <FaRobot size={24} /> : <FaUserCircle size={24} />)}
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

    </div >
  );
}
