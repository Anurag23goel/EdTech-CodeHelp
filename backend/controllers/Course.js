const User = require("../models/User");
const Course = require("../models/Courses");
const Tags = require("../models/Tags");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Creating a new Course
exports.createCourse = async (req, res) => {
  // Fetch data from backend
  const { name, description, whatWillYouLearn, price, tag } = req.body;

  // Fetch image File
  const imageFile = req.files.thumbnailImage;

  try {
    // validate data
    if (
      !name ||
      !description ||
      !whatWillYouLearn ||
      !price ||
      !tag ||
      !imageFile
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // isIntructor valid or not
    console.log("User fetched from auth middleware:", req.user);

    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructors only",
      });
    }

    // is Tag valid or not
    const tagDetails = await Tags.findOne({ name: tag });
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag does not exist",
      });
    }

    // upload image to cloudinary
    const uploadedImage = await uploadImageToCloudinary(
      process.env.FOLDER_NAME,
      imageFile,
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
      instructor: req.user._id,
      tag: tagDetails._id,
    });

    console.log("New Course Created Details:", newCourse);

    // add course entry in user model corresponding to that user
    const userDetails = await User.findById(req.user._id);
    userDetails.courses.push(newCourse._id);
    await userDetails.save();

    // add corresponding course entry in tag model
    tagDetails.courses.push(newCourse._id);
    await tagDetails.save();

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
      .populate("tag", "name");
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
