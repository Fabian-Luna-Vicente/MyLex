import { BsFillSendCheckFill } from "react-icons/bs";
import { useState, useEffect } from "react";

function AddWordToList({ data, ExtraFunction, CurrentListId = "" }) {
  const [UserLists, setUserLists] = useState([]);
  const [ListsToPost, setListsToPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pedir listas al background.js al abrir el modal
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_LISTS" }, (response) => {
      setLoading(false);
      if (response && response.success) {
        // Aseguramos que sea un array
        setUserLists(Array.isArray(response.data) ? response.data : []);
      }
    });
  }, []);

  const handleCheckboxChange = (listId) => {
    if (ListsToPost.includes(listId)) {
      setListsToPost(ListsToPost.filter((id) => id !== listId));
    } else {
      setListsToPost([...ListsToPost, listId]);
    }
  };

  const PostData = () => {
    if (ListsToPost.length === 0) return;
    setSaving(true);

    const payload = {
      ...data,
      list_ids: ListsToPost
    };

    chrome.runtime.sendMessage(
      { action: "ADD_WORD", payload: payload },
      (response) => {
        setSaving(false);
        if (response && response.success) {
          if (ExtraFunction) ExtraFunction();
        } else {
          alert("Error saving: " + (response?.error || "Check if you are logged in."));
        }
      }
    );
  };

  const availableLists = UserLists.filter(list => list.id !== CurrentListId);

  return (
    <div className="AddToListCard">
      <h4>Add to List</h4>

      <div className="ListScrollArea">
        {loading ? (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>Loading lists...</p>
        ) : availableLists.length > 0 ? (
          availableLists.map((list) => (
            <label key={list.id} className="ListOption">
              <input
                type="checkbox"
                checked={ListsToPost.includes(list.id)}
                onChange={() => handleCheckboxChange(list.id)}
              />
              <span>{list.name || list.title}</span> {/* Ajusta según cómo lo envíe FastAPI */}
            </label>
          ))
        ) : (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>
            No other lists found.
          </p>
        )}
      </div>

      <button
        className="BtnSendList"
        onClick={PostData}
        disabled={ListsToPost.length === 0 || saving}
        title="Confirm selection"
      >
        <BsFillSendCheckFill />
        <span>{saving ? "Saving..." : "Add Words"}</span>
      </button>
    </div>
  );
}

export default AddWordToList;