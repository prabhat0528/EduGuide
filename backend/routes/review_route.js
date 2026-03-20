const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

/* ============================
   ROUTES
============================ */

// CREATE REVIEW
router.post("/", reviewController.createReview);

// GET ALL REVIEWS
router.get("/", reviewController.getAllReviews);

module.exports = router;