const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary Storage Configuration
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EduGuide",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

// Upload Middleware
const profileUpload = multer({ storage: profileStorage });

// Export both cloudinary + upload
module.exports = {
  cloudinary,
  profileUpload,
};
