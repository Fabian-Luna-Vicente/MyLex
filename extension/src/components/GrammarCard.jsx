import { useState, useEffect } from "react";
import { BsXLg } from "react-icons/bs";
import { FaPuzzlePiece } from "react-icons/fa";

function GrammarCard({ text, onClose, grammarData: propGrammarData }) {
    const [grammarData, setGrammarData] = useState(() => {
        if (propGrammarData) {
            return propGrammarData.data ? propGrammarData.data : propGrammarData;
        }
        return null;
    });
    const [loading, setLoading] = useState(!propGrammarData);
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
                console.log("RAW RESPONSE COMPLETO:", JSON.stringify(response));
                setLoading(false);
                if (response && response.success) {

                    const backendData = response.data;

                    const actualData = backendData.data ? backendData.data : backendData;
                    console.log("actualData que se pinta:", JSON.stringify(actualData));
                    setGrammarData(actualData);
                } else {
                    console.log("response error", response);
                    setError(response?.error || "Failed to analyze grammar.");
                }
            }
        );
    }, [text]);

    return (
        <div className="ElementCardOverlay">
            {/* Usamos ElementCardContainer pero lo forzamos a una sola columna centrada */}
            <div className="ElementCardContainer" style={{ maxWidth: '700px', flexDirection: 'column', padding: '32px', maxHeight: '90vh' }}>

                {/* Botón de Cerrar Premium (Absoluto) */}
                <button className="EC-CloseBtnTop" onClick={onClose} title="Close">
                    <BsXLg size={18} />
                </button>

                {/* Cabecera Premium */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexShrink: 0 }}>
                    <div style={{ background: 'rgba(0, 195, 255, 0.1)', border: '1px solid rgba(0, 195, 255, 0.3)', padding: '14px', borderRadius: '16px', color: '#00c3ff' }}>
                        <FaPuzzlePiece size={24} />
                    </div>
                    <div>
                        <h2 className="EC-Title" style={{ textAlign: 'left', fontSize: '1.8rem', margin: 0 }}>Grammar Analysis</h2>
                        <p style={{ color: '#a0a0a0', fontSize: '0.8rem', margin: 0, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Structural Breakdown
                        </p>
                    </div>
                </div>

                {/* Contenedor con Scroll para los Resultados */}
                <div className="EC-ScrollBox" style={{ flexGrow: 1, paddingRight: '12px' }}>

                    {/* Estado de Carga */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <div className="EC-Spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', marginBottom: '16px' }}></div>
                            <p style={{ color: '#a0a0a0', fontSize: '0.95rem', fontStyle: 'italic' }}>Analyzing sentence structure...</p>
                        </div>
                    )}

                    {/* Estado de Error */}
                    {error && (
                        <div style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {error}
                        </div>
                    )}

                    {/* Datos del Análisis */}
                    {grammarData && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                            {/* Frase Original */}
                            <section>
                                <h4 className="EC-SectionTitle">Original Sentence</h4>
                                <div className="EC-MeaningBox" style={{ borderLeft: '4px solid #00c3ff', paddingLeft: '16px' }}>
                                    <span style={{ fontStyle: 'italic', fontSize: '1.1rem', color: '#fff', fontWeight: '500' }}>
                                        "{grammarData.original || text}"
                                    </span>
                                </div>
                            </section>

                            {/* Explicación General */}
                            {grammarData.general_explanation && (
                                <section>
                                    <h4 className="EC-SectionTitle">General Explanation</h4>
                                    <div className="EC-MeaningBox">
                                        {grammarData.general_explanation}
                                    </div>
                                </section>
                            )}

                            {/* Desglose paso a paso (Protegido con fallback a array vacío) */}
                            {(grammarData.breakdown || []).length > 0 && (
                                <section>
                                    <h4 className="EC-SectionTitle">Step-by-step Breakdown</h4>
                                    <div className="EC-ExampleList">
                                        {(grammarData.breakdown || []).map((item, i) => (
                                            <div key={i} className="EC-ExampleItem" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>
                                                        "{item.segment}"
                                                    </span>
                                                    <span className="EC-Tag" style={{ fontSize: '0.65rem' }}>
                                                        {item.role}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#a0a0a0', fontStyle: 'normal', lineHeight: '1.5' }}>
                                                    {item.explanation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GrammarCard;