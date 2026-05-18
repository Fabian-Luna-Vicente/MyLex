import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";
import { ListsContext } from "../Contexts/ListsContext";
import { IoIosArrowForward, IoIosArrowBack, IoMdAdd } from "react-icons/io";
import { BsXLg } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";
import { FaImage, FaSearch } from "react-icons/fa";
import AddWordToList from "./AddWordToList";

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
    const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => { });
    const UserLists = propUserLists || listContext?.UserLists || [];

    const [AddWordB, setAddWordB] = useState(false);
    const [Index, setIndex] = useState(0);

    const [imageQuery, setImageQuery] = useState("");
    const [imageResults, setImageResults] = useState([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (SelectedObjects.length > 0) {
            const newIndex = SelectedObjects.length - 1;
            setIndex(newIndex);
            setImageQuery(SelectedObjects[newIndex]?.name || "");
            setShowSearch(false);
        }
    }, [SelectedObjects.length]);

    useEffect(() => {
        setImageQuery(SelectedObjects[Index]?.name || "");
        setImageResults([]);
        setShowSearch(false);
    }, [Index, SelectedObjects]);

    const handleClose = () => setSelectedObjects([]);
    const handleNext = () => setIndex((prev) => (prev < SelectedObjects.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setIndex((prev) => (prev > 0 ? prev - 1 : SelectedObjects.length - 1));

    const closeTab = (e, i) => {
        e.stopPropagation();
        const newObjs = [...SelectedObjects];
        newObjs.splice(i, 1);

        if (newObjs.length === 0) {
            setSelectedObjects([]);
        } else {
            setSelectedObjects(newObjs);
            if (Index === i) {
                setIndex(Math.max(0, i - 1));
            } else if (Index > i) {
                setIndex(Index - 1);
            }
        }
    };

    const currentWord = SelectedObjects[Index] || {};
    if (!currentWord || !currentWord.name) return null;

    const handleImageSearch = (e) => {
        e?.preventDefault();
        if (!imageQuery.trim()) return;
        setIsSearchingImages(true);

        chrome.runtime.sendMessage({
            action: "SEARCH_IMAGES",
            payload: { query: imageQuery, start: 1 }
        }, (response) => {
            setIsSearchingImages(false);
            if (response && response.success) {
                setImageResults(response.data.items || []);
            } else {
                console.error("Error buscando imágenes:", response?.error);
            }
        });
    };

    const handleSelectImage = (imgUrl) => {
        const newObjs = [...SelectedObjects];
        newObjs[Index] = { ...newObjs[Index], image: imgUrl };
        setSelectedObjects(newObjs);
        setImageResults([]);
    };

    const handleRemoveImage = () => {
        const newObjs = [...SelectedObjects];
        newObjs[Index] = { ...newObjs[Index], image: null };
        setSelectedObjects(newObjs);
        setImageQuery(currentWord.name);
    };

    const isPhrasal = currentWord.mode == 2;
    const safeString = (val) => (typeof val === 'string' ? val : "");
    const safeArray = (val) => (Array.isArray(val) ? val : []);

    const meaningList = safeString(currentWord.meaning) ? currentWord.meaning.split("\n") : [];
    const exampleList = safeArray(currentWord.example || currentWord.examples);
    const typeList = isPhrasal ? ["Phrasal Verb"] : (Array.isArray(currentWord.type) ? currentWord.type : [currentWord.type].filter(Boolean));

    const PostData = () => ({
        name: currentWord.name,
        past: currentWord.past,
        gerund: currentWord.gerund,
        participle: currentWord.participle,
        meaning: currentWord.meaning,
        examples: exampleList,
        word_types: typeList,
        synonyms: Array.isArray(currentWord.synonyms) ? currentWord.synonyms.join(",") : safeString(currentWord.synonyms),
        antonyms: Array.isArray(currentWord.antonyms) ? currentWord.antonyms.join(",") : safeString(currentWord.antonyms),
        image: currentWord.image
    });

    const playSound = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="ElementCardOverlay">
            <div className="ElementCardContainer" style={{ flexDirection: 'column' }}>

                {SelectedObjects.length > 0 && (
                    <div style={{
                        display: 'flex',
                        background: 'rgba(7, 19, 32, 0.95)',
                        borderBottom: '1px solid rgba(0, 195, 255, 0.2)',
                        padding: '8px 16px 0 16px',
                        gap: '6px',
                        overflowX: 'auto',
                        width: '100%',
                        alignItems: 'flex-end',
                        flexShrink: 0
                    }}>
                        {SelectedObjects.map((obj, i) => (
                            <div
                                key={i}
                                onClick={() => setIndex(i)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 16px',
                                    background: Index === i ? 'rgba(14, 12, 29, 0.9)' : 'rgba(0,0,0,0.3)',
                                    borderTop: `2px solid ${Index === i ? '#00c3ff' : 'transparent'}`,
                                    borderLeft: '1px solid rgba(0, 195, 255, 0.1)',
                                    borderRight: '1px solid rgba(0, 195, 255, 0.1)',
                                    borderRadius: '10px 10px 0 0',
                                    cursor: 'pointer',
                                    color: Index === i ? '#fff' : '#a0a0a0',
                                    fontWeight: Index === i ? 'bold' : 'normal',
                                    minWidth: '120px',
                                    maxWidth: '220px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
                                    {obj.name}
                                </span>
                                <BsXLg
                                    size={12}
                                    style={{ cursor: 'pointer', color: '#a0a0a0', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}
                                    onClick={(e) => closeTab(e, i)}
                                />
                            </div>
                        ))}

                        <div style={{ flexGrow: 1 }}></div>
                        <button
                            onClick={handleClose}
                            title="Cerrar modal"
                            style={{
                                background: 'rgba(255,77,77,0.1)',
                                border: '1px solid rgba(255,77,77,0.3)',
                                color: '#ff4d4d',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                marginBottom: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <BsXLg size={12} /> Cerrar Modal
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', flexGrow: 1, overflowY: 'auto' }}>

                    {/* --- PANEL IZQUIERDO --- */}
                    <div className="EC-LeftPanel" style={{ height: 'auto', flex: '1 1 350px' }}>

                        <div className="EC-ImageContainer" style={{ border: (!currentWord.image && !showSearch) ? '1px solid rgba(0, 195, 255, 0.1)' : '1px solid rgba(0, 195, 255, 0.2)', boxShadow: currentWord.image ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : 'none' }}>
                            {currentWord.image ? (
                                <div className="EC-ImageWrapper">
                                    <img src={currentWord.image.split(";")[0]} alt={currentWord.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="EC-ImageOverlay">
                                        <button onClick={handleRemoveImage} className="EC-ChangeImageBtn">
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            ) : showSearch ? (
                                <div className="EC-ImageSearchContainer">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 className="EC-ImageSearchHeader">
                                            <FaSearch size={12} /> Find Image
                                        </h4>
                                        <button onClick={() => setShowSearch(false)} style={{ background: 'transparent', border: 'none', color: '#a0a0a0', cursor: 'pointer' }} title="Cancel">
                                            <BsXLg size={12} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleImageSearch} className="EC-ImageSearchForm">
                                        <input
                                            type="text"
                                            value={imageQuery}
                                            onChange={(e) => setImageQuery(e.target.value)}
                                            placeholder="Type to search..."
                                            className="EC-ImageSearchInput"
                                        />
                                        <button type="submit" disabled={isSearchingImages} className="EC-ImageSearchBtn">
                                            {isSearchingImages ? <div className="EC-Spinner"></div> : <FaSearch size={12} />}
                                        </button>
                                    </form>

                                    <div className="EC-ScrollBox" style={{ flexGrow: 1, position: 'relative' }}>
                                        {imageResults.length > 0 ? (
                                            <div className="EC-ImageResultsGrid">
                                                {imageResults.map((res, i) => (
                                                    <img
                                                        key={i}
                                                        src={res.link}
                                                        onClick={() => { handleSelectImage(res.link); setShowSearch(false); }}
                                                        className="EC-ImageResultItem"
                                                        alt={`Result ${i}`}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(160, 160, 160, 0.4)', fontStyle: 'italic', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                                                Search for an image to represent this word.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="EC-DefaultImagePlaceholder">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,195,255,0.4))' }}>
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00c3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 17L12 22L22 17" stroke="#00c3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 12L12 17L22 12" stroke="#00c3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>No Image</span>

                                    <button onClick={() => setShowSearch(true)} className="EC-AddImageBtn">
                                        <FaImage size={14} /> Add Image
                                    </button>
                                </div>
                            )}
                        </div>

                        <h2 className="EC-Title">{currentWord.name}</h2>

                        <div className="EC-Tags">
                            {typeList.map((type, idx) => (
                                <span key={idx} className="EC-Tag">{type}</span>
                            ))}
                        </div>

                        <div className="EC-Actions">
                            <button className="EC-BtnPrimary" onClick={() => playSound(currentWord.name)}>
                                <CiPlay1 size={20} /> Listen
                            </button>
                            <button className="EC-BtnSecondary" onClick={() => setAddWordB(!AddWordB)} title="Add to List">
                                <IoMdAdd size={24} />
                            </button>
                        </div>

                        {AddWordB && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10,
                                background: 'rgba(7, 19, 32, 0.95)', backdropFilter: 'blur(10px)', padding: '30px',
                                borderRadius: '30px 0 0 30px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                    <button onClick={() => setAddWordB(false)} style={{ background: 'transparent', color: '#a0a0a0', border: 'none', cursor: 'pointer' }}><BsXLg size={20} /></button>
                                </div>
                                <AddWordToList
                                    ExtraFunction={() => setAddWordB(false)}
                                    data={PostData()}
                                    CurrentListId={CurrentListId}
                                    userLists={UserLists}
                                    addWordFunction={addWordFunction}
                                />
                            </div>
                        )}
                    </div>

                    <div className="EC-RightPanel" style={{ flex: '1 1 450px' }}>

                        {currentWord.originalContext && (
                            <section>
                                <h4 className="EC-SectionTitle">Context Found</h4>
                                <div className="EC-MeaningBox EC-ScrollBox" style={{ maxHeight: '120px', borderLeft: '3px solid #00c3ff', paddingLeft: '15px' }}>
                                    <span style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>"{currentWord.originalContext}"</span>
                                </div>
                            </section>
                        )}

                        <section>
                            <h4 className="EC-SectionTitle">Meaning</h4>
                            <div className="EC-MeaningBox EC-ScrollBox" style={{ maxHeight: '160px' }}>
                                {meaningList.length > 0 ? (
                                    meaningList.map((line, i) => <p key={i} style={{ margin: '0 0 8px 0' }}>{line}</p>)
                                ) : (
                                    <p style={{ fontStyle: 'italic', color: '#a0a0a0' }}>No meaning provided.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h4 className="EC-SectionTitle">Example Sentences</h4>
                            {exampleList.length > 0 ? (
                                <div className="EC-ExampleList EC-ScrollBox" style={{ maxHeight: '220px' }}>
                                    {exampleList.map((ex, i) => (
                                        <div key={i} className="EC-ExampleItem">
                                            {typeof ex === 'string' ? ex : JSON.stringify(ex)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="EC-MeaningBox" style={{ fontStyle: 'italic', color: '#a0a0a0' }}>
                                    No examples provided.
                                </div>
                            )}
                        </section>

                        {(currentWord.past || currentWord.gerund || currentWord.participle) && (
                            <section>
                                <h4 className="EC-SectionTitle">Word Forms</h4>
                                <div className="EC-Grid3">
                                    {currentWord.past && (
                                        <div className="EC-SmallBox">
                                            <span className="EC-SmallBoxLabel">Past</span>
                                            <span className="EC-SmallBoxValue">{currentWord.past}</span>
                                        </div>
                                    )}
                                    {currentWord.gerund && (
                                        <div className="EC-SmallBox">
                                            <span className="EC-SmallBoxLabel">Gerund</span>
                                            <span className="EC-SmallBoxValue">{currentWord.gerund}</span>
                                        </div>
                                    )}
                                    {currentWord.participle && (
                                        <div className="EC-SmallBox">
                                            <span className="EC-SmallBoxLabel">Participle</span>
                                            <span className="EC-SmallBoxValue">{currentWord.participle}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="EC-Grid2">
                            <section>
                                <h4 className="EC-SectionTitle" style={{ color: '#00ff88' }}>Synonyms</h4>
                                <div className="EC-SmallBox Green EC-ScrollBox" style={{ maxHeight: '100px' }}>
                                    <span className="EC-SmallBoxValue" style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
                                        {safeString(currentWord.synonyms) || "None"}
                                    </span>
                                </div>
                            </section>
                            <section>
                                <h4 className="EC-SectionTitle" style={{ color: '#ff4d4d' }}>Antonyms</h4>
                                <div className="EC-SmallBox Red EC-ScrollBox" style={{ maxHeight: '100px' }}>
                                    <span className="EC-SmallBoxValue" style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
                                        {safeString(currentWord.antonyms) || "None"}
                                    </span>
                                </div>
                            </section>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ElementCard;