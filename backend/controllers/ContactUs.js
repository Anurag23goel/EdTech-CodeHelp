const User = require("../models/User");
const { sendEmail } = require("../utils/mailSender");
require("dotenv").config();

exports.contactUs = async (req, res) => {
  // fetching details
  const { firstName, lastName, email, phoneNumber, message } = req.body;
  const userId = req.user.id;

  try {
    // validating user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // sending email to user that your request has been received
    const mailToUser = await sendEmail({
      to: email,
      subject: `Application for contacting Study Notion Recevied`,
      message: `Hello ${firstName} ${lastName},<br><br>
        We have received your request for contacting Study Notion.<br><br>
        We will get back to you as soon as possible.<br><br>
        Thanks for using Study Notion.`,
    });

    // sending email to admin
    const mailToAdmin = await sendEmail({
      to: process.env.SMTP_EMAIL,
      subject: `Contact Us Request from ${firstName} ${lastName}`,
      message: `Name: ${firstName} ${lastName}<br>
        Email: ${email}<br>
        Phone Number: ${phoneNumber}<br>
        Message: ${message}`,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      mailToUser,
      mailToAdmin,
      contactUsDetails: JSON.stringify({
        firstName,
        lastName,
        email,
        phoneNumber,
        message,
      }),
    });
  } catch (error) {
    console.log("Error while sending contact us email", error);
    res.status(500).json({
      success: false,
      message: "Error while sending contact us email",
    });
  }
};
