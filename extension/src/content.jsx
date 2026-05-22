import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 1. IMPORTAMOS TUS ARCHIVOS CSS EXISTENTES (con la magia de ?inline)
import translateStyles from './styles/translate.css?inline';
import lyricsStyles from './styles/LyricsAndWords.css?inline';
import imageSearchStyles from './styles/ImageSearch.css?inline';

// Importa tus componentes (asegúrate de que las rutas sean correctas)
import FloatingMenu from './components/FloatingMenu';
import GrammarCard from './components/GrammarCard';
import AddWordToList from './components/AddWordToList';
import ElementCard from './components/ElementCard';

// --- COMPONENTE PRINCIPAL DE LA EXTENSIÓN ---
function ContentApp() {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'grammar' | 'addWord' | null

  // Estados globales de la extensión
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [grammarData, setGrammarData] = useState(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_LISTS" }, (response) => {
      if (response && response.success) {
        setUserLists(response.data);
      }
    });

    const handleMouseUp = (e) => {
      const path = e.composedPath();
      const isInsideFloatingMenu = path.some(el => el.classList && el.classList.contains('floating-fab-container'));
      if (isInsideFloatingMenu) return;

      const shadowRoot = document.getElementById('mylex-extension-root')?.shadowRoot;
      let text = shadowRoot?.getSelection()?.toString().trim();

      if (!text) {
        text = window.getSelection()?.toString().trim();
      }

      if (text) {
        setSelectedText(text);
        setShowMenu(true);
      } else {
        setShowMenu(false);
      }
    };

    const handleMessage = (request, sender, sendResponse) => {
      if (request.action === "OPEN_ADD_WORD_MODAL") {
        setSelectedText(request.text);
        setActiveModal('addWord');
        setShowMenu(false);
      }
      if (request.action === "OPEN_GRAMMAR_CARD") {
        setSelectedText(request.text);
        setActiveModal('grammar');
        setShowMenu(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [selectedObjects.length, grammarData, activeModal]);

  return (
    <div className="drillexa-wrapper text-base font-sans">
      {/* Menú Flotante (Selector de texto) */}
      {showMenu && !activeModal && !grammarData && (
        <FloatingMenu
          position={menuPosition}
          inputValue={selectedText}
          setInputValue={setSelectedText}
          selectedObjects={selectedObjects}
          setSelectedObjects={setSelectedObjects}
          userLists={userLists}
          setUserLists={setUserLists}
          setGrammarData={setGrammarData}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* Tarjeta de Gramática (IA) */}
      {grammarData && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 214748365, width: "100vw", height: "100vh" }}>
          <GrammarCard
            grammarData={grammarData}
            onClose={() => setGrammarData(null)}
          />
        </div>
      )}

      {/* Tarjeta de Vocabulario (Diccionario) */}
      {selectedObjects.length > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 214748364, width: "100vw", height: "100vh" }}>
          <ElementCard
            CurrentListId={"none"}
            selectedObjects={selectedObjects}
            setSelectedObjects={setSelectedObjects}
            userLists={userLists}
          />
        </div>
      )}

      {/* Modales disparados desde menú contextual */}
      {activeModal === 'grammar' && (
        <GrammarCard
          text={selectedText}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'addWord' && (
        <AddWordToList
          word={selectedText}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

// --- LÓGICA DE INYECCIÓN Y SHADOW DOM ---
function init() {
  if (document.getElementById('drillexa-extension-root')) return;

  const appContainer = document.createElement('div');
  appContainer.id = 'drillexa-extension-root';
  appContainer.style.position = 'absolute';
  appContainer.style.top = '0';
  appContainer.style.left = '0';
  appContainer.style.zIndex = '2147483647';

  document.body.appendChild(appContainer);

  // Crear el Shadow DOM para aislar tus estilos de la web host
  const shadowRoot = appContainer.attachShadow({ mode: 'open' });

  // 2. INYECTAR TUS HOJAS DE ESTILO EN EL SHADOW DOM
  const stylesToInject = [translateStyles, lyricsStyles, imageSearchStyles];

  stylesToInject.forEach(cssText => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cssText;
    shadowRoot.appendChild(styleSheet);
  });

  const reactRoot = document.createElement('div');
  shadowRoot.appendChild(reactRoot);

  const root = createRoot(reactRoot);
  root.render(<ContentApp />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}