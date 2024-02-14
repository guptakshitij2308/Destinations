/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const express = require("express");
const morgan = require("morgan");
// const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.set("view engine", "pug"); // we have to tell express at the start after intializing our app about the template engine which will be used ; pug templates called views in express

app.set("views", path.join(__dirname, "views")); // we are using path.join as we don't know if there would be / when we use __dirname  or not.

//  Global Middlewares

app.use(express.static(path.join(__dirname, "public"))); // middleware for serving static files

app.use(helmet()); // used for setting security http headers to the response and request

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim() === "development") {
  // trim is added as whitespaces gettting added to process.env.NODE_ENV
  //   console.log('hello');
  app.use(morgan("dev")); // middleware for logging data to console in development
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try again later.",
});

app.use("/api", limiter);

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true, // Enable credentials (cookies)
// };

// app.use(cors(corsOptions));

// Body parser,reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
// "email" : {"$gt" : ""},
// "password" : "12345678"

app.use(mongoSanitize()); // filters out all the query operators from request.body

// Data sanitization against XSS (cross site scripting attacks)

app.use(xss()); // will clean user input from malicious html code

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// Routes

app.use("/", viewRouter); // mounting the view router in our app.

// We use version with api so as in future versions if updates are done the existing version is not broken.
app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  const err = new AppError(`Can't find ${req.url} on the server.`, 404);
  next(err); // is next receives an arguement express automatically knows that there has been an error.
});

app.use(globalErrorHandler);

module.exports = app;

// When deploying deploy postman collection as well for the documentation.
