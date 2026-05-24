import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";
import { ListsContext } from "../Contexts/ListsContext";
import { useImageSearch } from "./useImageSearch";

export const useElementCard = ({
    propSelectedObjects,
    propSetSelectedObjects,
    propUserLists
}) => {
    const contextData = useContext(Context);
    const listContext = useContext(ListsContext);

    const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
    const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => { });
    const UserLists = propUserLists || listContext?.UserLists || [];

    const [AddWordB, setAddWordB] = useState(false);
    const [Index, setIndex] = useState(0);
    const [imageQuery, setImageQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    const { imageResults, isSearchingImages, searchImages, clearResults } = useImageSearch();

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
        clearResults();
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

    const handleImageSearch = async (e) => {
        e?.preventDefault();
        if (!imageQuery.trim()) return;
        await searchImages(imageQuery);
    };

    const handleSelectImage = (imgUrl) => {
        const newObjs = [...SelectedObjects];
        newObjs[Index] = { ...newObjs[Index], image: imgUrl };
        setSelectedObjects(newObjs);
        clearResults();
    };

    const handleRemoveImage = () => {
        const newObjs = [...SelectedObjects];
        newObjs[Index] = { ...newObjs[Index], image: null };
        setSelectedObjects(newObjs);
        setImageQuery(SelectedObjects[Index]?.name || "");
    };

    const playSound = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return {
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
        handleNext,
        handlePrev,
        closeTab,
        handleImageSearch,
        handleSelectImage,
        handleRemoveImage,
        playSound
    };
};
