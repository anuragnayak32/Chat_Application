import { useState, useRef, useEffect } from "react";
import styles from "./Message.module.css";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Message({ msg, onDelete, onPin, isOwn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          btnRef.current && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Position menu when opened
  useEffect(() => {
    if (menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      
      // Position menu to the left of button so it doesn't go off-screen on right
      const leftPos = rect.left - 170;
      
      setMenuPos({
        top: rect.bottom + 4,
        left: leftPos,
      });
    }
  }, [menuOpen]);

  const isDeleted = msg.deletedForEveryone;

  return (
    <div className={`${styles.row} ${msg.isPinned ? styles.pinned : ""} ${isOwn ? styles.own : ""}`}>
      {msg.isPinned && <span className={styles.pinIndicator}>📌</span>}

      <div className={styles.bubble}>
        <p className={styles.sender}>{msg.sender}</p>
        <p className={isDeleted ? styles.deletedText : styles.content}>
          {isDeleted ? "This message was deleted" : msg.content}
        </p>
        <span className={styles.time}>{formatTime(msg.createdAt)}</span>
      </div>

      {/* Only show actions for non-deleted messages */}
      {!isDeleted && (
        <div className={styles.actions}>
          <button
            ref={btnRef}
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            title="Options"
          >
            ···
          </button>

          {menuOpen && (
            <div 
              ref={menuRef}
              className={styles.menu}
              style={{
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
              }}
            >
              <button
                onClick={() => {
                  onPin(msg._id);
                  setMenuOpen(false);
                }}
              >
                {msg.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={() => {
                  onDelete(msg._id, "me");
                  setMenuOpen(false);
                }}
              >
                Delete for Me
              </button>
              <button
                className={styles.danger}
                onClick={() => {
                  onDelete(msg._id, "everyone");
                  setMenuOpen(false);
                }}
              >
                Delete for Everyone
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
