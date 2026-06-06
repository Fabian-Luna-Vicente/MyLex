import api from './api/extensionClient';
import { backgroundAiService, backgroundVocabularyService } from './api/backgroundServices';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-to-mylex",
        title: "Add '%s' to MyLex",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "analyze-grammar-mylex",
        title: "Analyze grammar in MyLex",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "add-to-mylex" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            action: "OPEN_ADD_WORD_MODAL",
            text: info.selectionText
        });
    }

    if (info.menuItemId === "analyze-grammar-mylex" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            action: "OPEN_GRAMMAR_CARD",
            text: info.selectionText
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "PROCESS_DICTIONARY") {
        backgroundAiService.searchDictionary(request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "ANALYZE_GRAMMAR") {
        backgroundAiService.analyzeGrammar(request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "TRANSLATE_TEXT") {
        backgroundAiService.translateText(request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "GET_LISTS") {
        backgroundVocabularyService.getLists()
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "ADD_WORD") {
        backgroundVocabularyService.addWord(request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "SET_TOKEN") {
        chrome.storage.local.set({ access_token: request.token }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    if (request.action === "SEARCH_IMAGES") {
        api.get(`/api/images/search?q=${encodeURIComponent(request.payload.query)}&start=${request.payload.start}`)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});
