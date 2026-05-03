
export const googleImagesService = {
    search: async (imageQuery, startIndex) => {

        const apiKey = import.meta.env.VITE_Google_Image_Api_Key;
        const searchEngineId = import.meta.env.VITE_searchEngineId;

        const queryParam = `${imageQuery}`;
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&lr=lang_en&q=${encodeURIComponent(queryParam)}&searchType=image&start=${startIndex}`
        );

        const data = await response.json();
        return data;
    }
}