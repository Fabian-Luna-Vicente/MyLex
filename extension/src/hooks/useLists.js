import { useState, useEffect } from 'react';
import { listService } from '../services/listService';

export const useLists = () => {
    const [userLists, setUserLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchLists = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listService.getLists();
            setUserLists(Array.isArray(data) ? data : []);
            return data;
        } catch (err) {
            console.error("Error fetching lists", err);
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const addWordToLists = async (payload) => {
        setSaving(true);
        setError(null);
        try {
            const data = await listService.addWord(payload);
            return data;
        } catch (err) {
            console.error("Error adding word", err);
            setError(err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return {
        userLists,
        loading,
        saving,
        error,
        fetchLists,
        addWordToLists
    };
};
