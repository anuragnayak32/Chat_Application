import { useState, useEffect, useCallback } from "react";
import socket from "../socket";
import * as api from "../api";

// A stable mock userId for "delete for me" logic
// In a real app this comes from auth
const USER_ID = "user_" + Math.random().toString(36).slice(2, 8);

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .fetchMessages()
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
        setError("Could not connect to server. Is the backend running?");
        setLoading(false);
      });
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    const onNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onMessageUpdated = (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    };

    const onError = (error) => {
      console.error("Socket error received:", error);
    };

    socket.on("new_message", onNewMessage);
    socket.on("message_updated", onMessageUpdated);
    socket.on("error", onError);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_updated", onMessageUpdated);
      socket.off("error", onError);
    };
  }, []);

  const send = useCallback(async (content, sender) => {
    if (!content.trim()) return;
    try {
      await api.sendMessage(content, sender || "User");
    } catch (err) {
      setError("Failed to send message. Try again.");
    }
  }, []);

  const remove = useCallback(async (id, type) => {
    try {
      await api.deleteMessage(id, type, USER_ID);
    } catch (err) {
      setError("Failed to delete message. Try again.");
    }
  }, []);

  const pin = useCallback(async (id) => {
    try {
      await api.togglePin(id);
    } catch (err) {
      setError("Failed to pin message. Try again.");
    }
  }, []);

  // Filter out messages deleted "for me"
  const visibleMessages = messages.filter(
    (m) => !m.deletedFor?.includes(USER_ID)
  );

  return { messages: visibleMessages, loading, error, send, remove, pin };
}
