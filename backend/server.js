const express = require("express");
const cors = require("cors");
const expressfileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./connections/dbConnection");
const { cloudinaryConnect } = require("./connections/coudinaryConnection");
const routes = require("./routes/index");
require("dotenv").config();

// Initializing Server (App == Application)
const app = express();

// Middlewares
app.use(express.json());
app.use(
  expressfileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cookieParser());
app.use(cors());

// Routing
app.use("/api/v1", routes);

// Default route
app.get("/", (req, res) => {
  res.send(`<h1>This is default route</h1>`);
});

// Server Start
app.listen(process.env.PORT, () => {
  console.log(`Server is running on  http://localhost:${process.env.PORT}/`);
  dbConnect();
  cloudinaryConnect();
});
