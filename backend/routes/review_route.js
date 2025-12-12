const express = require("express");
const Review = require("../models/review");

const router = express.Router();

/*---------------------- Saving Reviews ---------------------------------*/
router.post("/create", async (req, res) => {
  try {
    const { message, created_by, created_by_name } = req.body;

    // Validate fields
    if (!message || !created_by || !created_by_name) {
      return res.status(400).json({
        success: false,
        message: "Message, user ID, and user name are required.",
      });
    }

    // Create new review
    const review = await Review.create({
      message,
      created_by,
      created_by_name
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


/*---------------------- Get All Reviews ---------------------------------*/
router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews.",
    });
  }
});