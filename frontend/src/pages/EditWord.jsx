import { useNavigate, useParams } from 'react-router-dom';
import { useVocabulary } from '../hooks/useVocabulary';
import { useAi } from '../hooks/useAi';
import { GrPrevious } from "react-icons/gr";
import { FaSearch, FaRobot, FaSave, FaImage, FaChevronDown } from "react-icons/fa";
import { useEditWord } from '../hooks/useEditWord';

export default function EditWord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { lists, updateWord, fetchLists, fetchWordDetails } = useVocabulary();
  const { searchDictionary, loading: aiLoading } = useAi();

  const { 
    searchWord, setSearchWord, useAiMode, setUseAiMode, searchResults, aiContext,
    setAiContext, handleSubmit, handleSelectResult, handleSearch, setSelectedListId,
    selectedListId, error, formData, setFormData, imageQuery, setImageQuery, imageResults,
    isSearchingImages, imagePage, setImagePage, handleImageSearchSubmit,
    handleLoadMoreImages, toggleListSelection, saving, loadingWord, toggleWordType 
  } = useEditWord(id, lists, updateWord, fetchLists, fetchWordDetails, searchDictionary, aiLoading);

  if (loadingWord) {
    return (
      <div className="min-h-screen bg-[#071320] flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00c3ff] border-t-transparent"></div>
      </div>
    );
  }

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
            Edit <span className="text-[#00c3ff]">"{formData.name}"</span>
          </h1>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-[15px] mb-8">
            {error}
          </div>
        )}

        {/* Dictionary Search (Keep it for easy updating) */}
        <div className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 p-6 md:p-8 rounded-[20px] mb-8">
          <h2 className="text-[1.2rem] font-bold mb-6 text-white flex items-center gap-3">
            <FaSearch className="text-[#00c3ff]" />
            Refine with Dictionary
          </h2>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search to update definitions..."
                className="flex-grow bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white focus:outline-none focus:border-[#00c3ff]"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="px-8 py-3 bg-[#00c3ff]/20 border border-[#00c3ff]/50 text-[#00c3ff] rounded-[15px] font-bold"
              >
                {aiLoading ? "..." : "Search"}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUseAiMode(!useAiMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAiMode ? 'bg-[#00c3ff]' : 'bg-[#a0a0a0]/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAiMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-xs font-bold text-[#a0a0a0]">AI Contextual Search</span>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-8 space-y-4">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectResult(res)}
                  className="cursor-pointer bg-[#071320] border border-[#00c3ff]/20 hover:border-[#00c3ff] p-5 rounded-[15px] transition-all"
                >
                  <h4 className="text-lg font-bold text-white">{res.name}</h4>
                  <p className="text-[#a0a0a0] mt-1 text-sm">{res.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Form */}
        <div id="details-section" className="bg-[#0e0c1d]/60 backdrop-blur-[10px] border border-[#00c3ff]/20 p-6 md:p-8 rounded-[20px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Word</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Word Types</label>
                <input
                  type="text"
                  value={formData.word_types}
                  onChange={(e) => setFormData({ ...formData, word_types: e.target.value })}
                  className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Verb', 'Noun', 'Adjective', 'Adverb', 'Phrasal Verb', 'Expression'].map(type => {
                    const isSelected = formData.word_types.split(',').map(t => t.trim().toLowerCase()).includes(type.toLowerCase());
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleWordType(type)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-[#00c3ff] border-[#00c3ff] text-[#071320] shadow-[0_0_10px_rgba(0,195,255,0.4)]' 
                            : 'bg-transparent border-[#00c3ff]/30 text-[#a0a0a0] hover:border-[#00c3ff] hover:text-[#00c3ff]'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#071320]/50 p-4 rounded-[15px]">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Past</label>
                <input type="text" value={formData.past} onChange={(e) => setFormData({ ...formData, past: e.target.value })} className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Gerund</label>
                <input type="text" value={formData.gerund} onChange={(e) => setFormData({ ...formData, gerund: e.target.value })} className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Participle</label>
                <input type="text" value={formData.participle} onChange={(e) => setFormData({ ...formData, participle: e.target.value })} className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-2 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Meaning</label>
              <textarea
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Examples (one per line)</label>
              <textarea
                value={formData.examples}
                onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Synonyms</label>
                <input type="text" value={formData.synonyms} onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })} className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-2">Antonyms</label>
                <input type="text" value={formData.antonyms} onChange={(e) => setFormData({ ...formData, antonyms: e.target.value })} className="w-full bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white" />
              </div>
            </div>

            <div className="bg-[#071320]/50 p-5 rounded-[20px] border border-[#00c3ff]/10">
              <label className="block text-xs font-bold text-[#00c3ff] uppercase tracking-widest mb-3 flex items-center gap-2">
                <FaImage /> Update Image
              </label>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={imageQuery}
                  onChange={(e) => setImageQuery(e.target.value)}
                  className="flex-grow bg-[#071320] border border-[#00c3ff]/30 rounded-[15px] px-4 py-3 text-white"
                />
                <button type="button" onClick={handleImageSearchSubmit} className="px-6 bg-[#00c3ff]/20 text-[#00c3ff] rounded-[15px] font-bold border border-[#00c3ff]/50">Search</button>
              </div>

              {imageResults.length > 0 && (
                <div className="grid grid-cols-4 gap-3 max-h-[200px] overflow-y-auto mb-4">
                  {imageResults.map((res, i) => (
                    <img key={i} src={res.link} onClick={() => setFormData({ ...formData, image: res.link })} className={`cursor-pointer rounded-lg border-2 ${formData.image === res.link ? 'border-[#00c3ff]' : 'border-transparent'}`} />
                  ))}
                </div>
              )}
              
              <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="Image URL" className="w-full bg-[#071320] border border-[#00c3ff]/20 rounded-[15px] px-4 py-2 text-sm" />
            </div>

            <div className="pt-6 border-t border-[#00c3ff]/20 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-gradient-to-r from-[#00c3ff] to-[#0080ff] text-black font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_30px_rgba(0,195,255,0.5)] transition-all flex items-center"
              >
                {saving ? "Saving..." : <><FaSave className="mr-2" /> Update Word</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
