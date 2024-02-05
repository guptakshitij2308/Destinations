// const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.setTourUserIds = (req, res, next) => {
  // Nested Routes
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
