const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

/* ============================
   CHAT ROUTES
============================ */

// Create or get conversation
router.post("/conversation", chatController.createOrGetConversation);

// Add chat to users
router.post("/addToUsers", chatController.addChatToUsers);

// Get all chats of a user
router.get("/mychats/:userId", chatController.getUserChats);

// Get messages of a conversation
router.get("/messages/:conversationId", chatController.getMessages);

module.exports = router;