import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";
import { ListsContext } from "../Contexts/ListsContext"; 
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack, IoMdAdd, IoMdClose } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa";
import AddWordToList from "./AddWordToList";
import ImageSearch from './ImageSearch';

function ElementCard({ 
    CurrentListId, 
    selectedObjects: propSelectedObjects, 
    setSelectedObjects: propSetSelectedObjects,
    userLists: propUserLists,
    addWordFunction
}) {
  
  const contextData = useContext(Context);
  const listContext = useContext(ListsContext); 

  const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
  const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => {});
  const UserLists = propUserLists || listContext?.UserLists || [];

  const [AddWordB, setAddWordB] = useState(false);
  const [Index, setIndex] = useState(0);

  useEffect(() => {
    if(SelectedObjects.length > 0) {
        setIndex(SelectedObjects.length - 1);
    }
  }, [SelectedObjects.length]); 

  const handleClose = () => setSelectedObjects([]);
  const handleNext = () => setIndex((prev) => (prev < SelectedObjects.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setIndex((prev) => (prev > 0 ? prev - 1 : SelectedObjects.length - 1));

  const currentWord = SelectedObjects[Index] || {};
  if (!currentWord || !currentWord.name) return null;

  const isPhrasal = currentWord.mode == 2;
  const safeString = (val) => (typeof val === 'string' ? val : "");
  const safeArray = (val) => (Array.isArray(val) ? val : []);

  const PostData = () => {
    return {
      name: currentWord.name,
      past: currentWord.past,
      gerund: currentWord.gerund,
      participle: currentWord.participle,
      meaning: currentWord.meaning,
      examples: Array.isArray(currentWord.example) ? currentWord.example : [],
      word_types: isPhrasal ? ["Phrasal Verb"] : (Array.isArray(currentWord.type) ? currentWord.type : []),
      synonyms: Array.isArray(currentWord.synonyms) ? currentWord.synonyms.join(",") : safeString(currentWord.synonyms),
      antonyms: Array.isArray(currentWord.antonyms) ? currentWord.antonyms.join(",") : safeString(currentWord.antonyms),
      image: currentWord.image 
    };
  };

  const imageList = safeString(currentWord.image) ? currentWord.image.split(";") : [];
  const meaningList = safeString(currentWord.meaning) ? currentWord.meaning.split("\n") : [];
  
  const renderListOrString = (val) => {
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === 'object') return JSON.stringify(val); 
      return val;
  };

  return (
    <div className="ElementCardOverlay">
      {/* ElementCardContainer debe tener position: relative en CSS (ya lo tiene por defecto o agrégaselo) */}
      <div className="ElementCardContainer" style={{ position: 'relative' }}>
        
        <div className="EC-Header">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <button className="EC-CloseBtn" onClick={handleClose}><IoMdClose /></button>
                 <h3 className="EC-Title">{currentWord.name}</h3>
            </div>
             <span style={{fontSize:'0.8rem', color:'#aaa'}}>
                {Index + 1} / {SelectedObjects.length}
             </span>
        </div>

        <div className="EC-Content">
            <div className="EC-Type">
                {isPhrasal ? "Phrasal Verb" : renderListOrString(currentWord.type) || "Word"}
            </div>

            {!currentWord.image && (
                <ImageSearch 
                    word={currentWord.name} 
                    dataWord={SelectedObjects} 
                    setDataWord={setSelectedObjects} 
                    index={Index} 
                />
            )}

            <div className="EC-MediaSection">
                {imageList.length > 0 && (
                    <div className="EC-Images">
                        {imageList.map((imgSrc, i) => (
                            <img key={i} src={imgSrc} alt="visual" onError={(e) => e.target.style.display='none'} />
                        ))}
                    </div>
                )}

                {meaningList.length > 0 && (
                    <div className="EC-Meaning">
                        <h4><FaBookOpen style={{marginRight:'5px'}}/> Meaning</h4>
                        {currentWord.originalContext && (
                            <div className="EC-ContextBox" style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                padding: '8px',
                                borderRadius: '6px',
                                marginBottom: '10px',
                                borderLeft: '3px solid #00c3ff'
                            }}>
                                <h5 style={{margin: '0 0 5px 0', color: '#00c3ff', fontSize:'0.85rem'}}>Original Context:</h5>
                                <p style={{margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#ddd'}}>"{currentWord.originalContext}"</p>
                            </div>
                        )}
                        {meaningList.map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                )}
            </div>

            <div className="EC-SynAnt">
                {currentWord.synonyms && <div className="EC-TagBox Syn"><strong>Synonyms:</strong> {renderListOrString(currentWord.synonyms)}</div>}
                {currentWord.antonyms && <div className="EC-TagBox Ant"><strong>Antonyms:</strong> {renderListOrString(currentWord.antonyms)}</div>}
            </div>

            {(currentWord.past || currentWord.participle || currentWord.gerund) && (
                <div className="EC-TableContainer">
                    <table className="EC-Table">
                        <thead>
                            <tr>
                                {currentWord.past && <th>Past</th>}
                                {currentWord.participle && <th>Participle</th>}
                                {currentWord.gerund && <th>Gerund</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {currentWord.past && <td>{currentWord.past}</td>}
                                {currentWord.participle && <td>{currentWord.participle}</td>}
                                {currentWord.gerund && <td>{currentWord.gerund}</td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {safeArray(currentWord.example).length > 0 && (
                <div className="EC-Examples">
                    <h4>Examples:</h4>
                    <ul>
                        {currentWord.example.map((ex, i) => (
                            <li key={i}><MdOutlineRadioButtonChecked /> {typeof ex === 'string' ? ex : JSON.stringify(ex)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* MENÚ DE AGREGAR (Ahora dentro del contenedor y posicionado absolutamente) */}
        {AddWordB && (
            <div className="EC-ListPopupPositioner">
                <AddWordToList 
                    ExtraFunction={() => setAddWordB(false)} 
                    data={PostData()} 
                    CurrentListId={CurrentListId} 
                    userLists={UserLists}
                    addWordFunction={addWordFunction}
                />
            </div>
        )}

        {SelectedObjects.length > 1 && (
            <div className="EC-WordNav">
                {SelectedObjects.map((obj, i) => (
                    <button key={i} className={`EC-WordNavItem ${Index === i ? 'active' : ''}`} onClick={() => setIndex(i)} title={obj.name}>
                        {obj.name}
                    </button>
                ))}
            </div>
        )}

        <div className="EC-Footer">
            {SelectedObjects.length > 1 && <button className="EC-NavBtn" style={{ left: '15px' }} onClick={handlePrev}><IoIosArrowBack /></button>}
            
            {!currentWord.error && (
                <button className="EC-AddBtn" onClick={() => setAddWordB(!AddWordB)}>
                    {AddWordB ? <IoMdClose /> : <IoMdAdd />}
                </button>
            )}

            {SelectedObjects.length > 1 && <button className="EC-NavBtn" style={{ right: '15px' }} onClick={handleNext}><IoIosArrowForward /></button>}
        </div>
         
      </div>
    </div>
  );
}

export default ElementCard;