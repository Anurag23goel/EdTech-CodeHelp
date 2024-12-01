const Tags = require("../models/Tags");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tag = await Tags.create({
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

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tags.find({}, { name: true, description: true });
    res
      .status(200)
      .json({ success: true, message: "All tags fetched successfully", tags });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching tags", error });
  }
};
