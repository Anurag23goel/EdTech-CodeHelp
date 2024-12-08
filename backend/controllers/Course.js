const User = require("../models/User");
const Course = require("../models/Course");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// Creating a new Course
exports.createCourse = async (req, res) => {
  // Fetch data from backend
  const { name, description, whatWillYouLearn, price, category } = req.body;

  // Fetch image File
  const imageFile = req.files.thumbnailImage;

  try {
    // validate data
    if (
      !name ||
      !description ||
      !whatWillYouLearn ||
      !price ||
      !category ||
      !imageFile
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // isIntructor valid or not
    // console.log("User fetched from auth middleware:", req.user);

    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructors only",
      });
    }

    // is category valid or not
    const categoryDetails = await Category.findOne({ _id: category });
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "category does not exist",
      });
    }

    // upload image to cloudinary
    const uploadedImage = await uploadImageToCloudinary(
      imageFile,
      process.env.FOLDER_NAME,
      400,
      400
    );

    // create course in database
    const newCourse = await Course.create({
      name,
      description,
      whatWillYouLearn,
      price,
      thumbnailImage: uploadedImage.url,
      instructor: req.user.id,
      category: categoryDetails._id,
    });

    // console.log("New Course Created Details:", newCourse);

    // add course entry in user model corresponding to that user
    const userDetails = await User.findById(req.user.id);
    userDetails.courses.push(newCourse._id);
    await userDetails.save();

    // add corresponding course entry in category model
    categoryDetails.courses.push(newCourse._id);
    await categoryDetails.save();

    // return response
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.log("Error while creating course", error);
    res.status(500).json({
      success: false,
      message: "Error while creating course",
    });
  }
};

// Fetching all Courses
exports.fetchAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      { name: true, description: true, thumbnailImage: true, price: true }
    )
      .populate("instructor", "name")
      .populate("category", "name");
    res.status(200).json({
      success: true,
      message: "All Courses Fetched Successfully",
      allCourses,
    });
  } catch (error) {
    console.log("Error while fetching all courses", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching all courses",
    });
  }
};

// Get Single Course Details
exports.getCourseDetails = async (req, res) => {
  const { courseId } = req.body;

  try {
    // fetch course details populating all the required fields
    const courseDetails = await Course.findById(courseId)
      .populate({ path: "instructor", select: "-password -_id -__v", populate: { path: "profileDetails", select: "-_id -__v" } })
      .populate("category", "name -_id")
      .populate("usersEnrolled", "name")
      .populate({ path: "courseContent", select: "-_id", populate: { path: "subSection", select: "-_id" } })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      courseDetails,
    });
  } catch (error) {
    console.log("Error while fetching course details", error);
    res.status(200).json({
      success: false,
      message: "Error while fetching course details",
    });
  }
};
