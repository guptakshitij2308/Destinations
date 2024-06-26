const crypto = require("crypto");

const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Email = require("../utils/email");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, // only works in https
    httpOnly: true, // cookie can not be modified in any way by the browser
    secure: req.secure,
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({ status: "success", token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    // passwordChangedAt: req.body.passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  // const token = generateToken(newUser._id);

  // res.status(201).json({ status: "success", token, data: { newUser } });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please provide a valid email and password.", 400),
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  createSendToken(user, 200, req, res);
  // const token = generateToken(user._id);

  // res.status(200).json({ status: "success", token });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

// It is used to determine if a user is logged in or not ; But it only works for protected routes not all routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access.", 401),
    );
  }
  // console.log(token);

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new AppError("The token belonging to this user does not exists.", 401),
    );

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User has recently changed password! Please login again.",
        401,
      ),
    );
  }

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

// Only there for rendered pages. Hence there will be never an error in this middleware
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const freshUser = await User.findById(decoded.id);

      if (!freshUser) return next();

      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser; // every pug template will have access to res.locals ; similar to passing data to a template using the render function
      req.user = freshUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action.", 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new AppError("No user found with the entered email address.", 404),
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token (valid for 10 minutes)",
    //   message,
    // });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendResetPassword();

    res
      .status(200)
      .json({ status: "success", message: "Token sent to mail successfully." });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Please try again later.",
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired!", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // const token = generateToken(user._id);
  // res.status(200).json({ status: "success", token });
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const user = await User.findOne({ email: req.user.email }).select(
    "+password",
  );

  const { currentPassword, password, passwordConfirm } = req.body;

  const matched = await user.correctPassword(currentPassword, user.password);

  if (!matched) {
    return next(
      new AppError("Wrong password.Please try with correct password.", 401),
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save({ validateBeforeSave: true });

  // const token = generateToken(user._id);

  // res.status(200).json({ status: "success", token });
  createSendToken(user, 200, req, res);
});
