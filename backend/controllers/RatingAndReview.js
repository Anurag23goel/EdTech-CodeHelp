const Course = require("../models/Courses");
const User = require("../models/User");
const RatingAndReview = require("../models/RatingAndReview");

// creating a rating
exports.createReview = async (req, res) => {
  // fetch data from frontend
  const { rating, review, courseId } = req.body;
  const userId = req.user.id;

  try {
    // validate data
    if (!rating || !review || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // check if user is enrolled in that course or not
    const userDetails = await User.findById(userId);
    if (!userDetails.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled in this course",
      });
    }

    //  check is user has already rated the course or not
    const existingRating = await RatingAndReview.findOne({
      userId: userId,
      course: courseId,
    });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "User has already rated this course",
      });
    }

    // create rating and review
    const newRating = await RatingAndReview.create({
      userId: userId,
      course: courseId,
      rating,
      review,
    });

    // update course rating
    const updatedCourse = await Course.findById(courseId);
    updatedCourse.ratingAndReviews.push(RatingAndReview._id);
    await updatedCourse.save();

    // returning response
    res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      newRating,
    });
  } catch (error) {
    console.log("Error while creating rating");
    res
      .status(500)
      .json({ success: false, message: "Error while creating rating", error });
  }
};

// getting average rating
exports.getAverageRating = async (req, res) => {
  // fetch Course id from frontend
  const { courseId } = req.body;

  try {
    // validate data
    const courseDetails = await Course.findById(courseId).populate({
      path: "ratingAndReviews",
      populate: { path: "rating" },
    });
    if (!courseDetails) {
      return res.status(200).json({
        success: false,
        message: "Course Id is incorrect",
      });
    }

    // calculating average rating (aggregate functions retruns an array)
    const averageRating = await RatingAndReview.aggregate([
      { $match: { course: courseId } },
      { $group: { _id: null }, averageRating: { $avg: "$rating" } },
    ]);

    // if average rating is present
    if (averageRating.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        averageRating: averageRating[0].averageRating,
      });
    }
    //  if not ratings are present till now
    else {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        averageRating: averageRating[0].averageRating,
      });
    }
  } catch (error) {
    console.log("Error while getting Avg Rating", error.message);
    res.status(500).json({
      success: false,
      message: "Error while getting Avg Rating",
    });
  }
};

// getting all ratings
exports.getAllRatings = async (req, res) => {
  const { courseId } = req.body;

  try {
    // validating Course Id
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(200).json({
        success: false,
        message: "Course Id is incorrect",
      });
    }

    // fetch all ratings with user name and course name
    const allRatings = await RatingAndReview.find({
      course: courseId,
    })
      .sort({ rating: "desc" })
      .populate("userId", "firstName lastName")
      .populate("course", "name")
      .exec();

    res.status(200).json({
      success: true,
      message: "All ratings fetched successfully",
      allRatings,
    });
  } catch (error) {
    console.log("Error while getting all ratings");
    res.status(500).json({
      success: false,
      message: "Error while getting all ratings",
    });
  }
};

