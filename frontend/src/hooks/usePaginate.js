import { useState, useEffect } from "react";

export const usePaginate = (currentPage, itemsPerPage, list) => {

    const [currentItems, setCurrentItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        setCurrentItems(list.slice(indexOfFirstItem, indexOfLastItem));
        setTotalPages(Math.ceil(list.length / itemsPerPage));

    }, [currentPage, itemsPerPage, list]);

    return { setCurrentItems, currentItems, totalPages }
}   