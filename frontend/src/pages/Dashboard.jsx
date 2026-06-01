import React, { useState, useEffect } from 'react';
import { categories } from "../components/categoriesData";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useDashboard } from '../hooks/useDashboard';

const AccuracyCarousel = ({ accuracies }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (accuracies.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % accuracies.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [accuracies.length]);

  if (accuracies.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center">
        <p className="text-[#a0a0a0] text-xs font-bold uppercase tracking-widest mb-1">Game Accuracy</p>
        <h3 className="text-4xl font-extrabold text-[#00c3ff]">0%</h3>
        <p className="text-[10px] text-[#a0a0a0] mt-2">No games played yet</p>
      </div>
    );
  }

  const current = accuracies[index];

  return (
    <div className="h-full flex flex-col justify-between relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.game}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full"
        >
          <p className="text-[#a0a0a0] text-[10px] font-bold uppercase tracking-widest mb-1">
            {current.game.replace('_', ' ')} · {current.list_name}
          </p>
          <h3 className="text-4xl font-extrabold text-[#00c3ff]">
            {Math.round(current.accuracy)}%
          </h3>
          <div className="w-full bg-[#ffffff05] h-1.5 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${current.accuracy}%` }}
              className="bg-[#00c3ff] h-full rounded-full transition-all duration-1000"
            />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1 mt-4">
        {accuracies.map((_, i) => (
          <div key={i} className={`h-1 w-3 rounded-full transition-all ${i === index ? 'bg-[#00c3ff]' : 'bg-[#ffffff10]'}`} />
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const {
    user,
    logout,
    words,
    lists,
    loading,
    navigate,
    stats,
    activityData
  } = useDashboard();

  return (
    <div className="min-h-screen bg-[#071320] pt-28 relative z-[1] overflow-x-hidden font-sans">

      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block h-[500px] w-[calc(600%+1.3px)]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-[#072138] opacity-80"
          ></path>
        </svg>
      </div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 px-5 pb-12">

        <header className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[2.5rem] md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]"
            >
              Welcome back, <span className="text-[#00c3ff]">{user?.full_name || user?.username}</span>
            </motion.h1>
            <div className="flex gap-2">
               <button 
                 onClick={() => navigate('/settings')}
                 className="p-3 rounded-full bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#00c3ff] hover:border-[#00c3ff]/30 transition-all shadow-lg"
                 title="Settings"
               >
                 <FaCog size={20} />
               </button>
               <button 
                 onClick={() => { logout(); navigate('/login'); }}
                 className="p-3 rounded-full bg-white/5 border border-white/10 text-[#a0a0a0] hover:bg-white hover:text-black transition-all shadow-lg"
                 title="Log Out"
               >
                 <FaSignOutAlt size={20} />
               </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-12 text-left">

            {/* User Streak card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[25px] p-6 flex flex-col justify-between"
            >
              <div className="bg-[#0e0c1d]/60 backdrop-blur-md border border-[#00c3ff]/20 rounded-[20px] p-6 shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="text-[#00c3ff] font-bold uppercase tracking-widest text-xs mb-2">Racha Actual</h3>
                  <p className="text-3xl font-black text-white">{stats?.streak || 0} Días</p>
                </div>
                <FaFire className="text-[#00c3ff] opacity-50" size={40} />
              </div>


            </motion.div>

            {/* Activity Mini Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[25px] p-6"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#a0a0a0] text-xs font-bold uppercase tracking-widest">Weekly Activity</p>
                <button onClick={() => navigate('/statistics')} className="text-[10px] text-[#00c3ff] hover:underline font-bold uppercase">View Detailed</button>
              </div>
              <div className="h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <Area type="monotone" dataKey="count" stroke="#00c3ff" fill="#00c3ff20" strokeWidth={2} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071320', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                      labelStyle={{ display: 'none' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Game Accuracy Carousel Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[25px] p-6 flex flex-col justify-between overflow-hidden"
            >
              <AccuracyCarousel accuracies={stats?.game_accuracy || []} />
            </motion.div>

          </div>
        </header>

        {/* Renderizado  de categorías */}
        {Object.entries(categories).map(([catName, items]) => (
          <div key={catName} className="mb-12 w-full">
            <h2 className="text-[1.8rem] text-[#00c3ff] border-b-2 border-[#00c3ff]/30 pb-2.5 mb-5 text-left md:ml-2.5 uppercase tracking-[2px] text-center md:text-left">
              {catName}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[25px] justify-items-center">

              {items.map((card, index) => {
                if (card.title === "Your Lists") {
                  return (
                    <div
                      key={index}
                      onClick={() => navigate(`/${card.onClick}`)}
                      className="group bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] w-full max-w-[320px] md:max-w-none lg:max-w-[320px] h-auto min-h-[320px] flex flex-col items-center overflow-hidden cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2.5 hover:bg-[#0e0c1d]/80 hover:border-[#00c3ff] hover:shadow-[0_10px_25px_rgba(0,195,255,0.2)]"
                    >
                      <div
                        className="w-full h-[180px] flex justify-center items-center p-[15px]"
                        style={{ background: 'radial-gradient(circle at center, rgba(0,195,255,0.1) 0%, transparent 70%)' }}
                      >
                        <div className="flex items-center gap-6 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110">
                          <div className="text-center">
                            <p className="text-5xl font-extrabold text-white mb-1">{loading ? '...' : lists.length}</p>
                            <p className="text-sm text-[#00c3ff] font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,195,255,0.5)]">Lists</p>
                          </div>
                          <div className="w-px h-16 bg-[#00c3ff]/30"></div>
                          <div className="text-center">
                            <p className="text-5xl font-extrabold text-[#00c3ff] mb-1">{loading ? '...' : words.length}</p>
                            <p className="text-sm text-[#a0a0a0] font-bold uppercase tracking-widest">Words</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-[15px] text-center w-full grow flex flex-col justify-start">
                        <h3 className="text-white text-[1.4rem] font-bold mb-2 transition-colors duration-300 group-hover:text-[#00c3ff]">{card.title}</h3>
                        <p className="text-[#a0a0a0] text-[0.95rem] leading-[1.4]">{card.description}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    onClick={() => navigate(`/${card.onClick}`)}
                    className="group bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] w-full max-w-[320px] md:max-w-none lg:max-w-[320px] h-auto min-h-[320px] flex flex-col items-center overflow-hidden cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2.5 hover:bg-[#0e0c1d]/80 hover:border-[#00c3ff] hover:shadow-[0_10px_25px_rgba(0,195,255,0.3)]"
                  >
                    <div
                      className="w-full h-[180px] flex justify-center items-center p-[15px]"
                      style={{ background: 'radial-gradient(circle at center, rgba(0,195,255,0.1) 0%, transparent 70%)' }}
                    >
                      <img
                        src={card.img}
                        alt={card.title}
                        className="h-full w-auto max-w-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-[15px] text-center w-full grow flex flex-col justify-start">
                      <h3 className="text-white text-[1.4rem] font-bold mb-2 transition-colors duration-300 group-hover:text-[#00c3ff]">
                        {card.title}
                      </h3>
                      <p className="text-[#a0a0a0] text-[0.95rem] leading-[1.4]">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );

              })}
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}
