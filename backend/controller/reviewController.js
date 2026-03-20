const Review = require("../models/review");

/* ============================
   CREATE REVIEW
============================ */
exports.createReview = async (req, res) => {
  try {
    const { message, created_by, created_by_name } = req.body;

    // Validation
    if (!message || !created_by || !created_by_name) {
      return res.status(400).json({
        success: false,
        message: "Message, user ID, and user name are required.",
      });
    }

    const review = await Review.create({
      message,
      created_by,
      created_by_name,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving review.",
    });
  }
};

/* ============================
   GET ALL REVIEWS
============================ */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews.",
    });
  }
};