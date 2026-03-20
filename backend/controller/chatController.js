const Conversation = require("../models/conversation_schema");
const Message = require("../models/message_schema");
const User = require("../models/user_model");

/* ============================
   CREATE OR GET CONVERSATION
============================ */
exports.createOrGetConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    res.json(conversation);
  } catch (err) {
    console.error("Conversation Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================
   ADD CHAT TO USERS
============================ */
exports.addChatToUsers = async (req, res) => {
  const { conversationId, userId, mentorId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { mychats: conversationId },
    });

    await User.findByIdAndUpdate(mentorId, {
      $addToSet: { mychats: conversationId },
    });

    res.json({ message: "Conversation added to users" });
  } catch (err) {
    console.error("AddToUsers Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================
   GET USER CHATS
============================ */
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Conversation.find({
      participants: req.params.userId,
    })
      .populate("participants", "name profile_picture role")
      .populate("lastMessage");

    res.json(chats);
  } catch (err) {
    console.error("Fetch Chats Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================
   GET MESSAGES
============================ */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Message Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};