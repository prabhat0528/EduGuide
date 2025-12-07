const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Mentor", "Student"], 
  },
  profile_picture: {
    type: String,
    default: "", 
  },
  mychats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
