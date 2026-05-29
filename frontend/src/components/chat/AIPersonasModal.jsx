import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaRobot, FaPlus, FaTrash } from 'react-icons/fa';
import { chatService } from '../../services/chatService';

export default function AIPersonasModal({ onClose }) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [gender, setGender] = useState('female');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadPersonas = async () => {
    try {
      const data = await chatService.getAIPersonas();
      setPersonas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!name || !personality) return;
    try {
      const data = {
        name,
        personality,
        gender,
        avatar_url: avatarUrl || null
      };

      if (editingId) {
        await chatService.updateAIPersona(editingId, data);
      } else {
        await chatService.createAIPersona(data);
      }

      handleCloseForm();
      loadPersonas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPersonality(p.personality);
    setGender(p.gender);
    setAvatarUrl(p.avatar_url || '');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setPersonality('');
    setGender('female');
    setAvatarUrl('');
  };

  const handleDelete = async (id) => {
    try {
      await chatService.deleteAIPersona(id);
      loadPersonas();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0e0c1d] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,195,255,0.05)] relative"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            AI Companions
          </h2>
          <button onClick={onClose} className="text-[#a0a0a0] hover:text-white transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showForm ? (
            <>
              <button
                onClick={() => {
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="w-full py-4 rounded-xl border border-dashed border-white/20 text-[#a0a0a0] hover:text-white hover:border-[#00c3ff] hover:bg-[#00c3ff]/5 transition-all font-bold flex items-center justify-center gap-2"
              >
                <FaPlus /> Create New AI Companion
              </button>

              {loading ? (
                <div className="text-center text-[#a0a0a0] py-10">Loading...</div>
              ) : personas.length === 0 ? (
                <div className="text-center text-[#a0a0a0] py-10">
                  <p>You don't have any custom AI companions yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personas.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#00c3ff]/10 flex items-center justify-center flex-shrink-0 text-[#00c3ff]">
                          {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" /> : <FaRobot size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">{p.name}</h3>
                          <p className="text-[10px] text-[#00c3ff] uppercase font-bold tracking-widest">{p.gender}</p>
                          <p className="text-[#a0a0a0] text-xs mt-2 line-clamp-2">{p.personality}</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-[#a0a0a0] hover:text-white transition-colors p-1"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{editingId ? 'Edit AI Persona' : 'Design AI Persona'}</h3>
                <button onClick={handleCloseForm} className="text-[#a0a0a0] text-sm hover:text-white">Cancel</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff] focus:outline-none" placeholder="e.g. Einstein" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Voice Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[#0e0c1d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff] focus:outline-none appearance-none cursor-pointer">
                    <option value="female" className="bg-[#1a182c] text-white">Female</option>
                    <option value="male" className="bg-[#1a182c] text-white">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Avatar URL (Optional)</label>
                <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff] focus:outline-none" placeholder="https://example.com/image.jpg" />
                {avatarUrl && (
                  <div className="mt-3 flex justify-center">
                    <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-white/20" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest block mb-2">Personality & Behavior</label>
                <textarea value={personality} onChange={e => setPersonality(e.target.value)} rows="3" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00c3ff] focus:outline-none resize-none" placeholder="Describe how this AI acts, speaks, and thinks..." />
              </div>

              <div className="pt-4">
                <button onClick={handleCreateOrUpdate} disabled={!name || !personality} className="w-full bg-[#00c3ff] text-black font-black py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,195,255,0.2)] transition-all disabled:opacity-50">
                  {editingId ? 'Save Changes' : 'Save AI Companion'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
