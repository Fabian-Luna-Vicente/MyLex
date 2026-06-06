import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVocabulary } from "./useVocabulary";
import { useAuth } from "./useAuth";
import { getLangCode } from "../config/constants";

export const useListWords = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fetchListDetails, editList, deleteList, deleteWord, lists, copyList } = useVocabulary();

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditListMenu, setShowEditListMenu] = useState(false);
    const [showMoveMenu, setShowMoveMenu] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // --- ESTADOS TEMPORALES PARA ACCIONES ---
    const [newTitle, setNewTitle] = useState("");
    const [newPrivacy, setNewPrivacy] = useState("public");
    const [newLanguage, setNewLanguage] = useState("English");
    const [wordToMove, setWordToMove] = useState(null);
    const [wordToDelete, setWordToDelete] = useState(null);
    const [wordForDetail, setWordForDetail] = useState(null);
    const [deleteMode, setDeleteMode] = useState(false);

    // --- PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchListDetails(id);
            setList(data);
        } catch (e) {
            setList(null);
        } finally {
            setLoading(false);
        }
    }, [id, fetchListDetails]);

    useEffect(() => {
        loadList();
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, [loadList]);

    const playSound = async (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = list ? getLangCode(list.language) : 'en-US';
        utterance.lang = langCode;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const matchingVoices = voices.filter(v => v.lang === langCode || v.lang.replace('_', '-') === langCode || v.lang.startsWith(langCode.split('-')[0]));
            if (matchingVoices.length > 0) {
                let voice = matchingVoices.find(v => v.name.includes("Google"));
                if (!voice) voice = matchingVoices[0];
                utterance.voice = voice;
                window.speechSynthesis.speak(utterance);
                return;
            }
        }

        const fallbackLang = list ? list.language : 'English';
        const fallbackCode = getLangCode(fallbackLang).split('-')[0];

        // El usuario pidió usar la voz nativa para inglés y español
        if (fallbackCode === 'en' || fallbackCode === 'es') {
            window.speechSynthesis.speak(utterance);
            return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const url = `${API_URL}/api/vocabulary/tts?lang=${fallbackCode}&text=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.play().catch(e => {
            console.error("[TTS Debug] Fallback audio failed:", e);
            window.speechSynthesis.speak(utterance);
        });
    };

    const handleEditList = async () => {
        if (!newTitle.trim()) return;
        try {
            await editList(id, { name: newTitle, privacy: newPrivacy, language: newLanguage });
            setList(prev => ({ ...prev, name: newTitle, privacy: newPrivacy, language: newLanguage }));
            setShowEditListMenu(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteList = async () => {
        if (window.confirm("Are you sure you want to delete this entire list?")) {
            try {
                await deleteList(id);
                navigate('/lists');
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDeleteWord = async () => {
        try {
            await deleteWord(wordToDelete.id);
            setList(prev => ({
                ...prev,
                words: prev.words.filter(w => w.id !== wordToDelete.id)
            }));
            setShowConfirmDelete(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMoveWord = async () => {
        // Implement Move Word Logic later
        console.log("Move word", wordToMove);
    };

    const openDetail = (word) => {
        setWordForDetail(word);
        setShowDetailModal(true);
    };

    const handleCopyList = async () => {
        try {
            const newList = await copyList(id);
            if (newList && newList.id) {
                navigate(`/list/${newList.id}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const isOwner = list?.user_id === user?.id;

    return { 
        list, lists, loading, id, navigate, isOwner,
        showEditListMenu, setShowEditListMenu, 
        showMoveMenu, setShowMoveMenu, 
        showConfirmDelete, setShowConfirmDelete, 
        showDetailModal, setShowDetailModal,
        newTitle, setNewTitle, 
        newPrivacy, setNewPrivacy,
        newLanguage, setNewLanguage, 
        wordToMove, setWordToMove, 
        wordToDelete, setWordToDelete, 
        wordForDetail, setWordForDetail,
        deleteMode, setDeleteMode, 
        currentPage, setCurrentPage, 
        itemsPerPage, 
        playSound,
        handleEditList, handleDeleteList, handleDeleteWord, handleMoveWord, handleCopyList,
        openDetail
    };
}