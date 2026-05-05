import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVocabulary } from "./useVocabulary";

export const useListWords = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchListDetails, editList, deleteList, deleteWord, lists } = useVocabulary();

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditListMenu, setShowEditListMenu] = useState(false);
    const [showMoveMenu, setShowMoveMenu] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // --- ESTADOS TEMPORALES PARA ACCIONES ---
    const [newTitle, setNewTitle] = useState("");
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
    }, [loadList]);

    const playSound = async (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleEditList = async () => {
        if (!newTitle.trim()) return;
        try {
            await editList(id, newTitle);
            setList(prev => ({ ...prev, name: newTitle }));
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

    return { 
        list, lists, loading, id, navigate,
        showEditListMenu, setShowEditListMenu, 
        showMoveMenu, setShowMoveMenu, 
        showConfirmDelete, setShowConfirmDelete, 
        showDetailModal, setShowDetailModal,
        newTitle, setNewTitle, 
        wordToMove, setWordToMove, 
        wordToDelete, setWordToDelete, 
        wordForDetail, setWordForDetail,
        deleteMode, setDeleteMode, 
        currentPage, setCurrentPage, 
        itemsPerPage, 
        playSound,
        handleEditList, handleDeleteList, handleDeleteWord, handleMoveWord,
        openDetail
    };
}