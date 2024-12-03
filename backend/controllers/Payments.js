const Course = require("../models/Courses");
const User = require("../models/User");
const { instance } = require("../connections/razorpay");
const { sendEmail } = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");
const {
  courseEnrollmentEmail,
} = require("../mailTemplates/courseEnrollmentEmail");

exports.capturePayment = async (req, res) => {
  // fetch courseDetails from frontend and userId from middleware
  const { courseId } = req.body;
  const userId = req.user._id;

  // validation
  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course id is required",
    });
  }

  try {
    const courseDetails = await Course.findById(courseId);

    // validating courseDetails
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // checking if user is already enrolled in course
    const uid = mongoose.Types.ObjectId(userId);
    if (courseDetails.usersEnrolled.includes(uid)) {
      console.log("User is already enrolled in course");
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in course",
      });
    }

    // capturing payment
    const options = {
      amount: courseDetails.price * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    // initiating payment
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    // sending response
    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      courseName: courseDetails.name,
      courseImage: courseDetails.thumbnailImage,
      courseDescription: courseDetails.description,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log("Error while capturing payment", error);
    res.status(500).json({
      success: false,
      message: "Error while capturing payment",
    });
  }
};

exports.verifySignature = async (req, res) => {
  // fetch signature from razorpay (razorpay sends it in header)
  const signature = req.headers["x-razorpay-signature"];

  // encrypt our secret key to further match it with the one sent by razorpay
  const shasum = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // matching signtaure received by razorpay with our encrypted key
  if (signature !== digest) {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }

  // extracting courseId and userId from payload (we sent it in notes while sending options in creating order)
  const { courseId, userId } = req.body.payload.payment.entity.notes;

  try {
    // add studentId to courseId
    const enrolledCourse = await Course.findById(courseId);
    enrolledCourse.usersEnrolled.push(userId);
    await enrolledCourse.save();

    // add courseId to userId
    const user = await User.findById(userId);
    user.coursesEnrolled.push(courseId);
    await user.save();

    // send email to user
    const mailResponse = await sendEmail({
      to: user.email,
      subject: "Course Enrolled Successfully",
      message: courseEnrollmentEmail(enrolledCourse.name, user.name),
    });

    // returning response
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.log("Error while verifying signature", error);
    res.status(500).json({
      success: false,
      message: "Error while verifying signature",
    });
  }
};
