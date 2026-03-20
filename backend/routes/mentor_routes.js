const express = require("express");
const router = express.Router();

const mentorController = require("../controllers/mentorController");

/* ============================
   ROUTES
============================ */

// GET ALL MENTORS
router.get("/getmentors", mentorController.getMentors);

// GET MENTOR PROFILE BY ID
router.get("/:id", mentorController.getMentorById);

module.exports = router;