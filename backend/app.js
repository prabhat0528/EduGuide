const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo").default;
const session = require("express-session");
const cors = require("cors");

/* --------------------- ROUTES --------------------- */
const auth_routes = require("./routes/auth_routes");
const mentor_routes = require("./routes/mentor_routes");
const review_route = require("./routes/review_route");
const chat_routes = require("./routes/chatRoutes");

/* --------------------- MODELS  --------------------- */
const Conversation = require("./models/conversation_schema");
const Message = require("./models/message_schema");

/* --------------------- APP INIT --------------------- */
const app = express();
app.set("trust proxy", 1);

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
      secure: true,
      sameSite: "none",
    },
  })
);

/* --------------------- ROUTES --------------------- */
app.use("/api/auth", auth_routes);
app.use("/api/mentors", mentor_routes);
app.use("/reviews", review_route);
app.use("/api/chat", chat_routes);  

/* --------------------- DATABASE --------------------- */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB error:", err));

/* --------------------- ROOT --------------------- */
app.get("/", (req, res) => {
  res.send("Server running...");
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

  /* JOIN ROOM */
  socket.on("join chat", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  /* SEND MESSAGE */
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

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "sender",
        "name profile_picture"
      );

      io.to(conversationId).emit("message received", populatedMessage);
    } catch (err) {
      console.error("Socket Send Message Error:", err);
    }
  });

  /* DISCONNECT */
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* --------------------- SERVER --------------------- */
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});