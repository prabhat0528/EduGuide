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

app.use(cookieParser());
app.use(express.json());

/* --------------------- SESSION --------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

/* --------------------- ROUTES --------------------- */
app.use("/api/auth", auth_routes);
app.use("/api/mentors", mentor_routes);

/* --------------------- DB --------------------- */
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
    console.error(err);
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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  //  Client sends 'join chat' with the conversationId
  socket.on("join chat", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  //  Client sends 'new message' with the payload
  socket.on("new message", async (payload) => {
    try {
      
      const { conversationId, senderId, message } = payload;

      // 1. Create a new Message document in the DB
      const newMessage = await Message.create({
        conversationId,
        sender: senderId,
        message: message.content, 
      });

      // 2. Update the Conversation's lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
      });

      // 3. Populate the sender details for the message
      const populated = await Message.findById(newMessage._id).populate(
        "sender",
        "name profile_picture"
      );

      // 4. Emit the populated message to all clients in the conversation room
     
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
server.listen(9000, () => {
  console.log("Server running on port 9000");
});