const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Middleware to authenticate the user
exports.authenticateUser = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Token is missing or invalid" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id); // Ensure the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid user token" });
    }

    req.user = decodedToken; // Attach decoded token to request
    next();
  } catch (error) {
    console.error("Token validation error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is a student
exports.isStudent = (req, res, next) => {
  if (req.user.accountType !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This route is for students only.",
    });
  }
  next();
};

// Middleware to check if user is an instructor
exports.isInstructor = (req, res, next) => {
  if (req.user.accountType !== "Instructor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This route is for instructors only.",
    });
  }
  next();
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user.accountType !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This route is for admins only.",
    });
  }
  next();
};
