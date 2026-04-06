import { useState } from "react";
import styles from "./UserSelector.module.css";

export default function UserSelector({ currentUser, onUserChange }) {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(currentUser);

  const handleSave = () => {
    const name = tempName.trim();
    if (name === "") {
      alert("Username cannot be empty");
      return;
    }
    onUserChange(name);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditing(false);
      setTempName(currentUser);
    }
  };

  return (
    <div className={styles.container}>
      {editing ? (
        <div className={styles.editMode}>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name"
            className={styles.input}
            autoFocus
          />
          <button onClick={handleSave} className={styles.saveBtn}>
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setTempName(currentUser);
            }}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className={styles.displayMode}>
          <span className={styles.label}>You:</span>
          <span className={styles.name}>{currentUser}</span>
          <button
            onClick={() => setEditing(true)}
            className={styles.editBtn}
            title="Change name"
          >
            ✎
          </button>
        </div>
      )}
    </div>
  );
}
