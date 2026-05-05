import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleImagesService } from '../services/googleImagesService';

export const useEditWord = (id, lists, updateWord, fetchLists, fetchWordDetails, searchDictionary, aiLoading) => {
    const navigate = useNavigate();

    const [searchWord, setSearchWord] = useState('');
    const [useAiMode, setUseAiMode] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [imageQuery, setImageQuery] = useState('');
    const [imageResults, setImageResults] = useState([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [imagePage, setImagePage] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        meaning: '',
        past: '',
        gerund: '',
        participle: '',
        word_types: '',
        examples: '',
        synonyms: '',
        antonyms: '',
        image: '',
        list_ids: []
    });

    const [loadingWord, setLoadingWord] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoadingWord(true);
            try {
                if (lists.length === 0) await fetchLists();
                const word = await fetchWordDetails(id);
                setFormData({
                    name: word.name || '',
                    meaning: word.meaning || '',
                    past: word.past || '',
                    gerund: word.gerund || '',
                    participle: word.participle || '',
                    word_types: word.word_types ? word.word_types.join(', ') : '',
                    examples: word.examples ? word.examples.join('\n') : '',
                    synonyms: word.synonyms || '',
                    antonyms: word.antonyms || '',
                    image: word.image || '',
                    list_ids: word.lists ? word.lists.map(l => l.id) : []
                });
                setImageQuery(word.name || '');
            } catch (err) {
                setError("Failed to load word details.");
            } finally {
                setLoadingWord(false);
            }
        };
        load();
    }, [id]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchWord.trim()) return;
        setError('');
        try {
            const results = await searchDictionary({
                word: searchWord,
                language: 'en',
                t_lang: 'es',
                use_ai: useAiMode,
                context: aiContext
            });
            setSearchResults(results);
        } catch (err) {
            setError("Failed to fetch definitions.");
        }
    };

    const handleSelectResult = (result) => {
        setFormData({
            ...formData,
            meaning: result.meaning || formData.meaning,
            word_types: result.type ? result.type.join(', ') : formData.word_types,
            examples: result.examples ? result.examples.join('\n') : formData.examples,
            synonyms: result.synonyms ? result.synonyms.join(', ') : formData.synonyms,
            antonyms: result.antonyms ? result.antonyms.join(', ') : formData.antonyms,
        });
        document.getElementById('details-section').scrollIntoView({ behavior: 'smooth' });
    };

    const handleImageSearchSubmit = async (e) => {
        e.preventDefault();
        setIsSearchingImages(true);
        try {
            const data = await googleImagesService.search(imageQuery, 1);
            setImageResults(data.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearchingImages(false);
        }
    };

    const toggleListSelection = (listId) => {
        setFormData(prev => {
            const isSelected = prev.list_ids.includes(listId);
            return {
                ...prev,
                list_ids: isSelected ? prev.list_ids.filter(i => i !== listId) : [...prev.list_ids, listId]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            ...formData,
            word_types: formData.word_types.split(',').map(t => t.trim()).filter(t => t),
            examples: formData.examples.split('\n').map(e => e.trim()).filter(e => e)
        };
        try {
            await updateWord(id, payload);
            navigate(-1);
        } catch (err) {
            setError("Failed to update the word.");
        } finally {
            setSaving(false);
        }
    };

    return {
        searchWord, setSearchWord, useAiMode, setUseAiMode, searchResults, aiContext,
        setAiContext, handleSubmit, handleSelectResult, handleSearch, toggleListSelection,
        error, formData, setFormData, imageQuery, setImageQuery, imageResults,
        isSearchingImages, imagePage, setImagePage, handleImageSearchSubmit,
        saving, loadingWord
    };
};
