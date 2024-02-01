const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");

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
  const err = new AppError(`Can't find ${req.url} on the server.`, 404);

  next(err); // is next receives an arguement express automatically knows that there has been an error.
});

app.use(globalErrorHandler);

module.exports = app;
