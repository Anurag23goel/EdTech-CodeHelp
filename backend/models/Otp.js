const mongoose = require("mongoose");
const sendEmail = require("../utils/mailSender");
const uniqueValidator = require("mongoose-unique-validator");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 5 * 60, // 5 minutes
  },
});

// A function to send an email just before saving an OTP document
async function sendVerificationEmail(receiver, otp) {
  try {
    const mailResponse = await sendEmail({
      email: receiver,
      subject: "Verification Email",
      message: `Your OTP is: ${otp}`,
    });
    console.log("OTP sent successfully:", mailResponse);
  } catch (error) {
    console.log("Error while sending OTP email:", error);
    throw new Error("Failed to send verification email.");
  }
}

// Middleware to send an email before saving an OTP document
otpSchema.pre("save", async function (next) {
  try {
    await sendVerificationEmail(this.email, this.otp);
    next();
  } catch (error) {
    next(error); // Stop the save operation if email fails
  }
});

// Apply unique validation plugin
otpSchema.plugin(uniqueValidator, { message: "Email must be unique." });

module.exports = mongoose.model("Otp", otpSchema);