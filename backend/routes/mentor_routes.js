const express = require("express");
const User = require("../models/user_model");

const router = express.Router();

// GET ALL MENTORS
router.get("/getmentors", async (req, res) => {
  try {
    // console.log("Mentor route hit")
    const mentors = await User.find({ role: "Mentor" }).select("-password");

    if (!mentors.length) {
      return res.status(404).json({ message: "No mentors found" });
    }

    res.status(200).json({
      message: "Mentors fetched successfully",
      mentors,
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//Get Mentor Profile
router.get("/:id", async (req, res) => {
  try {
    // console.log("Mentor Profile route hit")
    const mentor = await User.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json({
      success: true,
      mentor,
    });

  } catch (error) {
    console.error("Error fetching mentor:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
