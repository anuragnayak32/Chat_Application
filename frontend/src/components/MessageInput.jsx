import { useState } from "react";
import styles from "./MessageInput.module.css";

export default function MessageInput({ onSend, sender }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    
    setSending(true);
    try {
      await onSend(text.trim(), sender);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter, newline on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Shift+Enter for newline)"
        rows={1}
        disabled={sending}
        maxLength={5000}
      />
      <button
        type="submit"
        className={styles.sendBtn}
        disabled={!text.trim() || sending}
        title="Send (Ctrl+Enter)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}
