import { useAuth } from '../hooks/useAuth';
import { useVocabulary } from '../hooks/useVocabulary';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from "../components/categoriesData";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { words, lists, fetchWords, fetchLists, loading } = useVocabulary();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWords();
    fetchLists();
  }, [fetchWords, fetchLists]);

  return (
    <div className="min-h-screen bg-[#071320] pt-28 relative z-[1] overflow-hidden font-sans">

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

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-[2.5rem] md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] mb-4">
          Welcome back, <span className="text-[#00c3ff]">{user?.username}</span>
        </h1>

      </div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 px-5 pb-12">

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
