import { useState, useContext, useEffect } from "react";
import { useDraggable } from "../hooks/useDraggable";
import { FaTools, FaSearch, FaTimes, FaRobot } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { BsTranslate } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";
import { FaPuzzlePiece } from "react-icons/fa";

import { Context } from "../Contexts/Context";
import { DiccionaryContext } from "../Contexts/DiccionaryContext";
import { ListsContext } from "../Contexts/ListsContext";
import ElementCard from "./ElementCard";

import GrammarCard from "./GrammarCard";

const FloatingMenu = ({
  selectedObjects: propSelectedObjects,
  setSelectedObjects: propSetSelectedObjects,
  userLists: propUserLists,
  setUserLists: propSetUserLists,
  inputValue: propInputValue,
  setInputValue: propSetInputValue,
  setGrammarData: propSetGrammarData,
  addWordFunction
}) => {

  const [localInputValue, setLocalInputValue] = useState("");
  const inputValue = propInputValue !== undefined ? propInputValue : localInputValue;
  const setInputValue = propSetInputValue || setLocalInputValue;

  const contextData = useContext(Context);
  const dictContext = useContext(DiccionaryContext);
  const listContext = useContext(ListsContext);

  const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
  const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => { });

  const UserLists = propUserLists || listContext?.UserLists || [];
  const GetList = listContext?.GetList || (() => {
    chrome.runtime.sendMessage({ action: "GET_LISTS" }, (response) => {
      if (response && response.success) {
        if (propSetUserLists) propSetUserLists(response.data);
      }
    });
  });

  const { bind, isDragging } = useDraggable(
    window.innerHeight - 150,
    window.innerWidth - 80
  );

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [translation, setTranslation] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");

  const languages = [
    { code: "auto", name: "Detect" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
  ];

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

  const handleToggle = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      setTranslation("");
      setShowSettings(false);
      const currentSelection = window.getSelection().toString().trim();
      if (!isOpen && currentSelection) setInputValue(currentSelection);
    }
  };

  const handleGrammar = () => {
    if (!inputValue) return;

    if (inputValue.trim().split(/\s+/).length < 2) {
      setTranslation("Select a full phrase for grammar analysis.");
      return;
    }

    setTranslation("Analyzing...");

    const langToExplain = targetLang === "auto" ? "en" : targetLang;

    chrome.runtime.sendMessage({
      action: "ANALYZE_GRAMMAR",
      payload: {
        text: inputValue,
        language: langToExplain
      }
    }, (response) => {
      if (response && response.success) {
        setIsOpen(false);
        if (propSetGrammarData) {
          propSetGrammarData(response.data);
        }
        setTranslation("");
      } else {
        setTranslation("Error or not logged in.");
      }
    });
  };

  const handleTranslate = () => {
    if (!inputValue) return;
    setTranslation("Translating...");

    chrome.runtime.sendMessage({
      action: "TRANSLATE_TEXT",
      payload: {
        text: inputValue,
        source: sourceLang,
        target: targetLang
      }
    }, (response) => {
      if (response && response.success) {
        setTranslation(response.data.translation);
      } else {
        setTranslation("Error or not logged in.");
      }
    });
  };

  const handleDefinition = () => {
    if (!inputValue) return;
    setTranslation("Searching...");

    const selection = window.getSelection();
    const contextParagraph = selection.anchorNode?.parentElement?.innerText || "";
    const contextNode = selection.anchorNode?.nodeType === 3
      ? selection.anchorNode.textContent
      : selection.anchorNode?.parentElement?.innerText || "";

    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const TlangForDict = targetLang === "auto" ? "en" : targetLang;

    chrome.runtime.sendMessage({
      action: "PROCESS_DICTIONARY",
      payload: {
        word: inputValue,
        language: sourceLang,
        t_lang: TlangForDict,
        use_ai: useAI,
        context: contextParagraph,
        title: pageTitle,
        url: pageUrl
      }
    }, (response) => {
      if (response && response.success && Array.isArray(response.data)) {
        const result = response.data;
        if (result.length > 0 && !result[0].error) {
          setIsOpen(false);
          setTranslation("");
          const wordWithContext = {
            ...result[0],
            originalContext: contextNode
          };
          setSelectedObjects([...SelectedObjects, wordWithContext]);
        } else {
          setTranslation(result[0]?.meaning || "Definition not found.");
        }
      } else {
        setTranslation("Error or not logged in.");
      }
    });
  };

  const handleVoice = () => {
    if (!inputValue) return;
    const utterance = new SpeechSynthesisUtterance(inputValue);
    utterance.lang = sourceLang === "auto" ? "en-US" : sourceLang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div {...bind} className="floating-fab-container">
      <button className="fab-button" onClick={handleToggle}>
        {isOpen ? <FaTimes /> : <div className="fab-logo">M</div>}
      </button>

      {isOpen && (
        <div className="fab-menu">
          <div className="fab-header">
            <span className="fab-title">My<span>Lex</span></span>
            <button className="fab-settings-btn" onClick={() => setShowSettings(!showSettings)}>
              <IoSettingsSharp />
            </button>
          </div>

          {showSettings && (
            <div className="fab-settings-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#ccc" }}>AI Mode:</span>
                <button
                  onClick={() => setUseAI(!useAI)}
                  style={{
                    background: useAI ? "#00c3ff" : "#444",
                    color: "#fff",
                    border: "none", borderRadius: "20px", padding: "5px 15px",
                    cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem",
                    transition: "0.3s", display: "flex", alignItems: "center", gap: "5px",
                  }}
                >
                  <FaRobot /> {useAI ? "ON" : "OFF"}
                </button>
              </div>

              <div className="fab-language-row">
                <div className="fab-lang-column">
                  <label className="fab-lang-label">From:</label>
                  <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="fab-lang-select">
                    {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
                  </select>
                </div>
                <div className="fab-lang-arrow">➜</div>
                <div className="fab-lang-column">
                  <label className="fab-lang-label">To:</label>
                  <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="fab-lang-select">
                    {languages.filter((l) => l.code !== "auto").map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type or select..."
            className="fab-input"
          />

          <div className="fab-actions-row">
            <button onClick={handleTranslate} className="fab-action-btn" title="Translate"><BsTranslate /></button>
            <button onClick={handleDefinition} className="fab-action-btn" title="Add to MyLex"><FaSearch /></button>
            <button onClick={handleGrammar} className="fab-action-btn" title="Grammar Analysis"><FaPuzzlePiece /></button>
            <button onClick={handleVoice} className="fab-action-btn" title="Listen"><CiPlay1 /></button>
          </div>

          {translation && <div className="fab-result">{translation}</div>}
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;