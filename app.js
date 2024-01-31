const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
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

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.url} on the server.`,
  // });

  // const err = new Error(`Can't find ${req.url} on the server.`);
  // err.status = "fail";
  // err.statusCode = 404;

  const err = new AppError(`Can't find ${req.url} on the server.`, 404);

  next(err); // is next receives an arguement express automatically knows that there has been an error.
});

app.use((err, req, res, next) => {
  // Express recognises as error handling middleware function due to its arguements. (err function as arguement)

  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  res
    .status(err.statusCode)
    .json({ status: err.statusCode, message: err.message });

  next();
});

module.exports = app;
