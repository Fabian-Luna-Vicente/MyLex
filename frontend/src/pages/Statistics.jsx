import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GrPrevious } from 'react-icons/gr';
import { FaFilter, FaCalendarAlt, FaGamepad, FaListUl, FaTags, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { progressService } from '../services/progressService';
import { useVocabulary } from '../hooks/useVocabulary';

const COLORS = ['#00c3ff', '#00ff88', '#ffcc00', '#ff4d4d', '#a0a0a0'];

export default function Statistics() {
  const navigate = useNavigate();
  const { lists, fetchLists } = useVocabulary();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [overall, setOverall] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    game: '',
    list_id: '',
    word_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchLists();
    loadOverall();
    loadDetailed();
  }, []);

  const loadOverall = async () => {
    try {
      const data = await progressService.getOverallStats();
      setOverall(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDetailed = async () => {
    setLoading(true);
    try {
      const data = await progressService.getDetailedStats(filters);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadDetailed();
  };

  // Prepare data for activity chart
  const activityData = overall?.recent_activity?.map(a => ({
    date: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
    count: a.count
  })) || [];

  // Prepare data for Random Distribution
  const randomData = overall?.random_distribution ? Object.entries(overall.random_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  return (
    <div className="min-h-screen bg-[#071320] text-white font-sans pb-20 overflow-x-hidden">

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00c3ff]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00ff88]/5 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8 pb-6 border-b border-[#00c3ff]/20 backdrop-blur-md sticky top-0 bg-[#071320]/80">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <GrPrevious className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
        <h1 className="text-2xl font-extrabold drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
          Performance <span className="text-[#00c3ff]">Analytics</span>
        </h1>
        <div className="w-24 md:block hidden" />
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* --- OVERALL SUMMARY --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Recent Activity Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#0e0c1d]/60 backdrop-blur-xl border border-[#00c3ff]/20 rounded-[30px] p-6 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaCalendarAlt className="text-[#00c3ff]" /> Recent Activity (7 Days)
              </h2>
              <div className="bg-[#00c3ff]/10 px-4 py-1 rounded-full text-[#00c3ff] text-xs font-bold uppercase tracking-widest">
                Streak: {overall?.streak || 0} Days
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c3ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00c3ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0a0a0" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0e0c1d', border: '1px solid #00c3ff30', borderRadius: '12px' }}
                    itemStyle={{ color: '#00c3ff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#00c3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Random Mastery Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0e0c1d]/60 backdrop-blur-xl border border-[#00c3ff]/20 rounded-[30px] p-6 shadow-xl flex flex-col items-center"
          >
            <h2 className="text-lg font-bold mb-6 w-full text-left">Mastery Distribution</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={randomData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {randomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0e0c1d', border: '1px solid #00c3ff30', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-[11px] font-bold uppercase tracking-wider">
              {randomData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[#a0a0a0]">{d.name}:</span>
                  <span className="text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* --- FILTERS --- */}
        <section className="bg-[#0e0c1d]/40 border border-[#ffffff10] rounded-[25px] p-6 mb-10">
          <div className="flex items-center gap-3 mb-6 text-[#00c3ff]">
            <FaFilter /> <h2 className="font-bold uppercase tracking-[2px] text-sm">Filter Detailed Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#a0a0a0] ml-2 flex items-center gap-1">
                <FaGamepad size={10} /> Game
              </label>
              <select
                name="game"
                value={filters.game}
                onChange={handleFilterChange}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#00c3ff] outline-none transition-all"
              >
                <option value="">All Games</option>
                <option value="random">Random Repetition</option>
                <option value="hangman">Hangman</option>
                <option value="visual_memory">Visual Memory</option>
                <option value="syn_ant">Synonyms & Antonyms</option>
                <option value="listening">Listening Practice</option>
                <option value="writing">Writing Skills</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#a0a0a0] ml-2 flex items-center gap-1">
                <FaListUl size={10} /> List
              </label>
              <select
                name="list_id"
                value={filters.list_id}
                onChange={handleFilterChange}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#00c3ff] outline-none transition-all"
              >
                <option value="">All Lists</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#a0a0a0] ml-2 flex items-center gap-1">
                <FaTags size={10} /> Word Type
              </label>
              <input
                type="text"
                name="word_type"
                placeholder="Verb, Noun..."
                value={filters.word_type}
                onChange={handleFilterChange}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#00c3ff] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#a0a0a0] ml-2 flex items-center gap-1">
                <FaCalendarAlt size={10} /> Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-xl px-4 py-2.5 text-sm focus:border-[#00c3ff] outline-none transition-all [color-scheme:dark]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full py-2.5 bg-[#00c3ff] text-black font-bold rounded-xl hover:bg-[#00ff88] transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </section>

        {/* --- FILTER SUMMARY --- */}
        {!loading && stats.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-[#0e0c1d]/60 border border-[#00c3ff]/10 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest mb-1">Total Played</span>
              <span className="text-2xl font-black text-white">{stats.length}</span>
            </div>
            <div className="bg-[#0e0c1d]/60 border border-[#00ff88]/10 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest mb-1">Avg Accuracy</span>
              <span className="text-2xl font-black text-[#00ff88]">
                {Math.round((stats.filter(s => s.is_correct).length / stats.filter(s => s.is_correct !== null).length || 0) * 100)}%
              </span>
            </div>
            <div className="bg-[#0e0c1d]/60 border border-[#ff4d4d]/10 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest mb-1">Mistakes</span>
              <span className="text-2xl font-black text-red-500">{stats.filter(s => s.is_correct === false).length}</span>
            </div>
            <div className="bg-[#0e0c1d]/60 border border-[#00c3ff]/10 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-[#a0a0a0] font-bold uppercase tracking-widest mb-1">Active Words</span>
              <span className="text-2xl font-black text-[#00c3ff]">{new Set(stats.map(s => s.word_id)).size}</span>
            </div>
          </section>
        )}

        {/* --- DETAILED DATA TABLE --- */}
        <section className="bg-[#0e0c1d]/60 backdrop-blur-xl border border-[#ffffff10] rounded-[30px] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#ffffff10] flex justify-between items-center">
            <h2 className="font-bold text-lg">Detailed Progress Log</h2>
            <span className="text-xs text-[#a0a0a0] uppercase tracking-widest font-bold">
              {stats.length} Records Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#ffffff05] text-[10px] uppercase tracking-widest font-bold text-[#a0a0a0]">
                <tr>
                  <th className="px-6 py-4">Word</th>
                  <th className="px-6 py-4">Game</th>
                  <th className="px-6 py-4">Result / Difficulty</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff05]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent" />
                        <p className="text-[#a0a0a0] italic">Loading records...</p>
                      </div>
                    </td>
                  </tr>
                ) : stats.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-[#a0a0a0] italic">
                      No records found with these filters.
                    </td>
                  </tr>
                ) : (
                  stats.map((row) => (
                    <tr key={row.id} className="hover:bg-[#ffffff03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#00c3ff] transition-colors">{row.word?.name}</span>
                          <span className="text-[10px] text-[#a0a0a0] italic">{row.word?.meaning?.substring(0, 40)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-[#00c3ff10] text-[#00c3ff] text-[10px] font-bold uppercase tracking-wider">
                          {row.game}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {row.game === 'random' ? (
                          <span className={`text-[11px] font-bold uppercase ${row.difficulty === 'easy' ? 'text-yellow-400' :
                            row.difficulty === 'normal' ? 'text-orange-400' :
                              row.difficulty === 'hard' ? 'text-red-400' : 'text-red-700'
                            }`}>
                            {row.difficulty}
                          </span>
                        ) : (
                          <span className={`text-[11px] font-bold uppercase ${row.is_correct ? 'text-[#00ff88]' : 'text-red-500'}`}>
                            {row.is_correct ? 'Correct' : 'Mistake'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#a0a0a0] text-xs">
                        {new Date(row.reviewed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
