import { BsFillSendCheckFill } from "react-icons/bs";
import { useState, useEffect } from "react";

function AddWordToList({ data, ExtraFunction, CurrentListId = "" }) {
  const [UserLists, setUserLists] = useState([]);
  const [ListsToPost, setListsToPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_LISTS" }, (response) => {
      setLoading(false);
      if (response && response.success) {
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
    <div className="AW-Container">
      <h4 className="AW-Title">Save to <span>Lists</span></h4>

      <div className="AW-ListScrollArea">
        {loading ? (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>Loading lists...</p>
        ) : availableLists.length > 0 ? (
          availableLists.map((list) => {
            const isSelected = ListsToPost.includes(list.id);
            return (
              <label key={list.id} className={`AW-ListOption ${isSelected ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(list.id)}
                />
                <span>{list.name || list.title}</span>
              </label>
            );
          })
        ) : (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', padding: '10px', fontStyle: 'italic' }}>
            No other lists found. Create one in the dashboard!
          </p>
        )}
      </div>

      <button
        className="AW-BtnSubmit"
        onClick={PostData}
        disabled={ListsToPost.length === 0 || saving}
        title="Confirm selection"
      >
        {saving ? <div className="EC-Spinner" style={{ borderColor: '#000', borderTopColor: 'transparent' }}></div> : <BsFillSendCheckFill size={18} />}
        <span>{saving ? "Saving..." : "Add Words"}</span>
      </button>
    </div>
  );
}

export default AddWordToList;