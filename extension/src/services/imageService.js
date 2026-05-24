export const imageService = {
    searchImages: (query, start = 1) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: "SEARCH_IMAGES",
                payload: { query, start }
            }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error searching images");
                }
            });
        });
    }
};
