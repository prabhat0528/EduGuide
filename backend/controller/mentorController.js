const User = require("../models/user_model");

/* ============================
   GET ALL MENTORS
============================ */
exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "Mentor" }).select("-password");

    if (!mentors.length) {
      return res.status(404).json({ message: "No mentors found" });
    }

    res.status(200).json({
      message: "Mentors fetched successfully",
      mentors,
    });
  } catch (err) {
    console.error("GET MENTORS ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================
   GET MENTOR BY ID
============================ */
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id).select("-password");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json({
      success: true,
      mentor,
    });
  } catch (error) {
    console.error("GET MENTOR BY ID ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};