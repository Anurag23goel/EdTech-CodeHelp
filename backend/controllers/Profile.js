const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Courses");

exports.updateProfile = async (req, res) => {
  const { gender, dateOfBirth, about, contactNumber } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure the user has a profileDetails reference
    if (!user.profileDetails) {
      return res.status(400).json({
        success: false,
        message: "User does not have profile details to update",
      });
    }

    // Prepare update fields (omit undefined values)
    const updateFields = {};
    if (gender !== undefined) updateFields.gender = gender;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (about !== undefined) updateFields.about = about;
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;

    // Update the profile
    const profile = await Profile.findByIdAndUpdate(
      user.profileDetails,
      updateFields,
      { new: true } // Return the updated document
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the profile
    await Profile.findByIdAndDelete(user.profileDetails);

    // Delete the user from every course enrolled
    await Course.updateMany(
      { enrolledUsers: req.user.id },
      { $pull: { enrolledUsers: req.user.id } }
    );

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

exports.getProfileDetails = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.id).populate(
      "profileDetails",
      "gender dateOfBirth about contactNumber"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile: user.profileDetails,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};
