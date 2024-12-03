const mongoose = require("mongoose");
require("dotenv").config();
exports.dbConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};
