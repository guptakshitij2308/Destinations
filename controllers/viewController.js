const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tour data from the collection
  const tours = await Tour.find();
  // 2. Build template

  // 3. Render that template using tour data from 1

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError("There is no tour with that name", 404));

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

exports.loginForm = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login into your account",
  });
});

exports.signupForm = catchAsync(async (req, res, next) => {
  res.status(200).render("signup", {
    title: "Please signup to continue",
  });
});
