import { useState } from 'react';
import { imageService } from '../services/imageService';

export const useImageSearch = () => {
    const [imageResults, setImageResults] = useState([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [error, setError] = useState(null);

    const searchImages = async (query) => {
        if (!query || !query.trim()) return;
        
        setIsSearchingImages(true);
        setError(null);
        
        try {
            const data = await imageService.searchImages(query, 1);
            setImageResults(data.items || []);
            return data.items || [];
        } catch (err) {
            console.error("Error buscando imágenes:", err);
            setError(err);
            setImageResults([]);
            return [];
        } finally {
            setIsSearchingImages(false);
        }
    };

    const clearResults = () => {
        setImageResults([]);
    };

    return {
        imageResults,
        isSearchingImages,
        error,
        searchImages,
        clearResults
    };
};
