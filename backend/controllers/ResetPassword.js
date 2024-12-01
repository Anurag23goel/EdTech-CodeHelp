const User = require("../models/User");
const { sendEmail } = require("../utils/mailSender");

// Sending Reset Password FrontEnd Link Function
exports.sendingResetPasswordLink = async (req, res) => {
  // fetch email from body
  const { email } = req.body;

  try {
    // check if user already exists or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    // generate a token
    const token = crypto.randomUUID();

    // adding token and expiry time to user doc in database
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    // create the url to be sent
    const url = `http://localhost:3000/reset-password/${token}`;

    // send the url to user in mail and return success message
    const maiLResponse = sendEmail(
      email,
      "Reset Password Link",
      `Click on this link to reset password: ${url}`
    );
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log("Error while sending reset password link:", error.message);
    res.status(500).json({
      success: false,
      message: "Error while sending reset password link",
    });
  }
};

// Updating Password in DataBase
exports.updatePassword = async (req, res) => {
  // get details from body
  const { token, newPassword } = req.body;

  try {
    // chech if user exists or not and if user exists the token is expired or not
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }

    if (user.resetPasswordTokenExpiry < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token Expired",
      });
    }

    // updating the password in database
    const updatedUser = await User.findOneAndUpdate(
      { resetPasswordToken: token },
      { password: newPassword },
      { new: true }
    );

    // returning response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error while updating password:", error.message);
    res.status(500).json({
      success: false,
      message: "Error while updating password",
    });
  }
};
