import { useState, useEffect } from "react";
import { aiService } from "../services/aiService";

export const useGrammarCard = (text, propGrammarData) => {
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

    const fetchGrammar = async () => {
      setLoading(true);
      try {
        const data = await aiService.analyzeGrammar({ text, language: "en" });
        const actualData = data.data ? data.data : data;
        setGrammarData(actualData);
      } catch (err) {
        console.error("error fetching grammar", err);
        setError(err || "Failed to analyze grammar.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrammar();
  }, [text]);

  return {
    grammarData,
    loading,
    error
  };
};
