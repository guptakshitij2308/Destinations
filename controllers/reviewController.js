const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Nested Routes
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: { review: newReview },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }
  res
    .status(204)
    .json({ status: "success", message: "Review deleted successfully." });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // using this will make the new updated object to be returned from the function
    runValidators: true,
  });
  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: { review } });
});
