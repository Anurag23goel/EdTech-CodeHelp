 const express = require("express");
const router = express.Router();

// Import controllers
const { signUp, login, sendOtp, changePassword } = require("../controllers/UserAuth");
const { createCategory, fetchAllCategory, categoryPageDetails } = require("../controllers/Category");
const { createCourse, fetchAllCourses, getCourseDetails } = require("../controllers/Course");
const { capturePayment, verifySignature } = require("../controllers/Payments");
const { updateProfile, deleteAccount, getProfileDetails } = require("../controllers/Profile");
const { createReview, getAverageRating, getAllRatings } = require("../controllers/RatingAndReview");
const { sendingResetPasswordLink, updatePassword } = require("../controllers/ResetPassword");
const { createSection, updateSection, deleteSection } = require("../controllers/Section");
const { createSubsection } = require("../controllers/SubSection");
const { contactUs } = require("../controllers/ContactUs");

// Import middlewares
const { authenticateUser, isStudent, isInstructor, isAdmin } = require("../middlewares/authMiddleware");

// User authentication routes (no middleware needed as these are public)
router.post("/signup", signUp);
router.post("/login", login);
router.post("/sendotp", sendOtp);
router.post("/change-password", authenticateUser, changePassword); // Authenticate before password change

// Category routes (only admins should create categories)
router.post("/createCategory", authenticateUser, isAdmin, createCategory);
router.get("/showAllCategories", fetchAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

// Course routes
router.post("/createCourse", authenticateUser, isInstructor, createCourse); // Only instructors can create courses
router.get("/getAllCourses", fetchAllCourses); // Public
router.get("/getCourseDetails", getCourseDetails); // Public

// Payment routes (authentication needed for payments)
router.post("/capturePayment", authenticateUser, capturePayment);
router.post("/payments/verify", authenticateUser, verifySignature);

// Profile routes
router.put("/updateProfile", authenticateUser, updateProfile);
router.delete("/deleteProfile", authenticateUser, deleteAccount);
router.get("/getUserDetails", authenticateUser, getProfileDetails);

// Rating and review routes
router.post("/createRating", authenticateUser, isStudent, createReview); // Only students can review
router.get("/getAverageRating", getAverageRating); // Public
router.get("/getReviews", getAllRatings); // Public

// Reset password routes (no auth required)
router.post("/reset-password-token", sendingResetPasswordLink);
router.post("/reset-password", updatePassword);

// Section routes (only instructors can manage sections)
router.post("/addSection", authenticateUser, isInstructor, createSection);
router.post("/updateSection", authenticateUser, isInstructor, updateSection);
router.post("/deleteSection", authenticateUser, isInstructor, deleteSection);

// Subsection routes (only instructors can manage subsections)
router.post("/addSubSection", authenticateUser, isInstructor, createSubsection);

// Contact us route (public)
router.post("/contact-us", contactUs);

module.exports = router;
