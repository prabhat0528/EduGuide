const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo").default;
const session = require("express-session");

const auth_routes = require("./routes/auth_routes");
const mentor_routes = require("./routes/mentor_routes");
const review_route = require("./routes/review_route");

const Conversation = require("./models/conversation_schema");
const Message = require("./models/message_schema");
const User = require("./models/user_model");

const cors = require("cors");

const app = express();

/* --------------------- CORS --------------------- */
app.use(
  cors({
    origin: "https://eduguide-vhmi.onrender.com",
    credentials: true,
  })
);

/* --------------------- MIDDLEWARE --------------------- */
app.use(express.json());
app.use(cookieParser());

/* --------------------- SESSION --------------------- */
app.use(
  session({
    name: "eduguide.sid",
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);

/* --------------------- ROUTES --------------------- */
app.use("/api/auth", auth_routes);
app.use("/api/mentors", mentor_routes);
app.use("/reviews", review_route);

/* --------------------- DATABASE --------------------- */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB error:", err));

/* --------------------- ROOT --------------------- */
app.get("/", (req, res) => {
  res.send("Server running...");
});

/* ------------------------------------------------------
       CREATE or RETURN EXISTING CONVERSATION
------------------------------------------------------ */
app.post("/api/conversation", async (req, res) => {
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

    return res.json(conversation);
  } catch (err) {
    console.error("Conversation Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------
       ADD conversation to BOTH USER PROFILES
------------------------------------------------------ */
app.post("/api/chat/addToUsers", async (req, res) => {
  const { conversationId, userId, mentorId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { mychats: conversationId },
    });

    await User.findByIdAndUpdate(mentorId, {
      $addToSet: { mychats: conversationId },
    });

    return res.json({ message: "Conversation added to users" });
  } catch (err) {
    console.error("AddToUsers Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------
       GET ALL CHATS FOR A USER
------------------------------------------------------ */
app.get("/api/chat/mychats/:userId", async (req, res) => {
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
});

/* ------------------------------------------------------
       GET MESSAGES FOR A CONVERSATION
------------------------------------------------------ */
app.get("/api/chat/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Message Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* --------------------- SOCKET.IO --------------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://eduguide-vhmi.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join chat", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  socket.on("new message", async (payload) => {
    try {
      const { conversationId, senderId, message } = payload;

      const newMessage = await Message.create({
        conversationId,
        sender: senderId,
        message: message.content,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
      });

      const populated = await Message.findById(newMessage._id).populate(
        "sender",
        "name profile_picture"
      );

      io.to(conversationId).emit("message received", populated);
    } catch (err) {
      console.error("Socket Send Message Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* --------------------- SERVER --------------------- */
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
