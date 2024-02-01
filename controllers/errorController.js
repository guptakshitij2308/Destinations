module.exports = (err, req, res, next) => {
  // Express recognises as error handling middleware function due to its arguements. (err function as arguement)
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({ status: err.status, message: err.message });

  next();
};
