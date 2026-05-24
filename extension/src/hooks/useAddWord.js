import { useState, useEffect } from "react";
import { useLists } from "./useLists";

export const useAddWord = (data, CurrentListId, ExtraFunction) => {
  const [ListsToPost, setListsToPost] = useState([]);
  const { userLists, loading, saving, fetchLists, addWordToLists } = useLists();

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCheckboxChange = (listId) => {
    if (ListsToPost.includes(listId)) {
      setListsToPost(ListsToPost.filter((id) => id !== listId));
    } else {
      setListsToPost([...ListsToPost, listId]);
    }
  };

  const postData = async () => {
    if (ListsToPost.length === 0) return;

    const payload = {
      ...data,
      list_ids: ListsToPost
    };

    try {
      await addWordToLists(payload);
      if (ExtraFunction) ExtraFunction();
    } catch (err) {
      alert("Error saving: " + (err || "Check if you are logged in."));
    }
  };

  const availableLists = userLists.filter(list => list.id !== CurrentListId);

  return {
    availableLists,
    ListsToPost,
    loading,
    saving,
    handleCheckboxChange,
    postData
  };
};
