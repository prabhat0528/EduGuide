const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo").default;
const session = require("express-session");
const auth_routes = require("./routes/auth_routes");
const mentor_routes = require("./routes/mentor_routes");

const cors = require("cors");

const app = express();

/* --------------------- CORS CONFIG --------------------- */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,               
  })
);

/* --------------------- SESSION CONFIG --------------------- */
const sessionOptions = {
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
};

app.use(cookieParser());
app.use(express.json());
app.use(session(sessionOptions));

/* --------------------- ROUTES --------------------- */
app.use("/api/auth", auth_routes);
app.use("/api/mentors", mentor_routes);

/* --------------------- DB CONNECT --------------------- */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

/* --------------------- ROOT --------------------- */
app.get("/", (req, res) => {
  res.send("This is root");
});

/* --------------------- SERVER --------------------- */
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
