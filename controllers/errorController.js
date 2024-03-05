/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utils/appError");

const handleDuplicateFieldsDB = (err) => {
  // console.log(err);
  // console.log(err.message);
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate Field Value ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError(`Invalid token. Please login again!`, 401);

const handleJWTExpiredError = (err) =>
  new AppError(`Your token has expired. Please login again!`, 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    // if the request is from the api
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error("Error", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went very wrong!",
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // 1) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // 2) Programing or other unkown error : don't leak error details
    // A) Log error
    console.error(err);
    // B) Send generic message
    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong!" });
  }

  // 2) Rendered Website

  // 1) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render("error", {
      title: "Something went very wrong!",
      msg: err.message,
    });
  }
  // 2) Programing or other unkown error : don't leak error details

  console.error(err);
  return res.status(err.statusCode).render("error", {
    title: "Something went very wrong!",
    msg: "Please try again later.",
  });
  // if (req.originalUrl.startsWith("/api")) {
  //   if (err.operationalError) {
  //     res.status(err.statusCode).json({
  //       status: err.status,
  //       message: err.message,
  //     });
  //   } else {
  //     console.error("Error", err);
  //     res.status(500).json({
  //       status: "error",
  //       message: "Something went wrong",
  //     });
  //   }
  // } else {
  //   if (err.operationalError) {
  //     res.status(err.statusCode).render("error", {
  //       title: "Something went wrong",
  //       message: err.message,
  //     });
  //   } else {
  //     console.error("Error", err);
  //     res.status(500).render("error", {
  //       title: "Something went wrong",
  //       message: "Please try again later",
  //     });
  //   }
  // }
};

module.exports = (err, req, res, next) => {
  // Express recognises as error handling middleware function due to its arguements. (err function as arguement)
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV.trim() === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === "production") {
    let error = { ...err, name: err.name, message: err.message };
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = handleJWTError(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError(error);
    }
    sendErrorProd(error, req, res);
  }
};
