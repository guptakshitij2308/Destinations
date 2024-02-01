/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

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
    let error = { ...err };

    if (error.kind === "ObjectId") {
      error = handleCastErrorDB(error);
    }
    sendErrorProd(error, res);
  }
};
