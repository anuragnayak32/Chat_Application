import styles from "./PinnedMessages.module.css";

export default function PinnedMessages({ messages, onUnpin }) {
  if (!messages.length) return null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>📌 Pinned</span>
      <div className={styles.list}>
        {messages.map((m) => (
          <div key={m._id} className={styles.item}>
            <span className={styles.text}>
              {m.deletedForEveryone ? "This message was deleted" : m.content}
            </span>
            <button
              className={styles.unpinBtn}
              onClick={() => onUnpin(m._id)}
              title="Unpin"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
