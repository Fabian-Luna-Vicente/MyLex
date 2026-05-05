import { IoAddCircleSharp } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { MdOutlineModeEdit, MdDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";
import { BsXLg } from "react-icons/bs";
import { GrPrevious, GrNext } from "react-icons/gr";
import { useListWords } from '../hooks/useListWords';
import { usePaginate } from '../hooks/usePaginate';
import WordDetailModal from '../components/WordDetailModal';
import { AnimatePresence } from 'framer-motion';

export default function ListWords() {
  const { 
    list, lists, loading, id, navigate,
    showEditListMenu, setShowEditListMenu, 
    showMoveMenu, setShowMoveMenu, 
    showConfirmDelete, setShowConfirmDelete, 
    showDetailModal, setShowDetailModal,
    newTitle, setNewTitle, 
    wordToMove, setWordToMove, 
    wordToDelete, setWordToDelete, 
    wordForDetail, setWordForDetail,
    deleteMode, setDeleteMode, 
    currentPage, setCurrentPage, 
    itemsPerPage, 
    playSound,
    handleEditList, handleDeleteList, handleDeleteWord, handleMoveWord,
    openDetail
  } = useListWords();

  const { currentItems, totalPages } = usePaginate(currentPage, itemsPerPage, list?.words || []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071320] flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00c3ff] border-t-transparent shadow-[0_0_15px_rgba(0,195,255,0.5)]"></div>
      </div>
    );
  }

  // --- RENDER DE ERROR/NO ENCONTRADO ---
  if (!list) {
    return (
      <div className="min-h-screen bg-[#071320] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4 drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">List not found</h2>
        <button onClick={() => navigate('/lists')} className="text-[#00c3ff] hover:text-white transition-colors duration-300 underline underline-offset-4">
          Go back to lists
        </button>
      </div>
    );
  }

  // --- VISTA PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#071320] text-white p-6 md:p-12 font-sans relative z-[1] overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <header className="mb-12 border-b-2 border-[#00c3ff]/30 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/lists')}
              className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] mb-4 transition-colors duration-300 font-bold uppercase tracking-widest text-xs"
            >
              <GrPrevious className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Lists
            </button>

            <h1 className="text-3xl md:text-[2.5rem] font-bold text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] tracking-wide flex items-center gap-3">
              {list.name}
              {/* Botones rápidos de lista */}
              <button onClick={() => { setNewTitle(list.name); setShowEditListMenu(true); }} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors text-xl" title="Edit List">
                <MdOutlineModeEdit />
              </button>
              <button onClick={handleDeleteList} className="text-[#a0a0a0] hover:text-red-500 transition-colors text-xl" title="Delete List">
                <MdDeleteOutline />
              </button>
            </h1>

            <p className="text-[#a0a0a0] mt-2 font-medium tracking-wide">
              <span className="text-[#00c3ff] font-bold">{list.words?.length || 0}</span> words in this list
            </p>
          </div>

          <button
            onClick={() => navigate(`/create-word?listId=${id}`)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0e0c1d]/60 backdrop-blur-sm border border-[#00c3ff]/50 text-[#00c3ff] rounded-full hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] shadow-[0_0_10px_rgba(0,195,255,0.2)] hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] transition-all duration-300 font-bold tracking-wider uppercase text-sm"
          >
            <IoAddCircleSharp size={20} />
            Add Word
          </button>
        </header>

        {/* GRID DE PALABRAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px] justify-items-center mb-12">
          {currentItems.length > 0 ? (
            currentItems.map((word) => (

              <div
                key={word.id}
                className="group bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 rounded-[20px] w-full max-w-[350px] p-6 flex flex-col shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2 hover:bg-[#0e0c1d]/80 hover:border-[#00c3ff] hover:shadow-[0_10px_25px_rgba(0,195,255,0.3)] h-full"
              >
                {/* Cabecera de la tarjeta: Título y Tags */}
                <div className="flex justify-between items-start mb-4 border-b border-[#00c3ff]/20 pb-3 flex-shrink-0">
                  <h3 
                    onClick={() => openDetail(word)}
                    className="text-[1.5rem] font-bold text-white transition-colors duration-300 group-hover:text-[#00c3ff] cursor-pointer"
                  >
                    {word.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                    {word.word_types?.map((type, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] uppercase font-bold px-2 py-1 bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/30 rounded-md"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CONTENEDOR FLEXIBLE */}
                <div className="flex-grow flex flex-col">
                  {/* Imagen */}
                  {word.image && (
                    <div className="w-full h-32 mb-4 rounded-xl overflow-hidden border border-[#00c3ff]/20 flex-shrink-0">
                      <img src={word.image} alt={word.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}

                  {/* Significado */}
                  {word.meaning && (
                    <p className="text-[#a0a0a0] mb-4 whitespace-pre-wrap text-[0.95rem] leading-[1.4]">
                      {word.meaning}
                    </p>
                  )}

                  {/* Conjugaciones */}
                  {(word.past || word.gerund || word.participle) && (
                    <div className="flex gap-2 mb-3 text-[10px] text-[#a0a0a0] font-medium italic overflow-x-auto custom-scrollbar pb-1">
                      {word.past && <span className="bg-[#0e0c1d] px-2 py-1 rounded border border-[#00c3ff]/10 whitespace-nowrap">Past: {word.past}</span>}
                      {word.gerund && <span className="bg-[#0e0c1d] px-2 py-1 rounded border border-[#00c3ff]/10 whitespace-nowrap">Gerund: {word.gerund}</span>}
                      {word.participle && <span className="bg-[#0e0c1d] px-2 py-1 rounded border border-[#00c3ff]/10 whitespace-nowrap">Participle: {word.participle}</span>}
                    </div>
                  )}
                </div>

                {/* BARRA DE ACCIONES DE LA TARJETA */}
                <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#00c3ff]/10 flex-shrink-0">
                  <button onClick={() => playSound(word.name)} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors" title="Listen">
                    <CiPlay1 size={22} />
                  </button>
                  <button onClick={() => navigate(`/word/edit/${word.id}`)} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors" title="Edit">
                    <MdOutlineModeEdit size={22} />
                  </button>
                  <button onClick={() => { setWordToMove(word); setShowMoveMenu(true); }} className="text-[#a0a0a0] hover:text-[#00c3ff] transition-colors" title="Move/Copy">
                    <MdOutlineDriveFileMove size={22} />
                  </button>
                  <button onClick={() => { setWordToDelete(word); setShowConfirmDelete(true); }} className="text-[#a0a0a0] hover:text-red-500 transition-colors" title="Delete">
                    <MdDeleteOutline size={22} />
                  </button>
                </div>
              </div>

            ))
          ) : (
            /* Estado Vacío */
            <div className="col-span-full py-20 w-full text-center bg-[#0e0c1d]/40 backdrop-blur-sm rounded-[20px] border-2 border-[#00c3ff]/20 border-dashed">
              <h3 className="text-2xl text-[#00c3ff] font-bold mb-3 drop-shadow-[0_0_5px_rgba(0,195,255,0.5)]">No words yet</h3>
              <p className="text-[#a0a0a0] max-w-md mx-auto">
                Your list is empty. Click the <span className="text-[#00c3ff] font-bold">"Add Word"</span> button above to start building your vocabulary.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-[#0e0c1d]/60 border border-[#00c3ff]/30 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <GrPrevious />
            </button>
            <span className="text-[#a0a0a0] font-bold tracking-wider text-sm uppercase">
              Page <span className="text-[#00c3ff] mx-1 text-base">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-[#0e0c1d]/60 border border-[#00c3ff]/30 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:border-[#00c3ff] hover:shadow-[0_0_10px_rgba(0,195,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <GrNext />
            </button>
          </div>
        )}

      </div>

      {/* --- MODALES NATIVOS --- */}

      {/* 1. Modal Editar Lista */}
      {showEditListMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071320]/80 backdrop-blur-md" onClick={() => setShowEditListMenu(false)}></div>
          <div className="relative bg-[#0e0c1d]/80 backdrop-blur-[15px] rounded-[20px] w-full max-w-sm p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00c3ff]/30">
            <h3 className="text-[1.5rem] font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)]">Rename <span className="text-[#00c3ff]">List</span></h3>
            <input
              type="text"
              placeholder="New List Name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full mb-6 bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white placeholder-[#a0a0a0]/40 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
            />
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowEditListMenu(false)} className="px-5 py-2.5 rounded-full font-bold text-[#a0a0a0] hover:text-[#00c3ff] hover:bg-[#00c3ff]/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleEditList} className="px-5 py-2.5 rounded-full font-bold bg-[#0e0c1d]/60 border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/20 hover:shadow-[0_0_15px_rgba(0,195,255,0.4)] transition-all">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Mover Palabra */}
      {showMoveMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071320]/80 backdrop-blur-md" onClick={() => setShowMoveMenu(false)}></div>
          <div className="relative bg-[#0e0c1d]/80 backdrop-blur-[15px] rounded-[20px] w-full max-w-md p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00c3ff]/30">
            <div className="flex justify-between items-center mb-6 border-b border-[#00c3ff]/20 pb-4">
              <h3 className="text-xl font-bold text-white">Move <span className="text-[#00c3ff]">"{wordToMove?.name}"</span></h3>
              <button onClick={() => setShowMoveMenu(false)} className="text-[#a0a0a0] hover:text-white transition-colors"><BsXLg size={20} /></button>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer text-[#a0a0a0] hover:text-white transition-colors text-sm">
              <input type="checkbox" onChange={() => setDeleteMode(!deleteMode)} className="w-4 h-4 accent-[#00c3ff]" />
              Delete from current list after moving?
            </label>

            <p className="text-[11px] font-bold text-[#00c3ff]/80 uppercase tracking-widest mb-3">Select Target List</p>
            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-[#a0a0a0] text-sm italic">
              {lists.filter(l => l.id !== parseInt(id)).map((targetList) => (
                <button
                  key={targetList.id}
                  onClick={handleMoveWord} // Requires further backend logic
                  className="w-full text-left px-4 py-3 rounded-[12px] bg-[#071320] border border-[#00c3ff]/20 text-white hover:border-[#00c3ff] hover:bg-[#00c3ff]/10 hover:text-[#00c3ff] transition-all duration-300"
                >
                  {targetList.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Confirmar Borrado de Palabra */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071320]/80 backdrop-blur-md" onClick={() => setShowConfirmDelete(false)}></div>
          <div className="relative bg-[#0e0c1d]/80 backdrop-blur-[15px] rounded-[20px] w-full max-w-sm p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00c3ff]/30 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Delete Word</h3>
            <p className="text-[#a0a0a0] mb-6">Are you sure you want to delete <span className="text-[#00c3ff] font-bold">"{wordToDelete?.name}"</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2.5 rounded-full font-bold text-[#a0a0a0] hover:text-white hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteWord} className="px-6 py-2.5 rounded-full font-bold bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/40 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Detalle de Palabra */}
      <AnimatePresence>
        {showDetailModal && (
          <WordDetailModal 
            word={wordForDetail} 
            onClose={() => setShowDetailModal(false)}
            onPlay={playSound}
            onEdit={(id) => navigate(`/word/edit/${id}`)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}