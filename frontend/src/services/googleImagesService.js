
import api from './api';

export const googleImagesService = {
    search: async (imageQuery, startIndex) => {
        try {
            const response = await api.get('/api/images/search', {
                params: {
                    q: imageQuery,
                    start: startIndex
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching images from backend:", error);
            throw error;
        }
    }
};