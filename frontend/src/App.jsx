import { useState, useEffect, useRef } from "react";
import { useMessages } from "./hooks/useMessages";
import Message from "./components/Message";
import MessageInput from "./components/MessageInput";
import PinnedMessages from "./components/PinnedMessages";
import Login from "./components/Login";
import styles from "./App.module.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Load user from sessionStorage (persists only during session)
    const saved = sessionStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const { messages, loading, error, send, remove, pin } = useMessages();
  const bottomRef = useRef(null);

  // Save user to sessionStorage when it changes
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Show login screen if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const pinnedMessages = messages.filter((m) => m.isPinned);

  return (
    <div className={styles.layout}>
      {/* User header with logout */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.channelName}>general</p>
            <p className={styles.status}>
              <span className={styles.dot} />
              connected
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badge}>{messages.length} messages</span>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Pinned messages strip */}
      {pinnedMessages.length > 0 && (
        <PinnedMessages messages={pinnedMessages} onUnpin={pin} />
      )}

      {/* Message list */}
      <main className={styles.messageArea}>
        {loading && (
          <p className={styles.stateMsg}>Loading messages...</p>
        )}
        {error && (
          <p className={`${styles.stateMsg} ${styles.error}`}>{error}</p>
        )}
        {!loading && !error && messages.length === 0 && (
          <p className={styles.stateMsg}>No messages yet. Say something.</p>
        )}

        <div className={styles.messages}>
          {messages.map((msg) => (
            <Message
              key={msg._id}
              msg={msg}
              onDelete={remove}
              onPin={pin}
              isOwn={msg.sender === currentUser.username}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <MessageInput onSend={send} sender={currentUser.username} />
    </div>
  );
}
