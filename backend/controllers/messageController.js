const Message = require("../models/Message");

// GET /messages
// Returns all messages (client filters "deleted for me" based on userId)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// POST /messages
const sendMessage = async (req, res) => {
  const { content, sender } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Message content is required" });
  }

  if (content.trim().length > 5000) {
    return res.status(400).json({ error: "Message too long (max 5000 chars)" });
  }

  try {
    const message = await Message.create({
      content: content.trim(),
      sender: sender || "You",
    });

    // Emit real-time event to all connected clients
    const io = req.app.get("io");
    io.emit("new_message", message);

    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// DELETE /messages/:id
// body: { type: "me" | "everyone", userId: string }
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const { type, userId } = req.body;

  if (!type || !["me", "everyone"].includes(type)) {
    return res.status(400).json({ error: 'type must be "me" or "everyone"' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (type === "everyone") {
      message.deletedForEveryone = true;
      message.content = "This message was deleted";
    } else {
      // "Delete for me" — just add userId to the deletedFor array
      const uid = userId || "default_user";
      if (!message.deletedFor.includes(uid)) {
        message.deletedFor.push(uid);
      }
    }

    await message.save();

    const io = req.app.get("io");
    io.emit("message_updated", message);

    res.json(message);
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// PUT /messages/:id/pin
const togglePin = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    message.isPinned = !message.isPinned;
    await message.save();

    const io = req.app.get("io");
    io.emit("message_updated", message);

    res.json(message);
  } catch (err) {
    console.error("Error toggling pin:", err);
    res.status(500).json({ error: "Failed to toggle pin" });
  }
};

module.exports = { getMessages, sendMessage, deleteMessage, togglePin };
