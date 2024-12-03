const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("otp-generator");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailSender");
require("dotenv").config();

// SignUp Function
exports.signUp = async (req, res) => {
  const { email, password, firstName, lastName, accountType } = req.body;

  try {
    // Checking if user already exists
    const result = await User.findOne({ email });

    if (result) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // Finding most recent otp realted to user's email
    const recentOtp = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp.otp);

    if (!recentOtp) {
      return res.status(401).json({
        success: false,
        message: "No OTP found",
      });
    } else {
      // Checking if otp is valid
      if (recentOtp.otp !== req.body.otp) {
        return res.status(401).json({
          success: false,
          message: "Invalid OTP",
        });
      }
    }

    // hashing Password

    // Creating new user
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      accountType,
      profileDetails: profileDetails._id,
      image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log("Error while signing up:", error);
    res.status(500).json({
      success: false,
      message: "Error while signing up",
    });
  }
};

// Login Function
exports.login = async (req, res) => {
  const { email, passsword } = req.body;

  try {
    // cheking if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    } else if (user.password !== passsword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    } else {
      const payload = {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      };

      // if user exists, generate a token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      // sending token in cookie in frontend
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "User logged in successfully",
        user,
      });
    }
  } catch (error) {
    console.log("error while login:", error);
    res.status(500).json({
      success: false,
      message: "Error while login",
    });
  }
};

// Sending OTP Function
exports.sendOtp = async (req, res) => {
  // fetch email from body
  const { email } = req.body;

  try {
    // Checking if user already exists
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generating OTP
    const generatedOtp = generateOtp(6, {
      specialChars: false,
      lowercase: false,
      uppercase: false,
    });
    console.log("OTP generated:", generatedOtp);

    //Checking OTP unique and generating new otp if bot unique
    let result = await Otp.findOne({ otp: generatedOtp });

    while (result) {
      generatedOtp = generateOtp(6, {
        specialChars: false,
        lowercase: false,
        uppercase: false,
      });
      console.log("OTP generated:", generatedOtp);
      result = await Otp.findOne({ otp: generatedOtp });
    }

    // Saving OTP in DataBase
    const otpObject = await Otp.create({
      email,
      otp: generatedOtp,
    });
    console.log("OTP saved in database:", otpObject);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Error while sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Changing Passoword Function
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // checking if user exists
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password",
      });
    } else {
      user.password = newPassword;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });

      // sending confirmation email
      const mailResponse = await sendEmail({
        to: req.user.email,
        subject: "Password Changed",
        message: "Password changed successfully",
      });
      console.log("Email sent successfully:", mailResponse);
    }
  } catch (error) {
    console.log("error while changing passwords", error);
    res.status(500).json({
      success: false,
      message: "Error while changing password",
    });
  }
};
