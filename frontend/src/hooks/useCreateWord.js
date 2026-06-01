import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { googleImagesService } from '../services/googleImagesService';

export const useCreateWord = (lists, addWord, fetchLists, searchDictionary, aiLoading) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultListId = searchParams.get('listId') || 0;
    // --- Estados del Buscador de Diccionario ---
    const [searchWord, setSearchWord] = useState('');
    const [useAiMode, setUseAiMode] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- Estados del Buscador de Imágenes (NUEVO) ---
    const [imageQuery, setImageQuery] = useState('');
    const [imageResults, setImageResults] = useState([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [imagePage, setImagePage] = useState(1); // Para paginación (parámetro 'start')

    // --- Estado del Formulario Principal ---
    const [formData, setFormData] = useState({
        name: '',
        meaning: [],
        past: '',
        gerund: '',
        participle: '',
        word_types: '',
        examples: '',
        synonyms: '',
        antonyms: '',
        image: '',
        list_ids: defaultListId ? [parseInt(defaultListId)] : []
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (lists.length === 0) fetchLists();
    }, [fetchLists, lists.length]);

    useEffect(() => {
        if (formData.name && imageQuery === '') {
            setImageQuery(formData.name);
        }
    }, [formData.name]);

    // --- Handlers de Diccionario ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchWord.trim()) return;
        setError('');
        try {
            const results = await searchDictionary({
                word: searchWord,
                language: 'en',
                t_lang: 'en', // Cambiado a 'en' para definiciones en el mismo idioma
                use_ai: useAiMode,
                context: aiContext
            });
            if (results[0]?.error) {
                setError(results[0].meaning || results[0].message);
                setSearchResults([]);
            } else {
                if (results.length > 0) {
                    handleSelectResult(results[0]);
                    setSearchResults([]);
                } else {
                    setSearchResults(results);
                }
            }
        } catch (err) {
            setError("Failed to fetch definitions.");
        }
    };

    const toggleWordType = (type) => {
        setFormData(prev => {
            const types = prev.word_types.split(',').map(t => t.trim()).filter(t => t);
            if (types.includes(type.toLowerCase())) {
                return { ...prev, word_types: types.filter(t => t !== type.toLowerCase()).join(', ') };
            } else {
                return { ...prev, word_types: [...types, type.toLowerCase()].join(', ') };
            }
        });
    };

    const handleSelectResult = (result) => {
        // Separamos los significados devueltos por la IA por salto de línea
        const meaningsArray = result.meaning
            ? result.meaning.split('\n').map(m => m.trim()).filter(m => m)
            : [];

        setFormData({
            ...formData,
            name: result.name || '',
            meaning: meaningsArray, // <-- Guardamos como Array
            word_types: result.type ? result.type.join(', ') : '',
            examples: result.examples ? result.examples.join('\n') : '',
            synonyms: result.synonyms ? result.synonyms.join(', ') : '',
            antonyms: result.antonyms ? result.antonyms.join(', ') : '',
            past: result.past || '',
            gerund: result.gerund || '',
            participle: result.participle || '',
            image: ''
        });
        setImageQuery(result.name || '');
        setImageResults([]);
        setImagePage(1);
        document.getElementById('details-section').scrollIntoView({ behavior: 'smooth' });
    };
    // --- Handlers del Buscador de Imágenes (Google Custom Search API) ---
    const searchGoogleImages = async (isLoadMore = false) => {
        if (!imageQuery.trim()) return;

        setIsSearchingImages(true);
        // Calcular el 'start' index para la paginación (1, 11, 21...)
        const startIndex = isLoadMore ? ((imagePage - 1) * 10) + 1 : 1;
        try {
            const data = await googleImagesService.search(imageQuery, startIndex);

            if (data.items) {
                if (isLoadMore) {
                    setImageResults(prev => [...prev, ...data.items]);
                } else {
                    setImageResults(data.items);
                }
            } else if (!isLoadMore) {
                setImageResults([]);
            }
        } catch (error) {
            console.error('Error al buscar imágenes', error);
        } finally {
            setIsSearchingImages(false);
        }

    };

    const handleImageSearchSubmit = (e) => {
        e.preventDefault();
        setImagePage(1);
        searchGoogleImages(false);
    };

    const handleLoadMoreImages = () => {
        setImagePage(prev => prev + 1);
    };

    useEffect(() => {
        if (imagePage > 1) {
            searchGoogleImages(true);
        }
    }, [imagePage]);


    // --- Helper para Selección de Listas ---
    const toggleListSelection = (listId) => {
        setFormData(prev => {
            const idStr = parseInt(listId);
            const isSelected = prev.list_ids.includes(idStr);
            return {
                ...prev,
                list_ids: isSelected
                    ? prev.list_ids.filter(id => id !== idStr)
                    : [...prev.list_ids, idStr]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError("Word name is required");
            return;
        }
        setSaving(true);
        setError('');
        const payload = {
            ...formData,
            // Convertimos el array de significados de vuelta a un string separado por saltos de línea para la BD
            meaning: Array.isArray(formData.meaning) ? formData.meaning.join('\n') : formData.meaning,
            word_types: formData.word_types.split(',').map(t => t.trim()).filter(t => t),
            examples: formData.examples.split('\n').map(e => e.trim()).filter(e => e)
        };
        try {
            await addWord(payload);
            navigate('/lists');
        } catch (err) {
            setError("Failed to save the word.");
        } finally {
            setSaving(false);
        }
    };

    return {
        searchWord, setSearchWord,
        useAiMode, setUseAiMode,
        searchResults,
        aiContext, setAiContext,
        imageQuery, setImageQuery,
        imageResults, setImageResults,
        isSearchingImages, setIsSearchingImages,
        imagePage, setImagePage,
        formData, setFormData,
        saving, setSaving,
        error, setError,
        handleSearch,
        handleSelectResult,
        searchGoogleImages, handleImageSearchSubmit, handleLoadMoreImages,
        toggleListSelection, handleSubmit, toggleWordType
    };
}
