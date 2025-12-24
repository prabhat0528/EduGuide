const express = require("express");
const bcrypt = require("bcryptjs");
const Roadmap = require("../models/roadmap_schema")
const User = require("../models/user_model");
const { profileUpload } = require("../cloudinary_config");

const router = express.Router();

/* SIGNUP */
router.post("/signup", profileUpload.single("profile_picture"), async (req, res) => {
  try {
    const { name, email, password, role, description, social_url } = req.body;

    if (!name || !email || !password || !role || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const profilePicUrl = req.file ? req.file.path : "https://via.placeholder.com/150";
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      description,
      social_url: social_url || "",
      profile_picture: profilePicUrl,
    });

    await newUser.save();

    // Save user id in session
    req.session.userId = newUser._id;

    res.status(201).json({
      message: "Signup successful",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Save user id in session
    req.session.userId = user._id;

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* LOGOUT */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});



/* UPDATE PROFILE */
router.put(
  "/update-profile",
  profileUpload.single("profile_picture"),
  async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { name, role, description, social_url } = req.body;

      if (req.file) {
        user.profile_picture = req.file.path; 
      }

      // Update text fields
      if (name) user.name = name;
      if (role) user.role = role;
      if (description) user.description = description;
      if (social_url) user.social_url = social_url;

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



router.post("/save-roadmap", async (req, res) => {
  try {
    const { topic, content } = req.body;
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });

  
    const newRoadmap = new Roadmap({
      topic,
      content: JSON.stringify(content), 
    });
    await newRoadmap.save();

    
    await User.findByIdAndUpdate(req.session.userId, {
      $push: { roadmap: newRoadmap._id }
    });

    res.status(201).json({ success: true, roadmap: newRoadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = await User.findById(req.session.userId).populate("roadmap");
  res.json({ user });
});

module.exports = router;
