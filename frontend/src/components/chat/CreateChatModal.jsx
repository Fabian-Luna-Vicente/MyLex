import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUserCircle, FaPlus, FaCheck, FaGlobe, FaInfoCircle, FaTheaterMasks, FaUsers, FaUserPlus } from 'react-icons/fa';
import { RiRobot3Fill } from 'react-icons/ri';
import { LANGUAGES } from '../../config/constants';
import { useCreateChat } from '../../hooks/useCreateChat';

export default function CreateChatModal({ onClose, onSuccess }) {
  const {
    step,
    setStep,
    loading,
    friends,
    aiPersonas,
    roomName,
    setRoomName,
    description,
    setDescription,
    context,
    setContext,
    language,
    setLanguage,
    participants,
    showAddAI,
    setShowAddAI,
    showAddHuman,
    setShowAddHuman,
    aiName,
    setAiName,
    aiGender,
    setAiGender,
    aiPersonality,
    setAiPersonality,
    aiRole,
    setAiRole,
    handleAddAI,
    handleAddHuman,
    removeParticipant,
    handleCreate
  } = useCreateChat(onSuccess);

  return (
    <div className="fixed inset-0 pt-20 pb-4 px-4 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0e0c1d] border border-white/10 rounded-3xl w-full max-w-3xl h-[85vh] md:h-[700px] max-h-full overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,195,255,0.05)] relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 truncate">
              <FaUsers className="text-[#00c3ff] flex-shrink-0" /> <span className="truncate">Create Group Chat</span>
            </h2>
            <p className="text-[#a0a0a0] text-xs sm:text-sm mt-1 truncate">Design your perfect language practice scenario</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center text-[#a0a0a0] hover:bg-[#00c3ff] hover:text-black transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="flex bg-black/20 border-b border-white/5">
          <button onClick={() => setStep(1)} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${step === 1 ? 'border-[#00c3ff] text-[#00c3ff]' : 'border-transparent text-[#a0a0a0] hover:text-white'}`}>
            1. Scene Details
          </button>
          <button onClick={() => setStep(2)} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${step === 2 ? 'border-[#00c3ff] text-[#00c3ff]' : 'border-transparent text-[#a0a0a0] hover:text-white'}`}>
            2. Cast & Characters
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#00c3ff] mb-2 uppercase tracking-widest"><FaInfoCircle /> Room Name</label>
                  <input type="text" value={roomName} onChange={e => setRoomName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all" placeholder="e.g. Coffee Shop Practice" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#00c3ff] mb-2 uppercase tracking-widest"><FaGlobe /> Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#1a182c] border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-[#00c3ff]/50 outline-none">
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#00c3ff] mb-2 uppercase tracking-widest"><FaInfoCircle /> Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all" placeholder="Short description of the goal" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#00c3ff] mb-2 uppercase tracking-widest"><FaTheaterMasks /> Context / Scenario</label>
                  <textarea value={context} onChange={e => setContext(e.target.value)} rows="3" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all resize-none" placeholder="Describe the situation. e.g. We are in a crowded coffee shop in London. We are trying to order complex drinks." />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="w-full sm:w-auto bg-[#00c3ff] text-black font-black px-8 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,195,255,0.2)] transition-all flex items-center justify-center gap-2">
                    Next Step <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                {/* Current Cast */}
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <h3 className="text-[#a0a0a0] font-bold uppercase tracking-widest text-[10px] mb-4">Current Cast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00c3ff]/10 flex items-center justify-center text-[#00c3ff]"><FaUserCircle size={24} /></div>
                      <div>
                        <p className="text-white font-bold text-sm">You</p>
                        <p className="text-[#a0a0a0] text-[10px] uppercase">Creator</p>
                      </div>
                    </div>
                    {participants.map((p, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#00c3ff]/10 text-[#00c3ff]`}>
                            {p.avatar_display || p.ai_avatar_url ? <img src={p.avatar_display || p.ai_avatar_url} className="w-full h-full rounded-full object-cover" /> : (p.is_ai ? <RiRobot3Fill size={20} /> : <FaUserCircle size={20} />)}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{p.is_ai ? p.ai_name : p.name_display}</p>
                            <p className="text-[#a0a0a0] text-[10px] uppercase">{p.role}</p>
                          </div>
                        </div>
                        <button onClick={() => removeParticipant(idx)} className="text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Actions */}
                {!showAddAI && !showAddHuman && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setShowAddAI(true)} className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-2">
                      <RiRobot3Fill className="text-[#00c3ff]" /> Add AI Character
                    </button>
                    <button onClick={() => setShowAddHuman(true)} className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-2">
                      <FaUserPlus className="text-[#00c3ff]" /> Invite Friend
                    </button>
                  </div>
                )}

                {/* Add AI List Form */}
                {showAddAI && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-bold flex items-center gap-2"><RiRobot3Fill className="text-[#00c3ff]" /> Select AI Character</h3>
                      <button onClick={() => setShowAddAI(false)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
                    </div>
                    {aiPersonas.length === 0 ? (
                      <p className="text-[#a0a0a0] text-sm text-center py-4">No AI Personas found. Create one from the AI menu first!</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {aiPersonas.map(persona => {
                          const isAdded = participants.some(p => p.is_ai && p.ai_name === persona.name);
                          return (
                            <div key={persona.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-lg border ${isAdded ? 'border-white/5 bg-white/5 opacity-50' : 'border-white/10 bg-[#0e0c1d]'}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#00c3ff]/20 flex items-center justify-center text-[#00c3ff]">
                                  {persona.avatar_url ? <img src={persona.avatar_url} className="w-full h-full rounded-full object-cover" /> : <RiRobot3Fill />}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-white text-sm font-bold block truncate">{persona.name}</span>
                                  <span className="text-[#a0a0a0] text-[10px] truncate block max-w-full">{persona.personality}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Role..."
                                  className="flex-1 sm:w-24 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-[#00c3ff] outline-none"
                                  id={`role-${persona.id}`}
                                  disabled={isAdded}
                                />
                                {!isAdded && (
                                  <button
                                    onClick={() => handleAddAI(persona, document.getElementById(`role-${persona.id}`).value)}
                                    className="text-xs bg-[#00c3ff]/10 text-[#00c3ff] px-4 py-2 rounded-lg font-bold hover:bg-[#00c3ff] hover:text-black transition-all flex-shrink-0"
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Add Human Form */}
                {showAddHuman && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-bold flex items-center gap-2"><FaUserPlus className="text-[#00c3ff]" /> Invite Friend</h3>
                      <button onClick={() => setShowAddHuman(false)} className="text-[#a0a0a0] hover:text-white"><FaTimes /></button>
                    </div>
                    {friends.length === 0 ? (
                      <p className="text-[#a0a0a0] text-sm text-center py-4">No friends found. Add some friends first!</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {friends.map(friend => {
                          const isAdded = participants.some(p => p.user_id === friend.user_id);
                          return (
                            <div key={friend.user_id} className={`flex items-center justify-between p-3 rounded-lg border ${isAdded ? 'border-white/5 bg-white/5 opacity-50' : 'border-white/10 bg-[#0e0c1d]'}`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#00c3ff]/20 flex items-center justify-center text-[#00c3ff]">
                                  {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full rounded-full object-cover" /> : <FaUserCircle />}
                                </div>
                                <span className="text-white text-sm font-bold truncate">{friend.username}</span>
                              </div>
                              {!isAdded && (
                                <button onClick={() => handleAddHuman(friend, 'Participant')} className="text-xs bg-[#00c3ff]/10 text-[#00c3ff] px-4 py-2 rounded-lg font-bold hover:bg-[#00c3ff] hover:text-black transition-all flex-shrink-0">
                                  Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="text-[#a0a0a0] font-bold px-6 py-4 rounded-xl hover:bg-white/5 transition-all text-center">
                    Back
                  </button>
                  <button onClick={handleCreate} disabled={loading} className="w-full sm:w-auto bg-[#00c3ff] text-black font-black px-8 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,195,255,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Chat Room'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Icon Helper
const FaArrowRight = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path></svg>;
