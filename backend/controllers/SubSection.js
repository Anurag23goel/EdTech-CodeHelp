const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubsection = async (req, res) => {
  // fetch data from frontend including video file
  const { title, timeDuration, description, sectionId } = req.body;
  const videoFile = req.files.videoFile;

  // validate data
  if (!title || !timeDuration || !description || !videoFile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // upload video file to cloudinary
  const result = await uploadImageToCloudinary(
    videoFile,
    process.env.FOLDER_NAME
  );

  // create subsection in database
  const subsection = await SubSection.create({
    title,
    timeDuration,
    description,
    videoUrl: result.secure_url,
  });

  // add subsection objectID to section in database
  const updatedSection = await Section.findById(sectionId);
  updatedSection.subSection.push(subsection._id);
  await updatedSection.save();

  // retrun response
  res.status(201).json({
    success: true,
    message: "Subsection created successfully",
    subsection,
  });
};
