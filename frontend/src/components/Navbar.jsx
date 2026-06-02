import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaListUl, FaChartLine, FaGamepad,
  FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown,
  FaPlusCircle, FaComments, FaGlobe, FaUsers, FaSearch, FaBars, FaTimes
} from 'react-icons/fa';
import { useNavbar } from '../hooks/useNavbar';

export default function Navbar() {
  const {
    user,
    navigate,
    isProfileOpen,
    setIsProfileOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isCommunityOpen,
    setIsCommunityOpen,
    isCommunityActive,
    handleLogout,
    isActive
  } = useNavbar();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'My Lists', path: '/lists', icon: <FaListUl /> },
    { name: 'Statistics', path: '/statistics', icon: <FaChartLine /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#0e0c1d]/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 sm:px-6 py-2 shadow-2xl">

        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden text-white p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tighter text-white">
              MY<span className="text-[#00c3ff]">LEX</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive(link.path)
                ? 'bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20'
                : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                }`}
            >
              <span className={isActive(link.path) ? 'text-[#00c3ff]' : 'text-[#a0a0a0]'}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}

          {/* Community Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCommunityOpen(!isCommunityOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isCommunityActive
                ? 'bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/20'
                : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                }`}
            >
              <span className={isCommunityActive ? 'text-[#00c3ff]' : 'text-[#a0a0a0]'}>
                <FaGlobe />
              </span>
              Community
              <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isCommunityOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isCommunityOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsCommunityOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-[#0e0c1d] border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    <button
                      onClick={() => { setIsCommunityOpen(false); navigate('/friends'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <FaUsers className="text-[#00c3ff]" /> Friends
                    </button>
                    <button
                      onClick={() => { setIsCommunityOpen(false); navigate('/search'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <FaSearch className="text-[#00c3ff]" /> Search Users
                    </button>
                    <button
                      onClick={() => { setIsCommunityOpen(false); navigate('/chat'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <FaComments className="text-[#00c3ff]" /> Chats
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/create-word"
            className="flex items-center gap-2 px-4 py-2 bg-[#00c3ff] text-black rounded-xl text-sm font-black hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] transition-all ml-2"
          >
            <FaPlusCircle />
            ADD WORD
          </Link>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00c3ff]/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00c3ff]/20 flex items-center justify-center text-[#00c3ff] font-bold border border-[#00c3ff]/30 overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <FaUserCircle size={20} />}
            </div>
            <div className="text-left hidden sm:block mr-2">
              <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest leading-none mb-1">User</p>
              <p className="text-xs font-black text-white truncate max-w-[80px]">{user?.full_name || 'My Profile'}</p>
            </div>
            <FaChevronDown className={`text-[#a0a0a0] text-[10px] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-[#0e0c1d] border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-bold text-[#00c3ff] uppercase tracking-widest">Account Info</p>
                    <p className="text-xs font-medium text-[#a0a0a0] truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <FaUserCircle className="text-[#00c3ff]" /> Profile
                  </button>

                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <FaCog className="text-[#a0a0a0]" /> Settings
                  </button>

                  <div className="my-2 border-t border-white/5"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <FaSignOutAlt /> Log Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0e0c1d]/95 backdrop-blur-xl border border-white/10 rounded-2xl mt-2 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(link.path)
                    ? 'bg-[#00c3ff]/10 text-[#00c3ff]'
                    : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              <div className="w-full h-px bg-white/10 my-2"></div>
              <p className="text-[10px] text-[#00c3ff] font-bold uppercase tracking-widest px-4 mb-1">Community</p>

              <Link to="/friends" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all">
                <FaUsers className="text-[#00c3ff]" /> Friends
              </Link>
              <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all">
                <FaSearch className="text-[#00c3ff]" /> Search Users
              </Link>
              <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all">
                <FaComments className="text-[#00c3ff]" /> Chats
              </Link>

              <div className="w-full h-px bg-white/10 my-2"></div>

              <Link
                to="/create-word"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#00c3ff] text-black rounded-xl font-black hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] transition-all"
              >
                <FaPlusCircle />
                Add Vocabulary
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
