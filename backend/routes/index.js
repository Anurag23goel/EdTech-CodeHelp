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
router.post("/categories", authenticateUser, isAdmin, createCategory);
router.get("/categories", fetchAllCategory);
router.get("/categories/:id", categoryPageDetails);

// Course routes
router.post("/courses", authenticateUser, isInstructor, createCourse); // Only instructors can create courses
router.get("/courses", fetchAllCourses); // Public
router.get("/courses/:id", getCourseDetails); // Public

// Payment routes (authentication needed for payments)
router.post("/payments/capture", authenticateUser, capturePayment);
router.post("/payments/verify", authenticateUser, verifySignature);

// Profile routes
router.put("/profile", authenticateUser, updateProfile);
router.delete("/profile", authenticateUser, deleteAccount);
router.get("/profile", authenticateUser, getProfileDetails);

// Rating and review routes
router.post("/reviews", authenticateUser, isStudent, createReview); // Only students can review
router.get("/reviews/average", getAverageRating); // Public
router.get("/reviews", getAllRatings); // Public

// Reset password routes (no auth required)
router.post("/password/resetlink", sendingResetPasswordLink);
router.post("/password/update", updatePassword);

// Section routes (only instructors can manage sections)
router.post("/sections", authenticateUser, isInstructor, createSection);
router.put("/sections/:id", authenticateUser, isInstructor, updateSection);
router.delete("/sections/:id", authenticateUser, isInstructor, deleteSection);

// Subsection routes (only instructors can manage subsections)
router.post("/subsections", authenticateUser, isInstructor, createSubsection);

// Contact us route (public)
router.post("/contact-us", contactUs);

module.exports = router;
