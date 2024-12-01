const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tag = await Category.create({
      name,
      description,
    });
    res
      .status(201)
      .json({ success: true, message: "Tag created successfully", tag });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating tag", error });
  }
};

exports.fetchAllCategory = async (req, res) => {
  try {
    const categoryDetails = await Category.find(
      {},
      { name: true, description: true }
    );
    res
      .status(200)
      .json({
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
