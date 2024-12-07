const nodeMailer = require("nodemailer");
require("dotenv").config();

exports.sendEmail = async ({ to, subject, message }) => {
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
      to: `${to}`,
      subject: `${subject}`,
      html: `${message}`,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
