const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) =>
  Object.keys(obj).reduce((newObj, key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Password can't be updated here.Please use /updateMyPassword",
        400,
      ),
    );
  }

  // console.log(req.body);

  const filteredBody = filterObj(req.body, "name", "email");
  // console.log(filteredBody);

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updateUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet implemented.Please use /signup",
  });
};
exports.getAllUsers = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
