const express = require("express");
const router = express.Router();

const { profileUpload } = require("../cloudinary_config");
const authController = require("../controllers/authController");

/* ============================
   ROUTES
============================ */

router.post(
  "/signup",
  profileUpload.single("profile_picture"),
  authController.signup
);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.put(
  "/update-profile",
  profileUpload.single("profile_picture"),
  authController.updateProfile
);

router.post("/save-roadmap", authController.saveRoadmap);

router.get("/me", authController.getCurrentUser);

module.exports = router;