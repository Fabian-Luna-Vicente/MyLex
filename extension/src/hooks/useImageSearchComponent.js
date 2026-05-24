import { useState, useEffect, useContext } from "react";
import { Context } from "../Contexts/Context";

export const useImageSearchComponent = ({
    propSelectedObjects,
    propSetSelectedObjects
}) => {
    const contextData = useContext(Context);
    
    const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
    const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => { });

    const [AddWordB, setAddWordB] = useState(false);
    const [Index, setIndex] = useState(0);

    useEffect(() => {
        if (SelectedObjects.length > 0) {
            setIndex(SelectedObjects.length - 1);
        }
    }, [SelectedObjects.length]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleClose = () => {
        setSelectedObjects([]);
    };

    const handleNext = () => {
        setIndex((prev) => (prev < SelectedObjects.length - 1 ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setIndex((prev) => (prev > 0 ? prev - 1 : SelectedObjects.length - 1));
    };

    return {
        SelectedObjects,
        setSelectedObjects,
        AddWordB,
        setAddWordB,
        Index,
        setIndex,
        handleClose,
        handleNext,
        handlePrev
    };
};
