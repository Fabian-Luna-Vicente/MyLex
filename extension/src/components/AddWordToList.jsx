import { BsFillSendCheckFill } from "react-icons/bs";
import { useAddWord } from "../hooks/useAddWord";

function AddWordToList({ data, ExtraFunction, CurrentListId = "" }) {
  const {
    availableLists,
    ListsToPost,
    loading,
    saving,
    handleCheckboxChange,
    postData
  } = useAddWord(data, CurrentListId, ExtraFunction);

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
        onClick={postData}
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