import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../hooks/useVocabulary';
import { useAi } from '../hooks/useAi';
import { GrPrevious } from "react-icons/gr";
import { FaSearch, FaRobot, FaSave, FaImage, FaChevronDown } from "react-icons/fa";
import { useCreateWord } from '../hooks/useCreateWord';

export default function CreateWord() {
  const navigate = useNavigate();


  const { lists, addWord, fetchLists } = useVocabulary();
  const { searchDictionary, loading: aiLoading } = useAi();

  const { searchWord, setSearchWord, useAiMode, setUseAiMode, searchResults, aiContext,
    setAiContext, handleSubmit, handleSelectResult, handleSearch, setSelectedListId,
    selectedListId, error, formData, setFormData, imageQuery, setImageQuery, imageResults,
    isSearchingImages, imagePage, setImagePage, searchGoogleImages, handleImageSearchSubmit,
    handleLoadMoreImages, toggleListSelection, saving, setSaving } = useCreateWord(lists, addWord, fetchLists, searchDictionary, aiLoading);

  return (
    <div className="min-h-screen bg-[#071320] text-white p-6 md:p-12 font-sans relative z-[1] overflow-hidden">

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 border-b-2 border-[#00c3ff]/30 pb-6 flex flex-col items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-[#a0a0a0] hover:text-[#00c3ff] transition-colors duration-300 font-bold uppercase tracking-widest text-xs"
          >
            <GrPrevious className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>

          <h1 className="text-3xl md:text-[2.5rem] font-bold text-white drop-shadow-[0_0_10px_rgba(0,195,255,0.5)] tracking-wide">
            Create a <span className="text-[#00c3ff]">Word</span>
          </h1>
          <p className="text-[#a0a0a0] mt-2 font-medium tracking-wide">
            Search the dictionary or manually add a new word with full details.
          </p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-[15px] mb-8 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        {/* --- 1. SECCIÓN: BUSCADOR DE DICCIONARIO --- */}
        <div className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 p-6 md:p-8 rounded-[20px] mb-8 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
          <h2 className="text-[1.5rem] font-bold mb-6 text-white transition-colors duration-300 flex items-center gap-3 drop-shadow-[0_0_5px_rgba(0,195,255,0.3)]">
            <FaSearch className="text-[#00c3ff]" />
            Dictionary Search
          </h2>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Enter word to search..."
                className="flex-grow bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3.5 text-white placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={aiLoading || !searchWord.trim()}
                className="px-8 py-3.5 bg-[#00c3ff]/20 border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/40 hover:shadow-[0_0_20px_rgba(0,195,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wider rounded-[15px] transition-all flex items-center justify-center min-w-[140px]"
              >
                {aiLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent"></div>
                ) : "Search"}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setUseAiMode(!useAiMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAiMode ? 'bg-[#00c3ff]' : 'bg-[#a0a0a0]/30 border border-[#00c3ff]/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAiMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-bold tracking-wide text-[#a0a0a0]">
                AI Contextual Search {useAiMode && <span className="text-[#00c3ff] ml-1 inline-flex items-center gap-1"><FaRobot /> Groq</span>}
              </span>
            </div>

            {useAiMode && (
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder="Where did you read this word? Paste the sentence here for a highly accurate AI definition..."
                className="mt-2 w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 min-h-[100px]"
              />
            )}
          </form>

          {searchResults.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-4 border-b border-[#00c3ff]/20 pb-2">Search Results</h3>
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectResult(res)}
                  className="group cursor-pointer bg-[#071320] border border-[#00c3ff]/20 hover:border-[#00c3ff] p-5 rounded-[15px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,195,255,0.2)]"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-bold text-white group-hover:text-[#00c3ff] transition-colors">{res.name}</h4>
                    <span className="text-[10px] bg-[#00c3ff]/10 text-[#00c3ff] border border-[#00c3ff]/30 uppercase font-bold tracking-wider px-3 py-1.5 rounded-full">
                      Select This
                    </span>
                  </div>
                  <p className="text-[#a0a0a0] mt-2 text-[0.95rem] leading-[1.4] whitespace-pre-wrap">{res.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 2. SECCIÓN: FORMULARIO PRINCIPAL --- */}
        <div id="details-section" className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 p-6 md:p-8 rounded-[20px] shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
          <h2 className="text-[1.5rem] font-bold mb-6 text-white transition-colors duration-300 flex items-center gap-3 drop-shadow-[0_0_5px_rgba(0,195,255,0.3)] border-b border-[#00c3ff]/20 pb-4">
            <span className="text-[#00c3ff]">Aa</span>
            Word Full Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Row 1: Word & Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Word <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Word Types <span className="text-[#a0a0a0] lowercase font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={formData.word_types}
                  onChange={(e) => setFormData({ ...formData, word_types: e.target.value })}
                  placeholder="e.g. noun, verb"
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
                />
              </div>
            </div>

            {/* Row 2: Conjugations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#071320]/50 p-4 rounded-[15px] border border-[#00c3ff]/10">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Past</label>
                <input
                  type="text"
                  value={formData.past}
                  onChange={(e) => setFormData({ ...formData, past: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2.5 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Gerund (-ing)</label>
                <input
                  type="text"
                  value={formData.gerund}
                  onChange={(e) => setFormData({ ...formData, gerund: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2.5 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Participle</label>
                <input
                  type="text"
                  value={formData.participle}
                  onChange={(e) => setFormData({ ...formData, participle: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2.5 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 text-sm"
                />
              </div>
            </div>

            {/* Row 3 & 4: Meaning and Examples */}
            <div>
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Meaning / Translation</label>
              <textarea
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Examples <span className="text-[#a0a0a0] lowercase font-normal">(one per line)</span></label>
              <textarea
                value={formData.examples}
                onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                placeholder="I love reading books.&#10;She reads every day."
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300 min-h-[80px]"
              />
            </div>

            {/* Row 5: Synonyms & Antonyms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Synonyms <span className="text-[#a0a0a0] lowercase font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={formData.synonyms}
                  onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Antonyms <span className="text-[#a0a0a0] lowercase font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={formData.antonyms}
                  onChange={(e) => setFormData({ ...formData, antonyms: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
                />
              </div>
            </div>

            {/* --- 3. SECCIÓN: BUSCADOR DE IMÁGENES INTEGRADO --- */}
            <div className="bg-[#071320]/50 p-5 rounded-[20px] border border-[#00c3ff]/10">
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-3 flex items-center gap-2">
                <FaImage /> Image Selection
              </label>

              {/* Barra de Búsqueda de Imágenes */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={imageQuery}
                  onChange={(e) => setImageQuery(e.target.value)}
                  placeholder="Search image..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleImageSearchSubmit(e); }}
                  className="flex-grow bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff] focus:ring-1 focus:ring-[#00c3ff] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={handleImageSearchSubmit}
                  disabled={isSearchingImages}
                  className="px-6 py-3 bg-[#00c3ff]/20 text-[#00c3ff] hover:bg-[#00c3ff]/30 font-bold uppercase tracking-wider rounded-[15px] transition-all flex items-center justify-center min-w-[140px] border border-[#00c3ff]/50"
                >
                  {isSearchingImages && imagePage === 1 ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent"></div>
                  ) : "Search"}
                </button>
              </div>

              {/* Grid de Resultados de Imágenes */}
              {imageResults.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {imageResults.map((result, i) => (
                      <div
                        key={i}
                        className={`cursor-pointer rounded-[10px] overflow-hidden border-2 transition-all duration-200 aspect-square ${formData.image === result.link ? 'border-[#00c3ff] shadow-[0_0_15px_rgba(0,195,255,0.6)] scale-105 z-10' : 'border-transparent hover:border-[#00c3ff]/50'}`}
                        onClick={() => setFormData({ ...formData, image: result.link })}
                      >
                        <img
                          src={result.link}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Paginación de Imágenes */}
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMoreImages}
                      disabled={isSearchingImages}
                      className="flex items-center gap-2 text-xs font-bold text-[#00c3ff] uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {isSearchingImages && imagePage > 1 ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent"></div>
                      ) : <FaChevronDown />}
                      Load More Images
                    </button>
                  </div>
                </div>
              )}

              {/* Input Manual de URL (Como fallback o si quiere pegar uno directo) */}
              <div className="mt-4">
                <label className="block text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest mb-2">Or paste image URL directly:</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-[#071320] border border-[#00c3ff]/20 rounded-[15px] px-4 py-2.5 text-[#a0a0a0] text-sm focus:outline-none focus:border-[#00c3ff]/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Row 7: Lists Selection */}
            <div>
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-3">Save to Lists</label>
              {lists.length === 0 ? (
                <p className="text-sm text-[#a0a0a0] italic">No lists available. You should create one first!</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {lists.map(list => {
                    const isSelected = formData.list_ids.includes(list.id);
                    return (
                      <button
                        type="button"
                        key={list.id}
                        onClick={() => toggleListSelection(list.id)}
                        className={`px-4 py-2 rounded-[10px] text-sm font-bold tracking-wide transition-all border ${isSelected
                          ? 'bg-[#00c3ff]/20 border-[#00c3ff] text-[#00c3ff] shadow-[0_0_10px_rgba(0,195,255,0.3)]'
                          : 'bg-[#071320] border-[#00c3ff]/30 text-[#a0a0a0] hover:border-[#00c3ff]/60 hover:text-white'
                          }`}
                      >
                        {list.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#00c3ff]/20 flex justify-end">
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="px-8 py-3.5 bg-[#0e0c1d]/60 border border-[#00c3ff]/50 text-[#00c3ff] hover:bg-[#00c3ff]/20 shadow-[0_0_10px_rgba(0,195,255,0.2)] hover:shadow-[0_0_20px_rgba(0,195,255,0.5)] font-bold uppercase tracking-wider rounded-full transition-all duration-300 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-[#00c3ff] border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" size={18} />
                    Save Word
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}