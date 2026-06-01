import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCog, FaUser, FaBell, FaGlobe, FaPalette,
  FaShieldAlt, FaQuestionCircle, FaSignOutAlt, FaChevronRight
} from 'react-icons/fa';
import { useSettings } from '../hooks/useSettings';

export default function Settings() {
  const {
    user,
    navigate,
    settings,
    handleLanguageChange,
    handleLogout,
    toggleSetting
  } = useSettings();

  const sections = [
    {
      title: 'Preferences',
      icon: <FaCog />,
      items: [
        { label: 'AI Responses Language', desc: 'Set the target language for definitions and grammar', type: 'select', value: settings.language, action: handleLanguageChange },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00c3ff] to-[#0080ff] flex items-center justify-center text-black shadow-lg shadow-[#00c3ff]/20">
          <FaCog size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-[#a0a0a0] font-medium">Manage your app experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Tabs (Optional - simplified for now) */}
        <div className="md:col-span-2 space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0e0c1d] border border-white/5 rounded-3xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                <span className="text-[#00c3ff]">{section.icon}</span>
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">{section.title}</h3>
              </div>
              <div className="p-2">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
                  >
                    <div>
                      <h4 className="text-white font-bold">{item.label}</h4>
                      <p className="text-xs text-[#a0a0a0]">{item.desc}</p>
                    </div>

                    {item.type === 'toggle' ? (
                      <button
                        onClick={item.action}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${item.value ? 'bg-[#00c3ff]' : 'bg-[#1a182c]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${item.value ? 'left-7' : 'left-1'}`} />
                      </button>
                    ) : item.type === 'select' ? (
                      <select
                        value={item.value}
                        onChange={(e) => item.action(e.target.value)}
                        className="bg-[#1a182c] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#00c3ff]/50"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                      </select>
                    ) : (
                      <button onClick={item.action} className="text-[#a0a0a0] group-hover:text-white group-hover:translate-x-1 transition-all">
                        <FaChevronRight />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#00c3ff]/10 to-[#0080ff]/10 border border-[#00c3ff]/20 rounded-3xl p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <FaUser size={40} className="text-[#00c3ff]" />}
            </div>
            <h3 className="text-white font-black">{user?.full_name || 'My Profile'}</h3>
            <p className="text-xs text-[#a0a0a0] mb-6">{user?.email}</p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
            >
              View Profile
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-3xl bg-white/5 border border-white/20 text-white flex items-center justify-center gap-3 font-black hover:bg-white hover:text-black transition-all shadow-lg hover:shadow-white/20"
          >
            <FaSignOutAlt /> LOG OUT
          </button>

          <div className="p-6 text-center">
            <p className="text-[10px] text-[#a0a0a0] uppercase tracking-widest font-black mb-2">MyLex App</p>
            <p className="text-[10px] text-[#a0a0a0]">Version 1.2.0 • 2026 Build</p>
          </div>
        </div>
      </div>
    </div>
  );
}
