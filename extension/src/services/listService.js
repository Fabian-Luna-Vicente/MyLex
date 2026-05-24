export const listService = {
    getLists: () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "GET_LISTS" }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error fetching lists");
                }
            });
        });
    },

    addWord: (payload) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "ADD_WORD", payload }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Error adding word");
                }
            });
        });
    }
};
