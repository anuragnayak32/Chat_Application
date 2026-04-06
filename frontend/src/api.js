const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchMessages = async () => {
  try {
    const response = await fetch(`${BASE}/messages`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const sendMessage = async (content, sender) => {
  try {
    const response = await fetch(`${BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sender }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const deleteMessage = async (id, type, userId) => {
  try {
    const response = await fetch(`${BASE}/messages/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, userId }),
    });
    if (!response.ok) throw new Error("Failed to delete message");
    return response.json();
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const togglePin = async (id) => {
  try {
    const response = await fetch(`${BASE}/messages/${id}/pin`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to toggle pin");
    return response.json();
  } catch (error) {
    console.error("Error toggling pin:", error);
    throw error;
  }
};
