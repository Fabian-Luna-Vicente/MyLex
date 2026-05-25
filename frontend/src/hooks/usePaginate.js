import { useMemo } from "react";

export const usePaginate = (currentPage, itemsPerPage, list) => {

    const { currentItems, totalPages } = useMemo(() => {
        const safeList = list || [];
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return {
            currentItems: safeList.slice(indexOfFirstItem, indexOfLastItem),
            totalPages: Math.ceil(safeList.length / itemsPerPage)
        };
    }, [currentPage, itemsPerPage, list]);

    return { setCurrentItems: () => {}, currentItems, totalPages };
}   