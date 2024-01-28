const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

//  Middlewares

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim() === "development") {
  // trim is added as whitespaces gettting added to process.env.NODE_ENV
  //   console.log('hello');
  app.use(morgan("dev")); // middleware for logging data to console in development
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // middleware for serving static files

// We use version with api so as in future versions if updates are done the existing version is not broken.

app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

module.exports = app;
