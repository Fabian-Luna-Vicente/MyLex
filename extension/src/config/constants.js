// config/constants.js

export const CONFIG = {
    // API URL for the backend
    API_BASE_URL: "http://localhost:8000",
    
    // URL for the web dashboard
    DASHBOARD_URL: "http://localhost:5173/dashboard",

    // Supported languages for translation and grammar analysis
    SUPPORTED_LANGUAGES: [
        { code: "auto", name: "Detect" },
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
    ]
};

export const getSpeechCode = (langCode) => {
    const map = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-BR'
    };
    return map[langCode] || 'en-US';
};
