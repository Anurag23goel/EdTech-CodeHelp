const nodeMailer = require("nodemailer");
require("dotenv").config();

exports.sendEmail = async (receiver, subject, message) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error(
      "SMTP_EMAIL or SMTP_PASSWORD is not defined in the environment variables."
    );
  }

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const response = await transporter.sendMail({
      from: `Study Notion <${process.env.SMTP_EMAIL}>`,
      to: `${receiver}`,
      subject: `${subject}`,
      text: `${message}`,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


