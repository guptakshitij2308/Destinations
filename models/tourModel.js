/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
      trim: true,
      maxLength: [40, "A tour must have less or equal than 40 characters."],
      minLength: [10, "A tour must have more or equal than 10 characters."],
      // validate: [
      //   validator.isAlpha,
      //   "A tour must have only letters in its name.",
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be easy,medium or hard.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be less than 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price."],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: `Discount price ({VALUE}) must be less than actual price.`,
        validator: function (value) {
          // this keyword is only going to point the current document
          // while we are creating a new document not updating it.
          return value < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description."],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image."],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false, // this will not appear when we sent back the response to the client
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); // prices are stored in ascending order in indexes ; index is a separate collection outside the database additional table ; whenever mongo wants
// query it searches this table and then returns the docs matching the results of querying on this additional table. ( improves read performance )
// uniqueness in a field also creates an index by default in mongodb
// single field index when we want to query a single param and compound index when we want to query multiple params.

tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index ; indexes are set based on access patterns
tourSchema.index({ slug: 1 });
//
// Virtual Properties are fields which we define in our schema but are not persisted in the db. ( for example conversion of months to weeks.)
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
// virtual properties can not be used to query as they are not a part of the database.

// Virtual populate ( the populate is not being persisted to the database. We are establishing it in the frontend.)
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Document middleware provided by mongoose runs before .save() and .create() ; It does not run before .insert()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middlewares are provided and run before .find() and and after .find()

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  // mongoose will need to a new query in order to populate and create the connection.
  next();
});

// Aggregation middlewares on .aggregate()

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
