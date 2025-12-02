const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
      enum: ["Student", "Mentor"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    social_url: {
      type: String,
      default: "",
    },

    profile_picture: {
      type: String, 
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwTjn7ADTGtefL4Im3WluJ6ersByvJf8k7-Q&s",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
