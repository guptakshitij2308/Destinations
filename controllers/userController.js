const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  newObj = Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Password can't be updated here.Please use /updateMyPassword",
        400,
      ),
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updateUser } });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented." });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented." });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented." });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet implemented." });
};
