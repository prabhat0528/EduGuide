const express = require("express");
const bcrypt = require("bcryptjs");
const Roadmap = require("../models/roadmap_schema");
const User = require("../models/user_model");
const { profileUpload } = require("../cloudinary_config");

const router = express.Router();

/* ============================
   SIGNUP
============================ */
router.post("/signup", profileUpload.single("profile_picture"), async (req, res) => {
  try {
    const { name, email, password, role, description, social_url } = req.body;

    if (!name || !email || !password || !role || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const profilePicUrl = req.file ? req.file.path : "https://via.placeholder.com/150";
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      description,
      social_url: social_url || "",
      profile_picture: profilePicUrl,
      roadmap: []
    });

    // Save user id in session
    req.session.userId = newUser._id;

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================
   LOGIN
============================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Save user id in session
    req.session.userId = user._id;

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================
   LOGOUT
============================ */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

/* ============================
   UPDATE PROFILE
============================ */
router.put("/update-profile", profileUpload.single("profile_picture"), async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, role, description, social_url } = req.body;

    if (req.file) user.profile_picture = req.file.path;
    if (name) user.name = name;
    if (role) user.role = role;
    if (description) user.description = description;
    if (social_url) user.social_url = social_url;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================
   SAVE ROADMAP  FIXED
============================ */
router.post("/save-roadmap", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ message: "Unauthorized" });

    const { topic, content } = req.body;

    const newRoadmap = await Roadmap.create({
      topic,
      content: JSON.stringify(content)
    });

    await User.findByIdAndUpdate(req.session.userId, {
      $push: { roadmap: newRoadmap._id }
    });

    res.status(201).json({ success: true, roadmap: newRoadmap });
  } catch (err) {
    console.error("SAVE ROADMAP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================
   GET CURRENT USER
============================ */
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });

  const user = await User.findById(req.session.userId).populate("roadmap");
  res.json({ success: true, user });
});

module.exports = router;
