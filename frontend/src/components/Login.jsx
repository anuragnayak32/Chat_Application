import { useState } from "react";
import styles from "./Login.module.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const user = await response.json();
      onLogin(user);
    } catch (err) {
      setError("Failed to connect to server. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <div className={styles.logo}>💬</div>
          <h1 className={styles.title}>ChatApp</h1>
          <p className={styles.subtitle}>Real-time group chat</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Enter your name
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              placeholder="e.g., Alice"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={30}
              autoFocus
            />
            <p className={styles.hint}>2-30 characters</p>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !username.trim()}
          >
            {loading ? "Joining..." : "Join Chat"}
          </button>
        </form>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>⚡</span>
            <span>Real-time</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>📌</span>
            <span>Pin Messages</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🗑️</span>
            <span>Delete Messages</span>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.decoration1}></div>
      <div className={styles.decoration2}></div>
    </div>
  );
}
