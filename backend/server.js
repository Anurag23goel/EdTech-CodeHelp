const express = require("express");
const cors = require("cors");
const expressfileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cookieParser = require("cookie-parser");
const { dbConnection } = require("./connections/dbConnection");
const routes = require("./routes/index");
require("dotenv").config();

// Initializing Server (App == Application)
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(expressfileupload());
app.use(cookieParser());
app.use("/api/v1", routes);

// Default route
app.get("/", (req, res) => {
  res.send(`<h1>This is default route</h1>`);
});

// Server Start
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  dbConnection();
});
