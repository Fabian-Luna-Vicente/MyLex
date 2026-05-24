import { IoIosArrowForward, IoIosArrowBack, IoMdAdd } from "react-icons/io";
import { BsXLg } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";
import { FaImage, FaSearch } from "react-icons/fa";
import AddWordToList from "./AddWordToList";
import { useElementCard } from "../hooks/useElementCard";

function ElementCard({
    CurrentListId,
    selectedObjects: propSelectedObjects,
    setSelectedObjects: propSetSelectedObjects,
    userLists: propUserLists,
    addWordFunction
}) {
    const {
        SelectedObjects,
        UserLists,
        AddWordB,
        setAddWordB,
        Index,
        setIndex,
        imageQuery,
        setImageQuery,
        showSearch,
        setShowSearch,
        imageResults,
        isSearchingImages,
        handleClose,
        closeTab,
        handleImageSearch,
        handleSelectImage,
        handleRemoveImage,
        playSound
    } = useElementCard({
        propSelectedObjects,
        propSetSelectedObjects,
        propUserLists
    });

    const currentWord = SelectedObjects[Index] || {};
    if (!currentWord || !currentWord.name) return null;

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

    return (
        <div className="ElementCardOverlay">
            <div className="ElementCardContainer" style={{ flexDirection: 'column' }}>

                {SelectedObjects.length > 0 && (
                    <div style={{
                        display: 'flex',
                        background: 'rgba(7, 19, 32, 0.95)',
                        borderBottom: '1px solid rgba(0, 195, 255, 0.2)',
                        width: '100%',
                        alignItems: 'flex-end',
                        flexShrink: 0,
                        paddingRight: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            overflowX: 'auto',
                            padding: '8px 0 0 16px',
                            flexGrow: 1,
                            alignItems: 'flex-end'
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
                        </div>

                        <div style={{ padding: '8px 0 8px 16px', display: 'flex', alignItems: 'center' }}>
                            <button
                                onClick={handleClose}
                                title="Cerrar modal"
                                style={{
                                    background: 'rgba(7, 19, 32, 0.5)',
                                    border: 'none',
                                    color: '#a0a0a0',
                                    borderRadius: '50%',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.background = 'rgba(0, 195, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#a0a0a0';
                                    e.currentTarget.style.background = 'rgba(7, 19, 32, 0.5)';
                                }}
                            >
                                <BsXLg size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                    {/* --- PANEL IZQUIERDO --- */}
                    <div className="EC-LeftPanel" style={{ position: 'relative', flex: '1 1 350px', minWidth: '300px', height: '100%', minHeight: '100%', background: 'rgba(7, 19, 32, 0.5)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', borderRight: '1px solid rgba(0, 195, 255, 0.1)', overflowY: 'auto' }}>

                        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', textAlign: 'left', textShadow: '0 0 15px rgba(0,195,255,0.3)', margin: '0 0 8px 0' }}>{currentWord.name}</h2>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start', marginBottom: '24px' }}>
                            {typeList.map((type, idx) => (
                                <span key={idx} style={{ padding: '4px 12px', background: 'rgba(0, 195, 255, 0.1)', color: '#00c3ff', border: '1px solid rgba(0, 195, 255, 0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{type}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'flex-start', marginBottom: '32px' }}>
                            <button onClick={() => playSound(currentWord.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#00c3ff', color: 'black', borderRadius: '9999px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(0,195,255,0.5)' }}>
                                <CiPlay1 size={20} /> Listen
                            </button>
                            <button onClick={() => setAddWordB(!AddWordB)} title="Add to List" style={{ padding: '12px', background: '#0e0c1d', border: '1px solid rgba(0, 195, 255, 0.3)', color: '#00c3ff', borderRadius: '9999px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <IoMdAdd size={24} />
                            </button>
                        </div>

                    </div>

                    <div className="EC-RightPanel" style={{ flex: '2 1 450px', minWidth: '300px', height: '100%', minHeight: '100%', padding: '32px 48px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {currentWord.originalContext && (
                            <section>
                                <h4 style={{ color: '#00c3ff', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '12px', margin: 0 }}>Context Found</h4>
                                <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', borderLeft: '3px solid #00c3ff' }}>
                                    "{currentWord.originalContext}"
                                </div>
                            </section>
                        )}

                        <section>
                            <h4 style={{ color: '#00c3ff', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '12px', margin: 0 }}>Meaning</h4>
                            <div style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                {meaningList.length > 0 ? (
                                    meaningList.map((line, i) => <p key={i} style={{ margin: '0 0 8px 0' }}>{line}</p>)
                                ) : (
                                    <p style={{ fontStyle: 'italic', color: '#a0a0a0', margin: 0 }}>No meaning provided.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h4 style={{ color: '#00c3ff', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: 0, marginBottom: '24px' }}>Example Sentences</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {exampleList.length > 0 ? (
                                    exampleList.map((ex, i) => (
                                        <div key={i} style={{ position: 'relative', background: 'linear-gradient(to bottom right, #0e0c1d, #071320)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0, 195, 255, 0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                            <div style={{ position: 'absolute', top: '-10px', left: '16px', background: '#071320', padding: '0 8px', color: 'rgba(0, 195, 255, 0.3)' }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 3C15.1216 3 16.017 3.89543 16.017 5V5.5C16.017 6.05228 16.4647 6.5 17.017 6.5H20.017C21.1216 6.5 22.017 7.39543 22.017 8.5V15.5C22.017 16.6046 21.1216 17.5 20.017 17.5H17.017C16.4647 17.5 16.017 17.9477 16.017 18.5V21H14.017ZM2.0166 21L2.0166 18C2.0166 16.8954 2.91203 16 4.0166 16H7.0166C7.56889 16 8.0166 15.5523 8.0166 15V9C8.0166 8.44772 7.56889 8 7.0166 8H4.0166C2.91203 8 2.0166 7.10457 2.0166 6V3L2.0166 3C3.12117 3 4.0166 3.89543 4.0166 5V5.5C4.0166 6.05228 4.46432 6.5 5.0166 6.5H8.0166C9.12117 6.5 10.0166 7.39543 10.0166 8.5V15.5C10.0166 16.6046 9.12117 17.5 8.0166 17.5H5.0166C4.46432 17.5 4.0166 17.9477 4.0166 18.5V21H2.0166Z"/></svg>
                                            </div>
                                            <p style={{ color: '#e0e0e0', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                                                {typeof ex === 'string' ? ex : JSON.stringify(ex)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ background: '#0e0c1d', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#a0a0a0', fontStyle: 'italic', fontSize: '0.875rem', textAlign: 'center' }}>
                                        No examples provided yet.
                                    </div>
                                )}
                            </div>
                        </section>

                        {(currentWord.past || currentWord.gerund || currentWord.participle) && (
                            <section>
                                <h4 style={{ color: '#00c3ff', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 16px 0' }}>Word Forms</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
                                    {currentWord.past && (
                                        <div style={{ background: '#071320', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <span style={{ fontSize: '0.625rem', color: '#a0a0a0', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Past</span>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>{currentWord.past}</span>
                                        </div>
                                    )}
                                    {currentWord.gerund && (
                                        <div style={{ background: '#071320', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <span style={{ fontSize: '0.625rem', color: '#a0a0a0', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Gerund</span>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>{currentWord.gerund}</span>
                                        </div>
                                    )}
                                    {currentWord.participle && (
                                        <div style={{ background: '#071320', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <span style={{ fontSize: '0.625rem', color: '#a0a0a0', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Participle</span>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>{currentWord.participle}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                            <section>
                                <h4 style={{ color: '#00ff88', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 12px 0' }}>Synonyms</h4>
                                <div style={{ fontSize: '0.875rem', color: '#a0a0a0', background: 'rgba(0, 255, 136, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 255, 136, 0.1)', minHeight: '60px' }}>
                                    {safeString(currentWord.synonyms) || "None"}
                                </div>
                            </section>
                            <section>
                                <h4 style={{ color: '#ff4d4d', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 12px 0' }}>Antonyms</h4>
                                <div style={{ fontSize: '0.875rem', color: '#a0a0a0', background: 'rgba(255, 77, 77, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.1)', minHeight: '60px' }}>
                                    {safeString(currentWord.antonyms) || "None"}
                                </div>
                            </section>
                        </div>

                        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ color: '#00c3ff', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 12px 0', width: '100%', textAlign: 'left' }}>Image</h4>
                            <div className="EC-ImageContainer" style={{ width: '100%', maxWidth: '400px', aspectRatio: '1 / 1', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 195, 255, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
                                {currentWord.image ? (
                                    <div className="EC-ImageWrapper" style={{ width: '100%', height: '100%' }}>
                                        <img src={currentWord.image.split(";")[0]} alt={currentWord.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div className="EC-ImageOverlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                            <button onClick={handleRemoveImage} style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                                                Change Image
                                            </button>
                                        </div>
                                    </div>
                                ) : showSearch ? (
                                    <div className="EC-ImageSearchContainer" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', background: '#0e0c1d' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ color: '#00c3ff', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaSearch size={12} /> Find Image
                                            </h4>
                                            <button onClick={() => setShowSearch(false)} style={{ background: 'transparent', border: 'none', color: '#a0a0a0', cursor: 'pointer' }} title="Cancel">
                                                <BsXLg size={12} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleImageSearch} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={imageQuery}
                                                onChange={(e) => setImageQuery(e.target.value)}
                                                placeholder="Search..."
                                                style={{ flexGrow: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,195,255,0.3)', background: 'rgba(0,0,0,0.5)', color: 'white', minWidth: 0 }}
                                            />
                                            <button type="submit" disabled={isSearchingImages} style={{ background: '#00c3ff', color: 'black', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                                                <FaSearch size={10} />
                                            </button>
                                        </form>

                                        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                                            {imageResults.length > 0 ? (
                                                imageResults.map((res, i) => (
                                                    <img
                                                        key={i}
                                                        src={res.link}
                                                        onClick={() => { handleSelectImage(res.link); setShowSearch(false); }}
                                                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(0,195,255,0.2)' }}
                                                        alt={`Result ${i}`}
                                                    />
                                                ))
                                            ) : (
                                                <div style={{ gridColumn: 'span 2', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(160, 160, 160, 0.4)', fontStyle: 'italic', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                                                    Search for an image to represent this word.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#0e0c1d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(160,160,160,0.2)' }}>
                                        <span style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>No Image Available</span>
                                        <button onClick={() => setShowSearch(true)} style={{ marginTop: '16px', background: 'transparent', color: '#00c3ff', border: '1px solid #00c3ff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaImage size={12} /> Add Image
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>

                {AddWordB && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100,
                        background: 'rgba(7, 19, 32, 0.95)', backdropFilter: 'blur(10px)', padding: '40px',
                        borderRadius: '30px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button onClick={() => setAddWordB(false)} style={{ background: 'transparent', color: '#a0a0a0', border: 'none', cursor: 'pointer', padding: '10px' }}>
                                <BsXLg size={24} />
                            </button>
                        </div>
                        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                            <div style={{ width: '100%', maxWidth: '600px', height: '100%' }}>
                                <AddWordToList
                                    ExtraFunction={() => setAddWordB(false)}
                                    data={PostData()}
                                    CurrentListId={CurrentListId}
                                    userLists={UserLists}
                                    addWordFunction={addWordFunction}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ElementCard;