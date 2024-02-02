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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }

  // Programing or other unkown error : don't leak error details
  else {
    console.error(err);
    res.status(500).json({ status: "error", message: "Something went wrong!" });
  }
};

module.exports = (err, req, res, next) => {
  // Express recognises as error handling middleware function due to its arguements. (err function as arguement)
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV.trim() === "development") {
    sendErrorDev(err, res);
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
    sendErrorProd(error, res);
  }
};
