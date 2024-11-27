const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {},
  description: {},
});

module.exports = mongoose.model("Course", courseSchema);
