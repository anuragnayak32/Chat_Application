const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: String,
      default: "You", // No auth, so we just use a default
    },
    // "deleted for everyone" — replaces content with a tombstone
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    // "deleted for me" — array of userIds who hid this message
    // Since there's no auth, we store a mock userId from the client
    deletedFor: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
