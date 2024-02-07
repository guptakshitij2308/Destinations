const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review must not be empty."],
    },
    rating: {
      type: Number,
      min: [1, "Rating can't be less than 1."],
      max: [5, "Rating must be less than 5."],
    },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// post middleware doesn't get access to next
reviewSchema.post("save", function () {
  // Review.calcAverageRatings(this.tour); // can't use this as here Review is not defined.
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate , findByIdAndDelete // we don't have doc middleware for this but query middleware ; in query we don't have direct access of the document

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // const r = await this.clone().findOne(); // as this is the current query; awaiting it will cause it to execute and return the document.
  // we still get the previous rating here as the findOne fetches data from the database.
  // console.log(r);
  this.r = await this.clone().findOne(); // using this trick we can pass data from the pre middleware to the post middleware
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() doesn't work here as the query is already executed.
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
