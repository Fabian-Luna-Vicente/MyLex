import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../hooks/useVocabulary';
import { usePaginate } from '../hooks/usePaginate';
import CreateListModal from '../components/CreateListModal';

export default function AllLists() {
  const navigate = useNavigate();
  const { lists, fetchLists, addList, loading } = useVocabulary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const { currentItems, totalPages } = usePaginate(currentPage, itemsPerPage, lists)

  const handleCreateList = async (listData) => {
    await addList(listData);
  };

  return (
    <div className="min-h-screen bg-[#071320] text-white p-6 md:p-12 relative z-[1] overflow-hidden font-sans">

      {/* Contenedor Principal */}
      <div className="max-w-[1400px] mx-auto relative z-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b-2 border-[#00c3ff]/30 pb-6">
          <div>
            <h1 className="text-4xl md:text-[2.5rem] font-bold tracking-wide mb-2 text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">
              Your <span className="text-[#00c3ff]">Lists</span>
            </h1>
            <p className="text-[#a0a0a0] text-lg font-medium">Organize your vocabulary into personalized collections.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold tracking-wider uppercase text-[#00c3ff] transition-all duration-300 bg-[#0e0c1d]/60 backdrop-blur-sm border border-[#00c3ff]/50 rounded-full hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] shadow-[0_0_10px_rgba(0,195,255,0.2)] hover:shadow-[0_0_20px_rgba(0,195,255,0.5)]"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New List
          </button>
        </header>

        {loading && lists.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00c3ff] border-t-transparent shadow-[0_0_15px_rgba(0,195,255,0.5)]"></div>
          </div>
        ) : (
          <>
            {lists.length > 0 ? (
              /* Grid de Listas adaptado a HeroCard */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[25px] justify-items-center mb-12">
                {currentItems.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => navigate(`/list/${list.id}`)}
                    className="group bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] w-full max-w-[320px] md:max-w-none lg:max-w-[320px] p-6 flex flex-col justify-between min-h-[200px] cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2.5 hover:bg-[#0e0c1d]/80 hover:border-[#00c3ff] hover:shadow-[0_10px_25px_rgba(0,195,255,0.3)]"
                  >
                    <div>
                      {/* Icono decorativo opcional para la lista */}
                      <div className="w-12 h-12 rounded-full bg-[#00c3ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#00c3ff]/20 transition-colors">
                        <svg className="w-6 h-6 text-[#00c3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-[#00c3ff] transition-colors line-clamp-2">
                        {list.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#00c3ff]/20">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#00c3ff]/70">View words</span>
                      <svg className="w-5 h-5 text-[#a0a0a0] group-hover:text-[#00c3ff] transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Estado Vacío */
              <div className="text-center py-20 bg-[#0e0c1d]/40 backdrop-blur-sm rounded-[20px] border-2 border-[#00c3ff]/20 border-dashed">
                <div className="w-20 h-20 mx-auto bg-[#00c3ff]/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,195,255,0.2)]">
                  <svg className="w-10 h-10 text-[#00c3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl text-[#00c3ff] font-bold mb-3 drop-shadow-[0_0_5px_rgba(0,195,255,0.5)]">No lists yet</h3>
                <p className="text-[#a0a0a0] max-w-md mx-auto">Create your first vocabulary list to start organizing the words you want to learn.</p>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-full bg-[#0e0c1d]/60 border border-[#00c3ff]/30 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-[#a0a0a0] font-bold tracking-wider text-sm uppercase">
                  Page <span className="text-[#00c3ff] mx-1 text-base">{currentPage}</span> of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-full bg-[#0e0c1d]/60 border border-[#00c3ff]/30 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}