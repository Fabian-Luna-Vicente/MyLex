import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";
import { ListsContext } from "../Contexts/ListsContext";
import { useAiActions } from "./useAiActions";
import { listService } from "../services/listService";

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
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");

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
      context: contextParagraph,
      title: pageTitle,
      url: pageUrl
    });

    if (data) {
      setIsOpen(false);
      const wordWithContext = {
        ...data[0],
        originalContext: contextNode
      };
      setSelectedObjects([...SelectedObjects, wordWithContext]);
    }
  };

  const handleVoice = () => {
    if (!inputValue) return;
    const utterance = new SpeechSynthesisUtterance(inputValue);
    utterance.lang = sourceLang === "auto" ? "en-US" : sourceLang;
    window.speechSynthesis.speak(utterance);
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
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    handleToggle,
    handleGrammar,
    handleTranslate,
    handleDefinition,
    handleVoice,
    GetList
  };
};
