const mongoose = require("mongoose");

const Review = mongoose.model({
    message:{
        type: String,
        required: true
    },
    created_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
},{ timestamps: true });

const reviewSchema = mongoose.model("Review",Review);

module.exports = reviewSchema;