import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";
import { ListsContext } from "../Contexts/ListsContext";
import { useAiActions } from "./useAiActions";
import { listService } from "../services/listService";
import { getSpeechCode } from "../config/constants";

export const useFloatingMenu = ({
  propSelectedObjects,
  propSetSelectedObjects,
  propUserLists,
  propSetUserLists,
  propInputValue,
  propSetInputValue,
  propSetGrammarData
}) => {
  const [localInputValue, setLocalInputValue] = useState("");
  const inputValue = propInputValue !== undefined ? propInputValue : localInputValue;
  const setInputValue = propSetInputValue || setLocalInputValue;

  const contextData = useContext(Context);
  const listContext = useContext(ListsContext);

  const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
  const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => { });

  const UserLists = propUserLists || listContext?.UserLists || [];
  
  const GetList = listContext?.GetList || (async () => {
    try {
      const data = await listService.getLists();
      if (propSetUserLists) propSetUserLists(data);
    } catch (err) {
      console.error("Error fetching lists", err);
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { translation, setTranslation, analyzeGrammar, translateText, processDictionary } = useAiActions();
  const [useAI, setUseAI] = useState(true);
  const [useAIContext, setUseAIContext] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [audioLang, setAudioLang] = useState("en");

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['audioLang', 'useAIContext'], (result) => {
        if (result.audioLang) {
          setAudioLang(result.audioLang);
        }
        if (result.useAIContext !== undefined) {
          setUseAIContext(result.useAIContext);
        }
      });
    }
  }, []);

  const handleAudioLangChange = (newLang) => {
    setAudioLang(newLang);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ audioLang: newLang });
    }
  };

  const handleUseAIContextChange = (newVal) => {
    setUseAIContext(newVal);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ useAIContext: newVal });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const shadowRoot = document.getElementById('drillexa-extension-root')?.shadowRoot;
      let text = shadowRoot?.getSelection()?.toString().trim();

      if (!text) {
        text = window.getSelection()?.toString().trim();
      }

      if (text && text.length > 0 && !isOpen) {
        setInputValue(text);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [isOpen]);

  const handleToggle = (isDragging) => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      setTranslation("");
      setShowSettings(false);
      const currentSelection = window.getSelection().toString().trim();
      if (!isOpen && currentSelection) setInputValue(currentSelection);
    }
  };

  const handleGrammar = async () => {
    const langToExplain = targetLang === "auto" ? "en" : targetLang;
    const data = await analyzeGrammar(inputValue, langToExplain);
    
    if (data) {
      setIsOpen(false);
      if (propSetGrammarData) {
        propSetGrammarData(data);
      }
    }
  };

  const handleTranslate = async () => {
    await translateText(inputValue, sourceLang, targetLang);
  };

  const handleDefinition = async () => {
    if (!inputValue) return;

    const selection = window.getSelection();
    const contextParagraph = selection.anchorNode?.parentElement?.innerText || "";
    const contextNode = selection.anchorNode?.nodeType === 3
      ? selection.anchorNode.textContent
      : selection.anchorNode?.parentElement?.innerText || "";

    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const TlangForDict = targetLang === "auto" ? "en" : targetLang;

    const data = await processDictionary({
      word: inputValue,
      language: sourceLang,
      t_lang: TlangForDict,
      use_ai: useAI,
      context: useAIContext ? contextParagraph : "",
      title: pageTitle,
      url: pageUrl
    });

    if (data) {
      setIsOpen(false);
      const wordWithContext = {
        ...data[0],
        originalContext: contextNode,
        language: data[0].language || (sourceLang !== "auto" ? sourceLang : null)
      };
      setSelectedObjects([...SelectedObjects, wordWithContext]);
    }
  };

  const handleVoice = () => {
    if (!inputValue) return;
    const utterance = new SpeechSynthesisUtterance(inputValue);
    const code = getSpeechCode(audioLang === "auto" ? "en" : audioLang);
    utterance.lang = code;

    console.log(`[TTS Debug] Attempting to speak in language code: ${code} (audioLang: ${audioLang})`);

    const voices = window.speechSynthesis.getVoices();
    console.log(`[TTS Debug] Total voices available: ${voices.length}`);
    
    if (voices.length > 0) {
        const matchingVoices = voices.filter(v => v.lang === code || v.lang.replace('_', '-') === code || v.lang.startsWith(code.split('-')[0]));
        console.log(`[TTS Debug] Matching voices for ${code}:`, matchingVoices.map(v => `${v.name} (${v.lang})`));

        if (matchingVoices.length > 0) {
            let voice = matchingVoices.find(v => v.name.includes("Google"));
            if (!voice) voice = matchingVoices[0];
            
            console.log(`[TTS Debug] Selected Voice: ${voice.name} (${voice.lang})`);
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
            return;
        }
    }

    console.warn(`[TTS Debug] No matching voices found for ${code}. Using Google TTS fallback.`);
    const fallbackLang = audioLang === "auto" ? "en" : audioLang;
    const fallbackCode = fallbackLang.split('-')[0];

    if (fallbackCode === 'en' || fallbackCode === 'es') {
        window.speechSynthesis.speak(utterance);
        return;
    }

    const url = `${CONFIG.API_BASE_URL}/api/vocabulary/tts?lang=${fallbackCode}&text=${encodeURIComponent(inputValue)}`;
    const audio = new Audio(url);
    audio.play().catch(e => {
        console.error("[TTS Debug] Fallback audio failed:", e);
        window.speechSynthesis.speak(utterance); // absolute last resort
    });
  };

  return {
    inputValue,
    setInputValue,
    isOpen,
    showSettings,
    setShowSettings,
    translation,
    useAI,
    setUseAI,
    useAIContext,
    handleUseAIContextChange,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    audioLang,
    handleAudioLangChange,
    handleToggle,
    handleGrammar,
    handleTranslate,
    handleDefinition,
    handleVoice,
    GetList
  };
};
