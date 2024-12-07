const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name: name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Category created successfully",
        category,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating Category", error });
  }
};

exports.fetchAllCategory = async (req, res) => {
  try {
    const categoryDetails = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      categoryDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories", error });
  }
};

exports.categoryPageDetails = async (req, res) => {
  // get category id
  const categoryId = req.params.id;

  try {
    // finding category corresponding to category id
    const categoryDetails = await Category.findById(categoryId).populate({
      path: "courses",
      populate: { path: "instructor" },
    });

    // validating category
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // finding categories other than the category Id
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");

    // finding top selling courses in the category
    const topSellingCourses = await Course.aggregate([
      { $match: { category: categoryId } },
      { $addFields: { totalStudentsEnrolled: { $size: "$usersEnrolled" } } },
      { $sort: { totalStudentsEnrolled: -1 } },
      { $limit: 3 },
    ]);

    // returning response
    res.status(200).json({
      success: true,
      message: "Category details fetched successfully",
      categoryDetails,
      differentCategories,
      topSellingCourses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories", error });
  }
};
