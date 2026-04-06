const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage,
  togglePin,
} = require("../controllers/messageController");

router.get("/", getMessages);
router.post("/", sendMessage);
router.delete("/:id", deleteMessage);
router.put("/:id/pin", togglePin);

module.exports = router;
