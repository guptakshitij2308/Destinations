/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

// prefilling the query string for the user so that the user does not have to fill it.
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .fieldLimiting();

    // Execute the query
    const tours = await features.query; // await keyword is used to execute the query

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);

    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: " fail",
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // using this will make the new updated object to be returned from the function
      runValidators: true,
    });

    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res
      .status(204)
      .json({ status: "success", message: "Tour deleted successfully." });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: null,
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      }, // allows to group documents together (accumulators)
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: "EASY" } },
      // },
    ]); // mongodb aggregation pipeline accepts an array of objects which are the different stages of the pipeline.

    res.status(200).json({ status: "success", data: { stats } });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates", // descontruct an array field from the info document and output one element for each element in the array
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" }, // $month converts a month from a date to a number
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({ status: "success", data: { plan } });
  } catch (err) {
    res.status(404).json({ status: "error", message: err.message });
  }
};
