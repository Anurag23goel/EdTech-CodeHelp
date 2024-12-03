const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  review: {
    type: String,
    trim: true,
    required: true,
  },
  rating: {
    type: Number,
    requiured: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
