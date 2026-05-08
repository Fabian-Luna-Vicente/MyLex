import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaPuzzlePiece } from "react-icons/fa";

function GrammarCard({ text, onClose, grammarData: propGrammarData }) {
    const [grammarData, setGrammarData] = useState(propGrammarData || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!text || grammarData) {
            setLoading(false);
            return;
        }

        setLoading(true);
        chrome.runtime.sendMessage(
            { action: "ANALYZE_GRAMMAR", payload: { text: text, language: "en" } },
            (response) => {
                setLoading(false);
                if (response && response.success) {
                    setGrammarData(response.data);
                } else {
                    setError(response?.error || "Failed to analyze grammar.");
                }
            }
        );
    }, [text]);

    return (
        <div className="ElementCardOverlay">
            <div className="ElementCardContainer" style={{ maxWidth: '600px' }}>

                {/* Header */}
                <div className="EC-Header" style={{ borderBottom: '2px solid #a78bfa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="EC-CloseBtn" onClick={onClose}>
                            <IoMdClose />
                        </button>
                        <h3 className="EC-Title" style={{ fontSize: '1.1rem' }}>
                            <FaPuzzlePiece style={{ marginRight: '8px', color: '#a78bfa' }} />
                            Grammar Analysis
                        </h3>
                    </div>
                </div>

                <div className="EC-Content">
                    {/* Estados de Carga y Error */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#a78bfa' }}>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a78bfa] mx-auto mb-4"></div>
                            <p>AI is analyzing the sentence...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#ff4d4d', textAlign: 'center', padding: '20px' }}>
                            {error}
                        </div>
                    )}

                    {/* Contenido Original de la Tarjeta (Solo se muestra si hay datos) */}
                    {grammarData && (
                        <>
                            <div style={{
                                padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                                fontStyle: 'italic', fontSize: '1.1rem', textAlign: 'center', marginBottom: '15px',
                                border: '1px solid #444', color: 'wheat'
                            }}>
                                "{grammarData.original}"
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#a78bfa', margin: '0 0 5px 0' }}>Structure:</h4>
                                <p style={{ margin: 0, lineHeight: '1.5', color: 'white' }}>{grammarData.general_explanation}</p>
                            </div>

                            <div className="EC-Examples">
                                <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', color: '#a78bfa' }}>Breakdown:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                    {grammarData.breakdown.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', flexDirection: 'column', background: '#222', padding: '10px',
                                            borderRadius: '6px', borderLeft: `4px solid ${['#a78bfa', '#00c3ff', '#ff0055'][i % 3]}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#fff' }}>"{item.segment}"</span>
                                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#ccc' }}>
                                                    {item.role}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{item.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GrammarCard;