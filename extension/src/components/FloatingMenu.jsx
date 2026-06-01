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
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { CONFIG } from "../config/constants";

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
  const { bind, isDragging } = useDraggable(
    window.innerHeight - 150,
    window.innerWidth - 80
  );

  const {
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
  } = useFloatingMenu({
    propSelectedObjects,
    propSetSelectedObjects,
    propUserLists,
    propSetUserLists,
    propInputValue,
    propSetInputValue,
    propSetGrammarData
  });

  const languages = CONFIG.SUPPORTED_LANGUAGES;

  return (
    <div {...bind} className={`floating-fab-container ${isDragging ? "dragging" : ""}`}>
      <button 
        className="fab-button" 
        onClick={() => handleToggle(isDragging)}
        style={{ background: '#000000', border: '2px solid #00c3ff', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }}
      >
        {isOpen ? <FaTimes style={{ color: '#00c3ff' }} /> : <div className="fab-logo" style={{ color: '#00c3ff', fontWeight: '900', fontSize: '32px', fontFamily: 'sans-serif' }}>L</div>}
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
                <span style={{ fontSize: "14.4px", fontWeight: "bold", color: "#ccc" }}>AI Mode:</span>
                <button
                  onClick={() => setUseAI(!useAI)}
                  style={{
                    background: useAI ? "#00c3ff" : "#444",
                    color: "#fff",
                    border: "none", borderRadius: "20px", padding: "5px 15px",
                    cursor: "pointer", fontWeight: "bold", fontSize: "12.8px",
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