const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
