const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    acoountType: {
      enum: ["Admin", "User", "Instructor"],
      type: String,
    },
    active: {
      type: Boolean,
    },
    approved: {
      type: Boolean,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    profileDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    courseProgress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);