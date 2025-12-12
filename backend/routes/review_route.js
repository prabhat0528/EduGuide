const express = require("express");
const Review = require("../models/review");

const router = express.Router();

/*---------------------- Saving Reviews ---------------------------------*/
router.post("/create", async (req, res) => {
  try {
    const { message, created_by,name } = req.body;

    // Validate fields
    if (!message || !created_by) {
      return res.status(400).json({
        success: false,
        message: "Message and user ID are required.",
      });
    }

    // Create new review
    const review = await Review.create({
      message,
      created_by,
      name
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review,
    });

  } catch (error) {
    console.error("Error saving review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving review.",
    });
  }
});

module.exports = router;
