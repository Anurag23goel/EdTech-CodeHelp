const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1] || req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id); //decodedToken.id => id is from payload created while logging in controller
    if (!user) {
      return res.status(401).json({ message: "Invalid user token" });
    } else {
      req.user = decodedToken;
    }
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Something went wrrong while validating Token" });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      res.status(401).json({
        success: false,
        message: "This is a protected route for students only",
      });
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "User cannot be authenticated" });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      res.status(401).json({
        success: false,
        message: "This is a protected route for instructors only",
      });
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "User cannot be authenticated" });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      res.status(401).json({
        success: false,
        message: "This is a protected route for admins only",
      });
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "User cannot be authenticated" });
  }
};
