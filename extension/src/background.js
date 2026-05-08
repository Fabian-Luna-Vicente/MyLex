// src/background.js
import api from './api/extensionClient';

// 1. Crear opciones en el menú contextual (clic derecho)
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

// 2. Escuchar clics en el menú contextual
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

// 3. Escuchar peticiones desde el Content Script (o Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "PROCESS_DICTIONARY") {
        api.post('/api/ai/dictionary/search', request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "ANALYZE_GRAMMAR") {
        api.post('/api/ai/grammar/analyze', request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === "TRANSLATE_TEXT") {
        api.post('/api/ai/translate', request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    // Obtener las listas del usuario
    if (request.action === "GET_LISTS") {
        api.get('/api/lists')
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    // Añadir una nueva palabra
    if (request.action === "ADD_WORD") {
        api.post('/api/words', request.payload)
            .then(response => sendResponse({ success: true, data: response.data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    // Guardar token desde la web o popup
    if (request.action === "SET_TOKEN") {
        chrome.storage.local.set({ access_token: request.token }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});