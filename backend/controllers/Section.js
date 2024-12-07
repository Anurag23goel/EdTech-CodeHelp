const Course = require("../models/Course");
const Section = require("../models/Section");
const Subsection = require("../models/SubSection");

// create section controller
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    

    // validating incoming data
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Creating new section
    const section = await Section.create({
      sectionName,
    });

    // adding the section to course
    const courseDetails = await Course.findById(courseId);
    courseDetails.courseContent.push(section._id);
    await courseDetails.save();

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    console.log("Error while creating section", error);
    res.status(500).json({
      success: false,
      message: "Error while creating section",
    });
  }
};

// update section controller
exports.updateSection = async (req, res) => {
  try {
    // fetch data from frontend
    const { sectionName } = req.body;
    const sectionId = req.params.id;

    // validate data
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // update section in database
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { name: sectionName },
      { new: true }
    );

    // return response
    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updatedSection,
    });
  } catch (error) {
    console.log("Error while updating section", error);
    res.status(500).json({
      success: false,
      message: "Error while updating section",
    });
  }
};

// delete section controller
exports.deleteSection = async (req, res) => {
  try {
    // fetch data from frontend
    const sectionId = req.params.id;

    // validate data
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // delete section from database
    const deletedSection = await Section.findByIdAndDelete(sectionId);

    // // delete subsections from database
    // const deletedSubsections = await Subsection.deleteMany({
    //   section: sectionId,
    // });

    // delete section from course
    const courseDetails = await Course.findById(deletedSection.course);
    courseDetails.courseContent.pull(sectionId);
    await courseDetails.save();

    // return response
    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      deletedSection,
      deletedSubsections,
    });
  } catch (error) {
    console.log("Error while deleting section", error);
    res.status(500).json({
      success: false,
      message: "Error while deleting section",
    });
  }
};
