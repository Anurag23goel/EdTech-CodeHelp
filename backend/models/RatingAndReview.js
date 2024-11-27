const mongoose = requrie("mongoose");

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
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
