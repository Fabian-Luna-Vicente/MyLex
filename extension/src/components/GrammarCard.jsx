import { BsXLg } from "react-icons/bs";
import { FaPuzzlePiece } from "react-icons/fa";
import { useGrammarCard } from "../hooks/useGrammarCard";

function GrammarCard({ text, onClose, grammarData: propGrammarData }) {
    const { grammarData, loading, error } = useGrammarCard(text, propGrammarData);

    return (
        <div className="ElementCardOverlay">
            <div className="ElementCardContainer" style={{ maxWidth: '700px', flexDirection: 'column', padding: '32px', maxHeight: '90vh' }}>

                <button className="EC-CloseBtnTop" onClick={onClose} title="Close">
                    <BsXLg size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexShrink: 0 }}>
                    <div style={{ background: 'rgba(0, 195, 255, 0.1)', border: '1px solid rgba(0, 195, 255, 0.3)', padding: '14px', borderRadius: '16px', color: '#00c3ff' }}>
                        <FaPuzzlePiece size={24} />
                    </div>
                    <div>
                        <h2 className="EC-Title" style={{ textAlign: 'left', fontSize: '28.8px', margin: 0 }}>Grammar Analysis</h2>
                        <p style={{ color: '#a0a0a0', fontSize: '12.8px', margin: 0, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Structural Breakdown
                        </p>
                    </div>
                </div>

                <div className="EC-ScrollBox" style={{ flexGrow: 1, paddingRight: '12px' }}>

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <div className="EC-Spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', marginBottom: '16px' }}></div>
                            <p style={{ color: '#a0a0a0', fontSize: '15.2px', fontStyle: 'italic' }}>Analyzing sentence structure...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {error}
                        </div>
                    )}

                    {grammarData && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                            <section>
                                <h4 className="EC-SectionTitle">Original Sentence</h4>
                                <div className="EC-MeaningBox" style={{ borderLeft: '4px solid #00c3ff', paddingLeft: '16px' }}>
                                    <span style={{ fontStyle: 'italic', fontSize: '17.6px', color: '#fff', fontWeight: '500' }}>
                                        "{grammarData.original || text}"
                                    </span>
                                </div>
                            </section>

                            {grammarData.general_explanation && (
                                <section>
                                    <h4 className="EC-SectionTitle">General Explanation</h4>
                                    <div className="EC-MeaningBox">
                                        {grammarData.general_explanation}
                                    </div>
                                </section>
                            )}

                            {(grammarData.breakdown || []).length > 0 && (
                                <section>
                                    <h4 className="EC-SectionTitle">Step-by-step Breakdown</h4>
                                    <div className="EC-ExampleList">
                                        {(grammarData.breakdown || []).map((item, i) => (
                                            <div key={i} className="EC-ExampleItem" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '900', color: '#fff', fontSize: '17.6px' }}>
                                                        "{item.segment}"
                                                    </span>
                                                    <span className="EC-Tag" style={{ fontSize: '10.4px' }}>
                                                        {item.role}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '15.2px', color: '#a0a0a0', fontStyle: 'normal', lineHeight: '1.5' }}>
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