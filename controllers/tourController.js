/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    // 1A) Filtering
    const queryObj = { ...req.query }; // doing this we create a shallow copy ( req.query will yield a hard copy )
    const excludedFields = ["page", "sort", "limit", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering for lte,gte ,etc.

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    let query = Tour.find(JSON.parse(queryString));

    // 2) Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" "); // in case there is a tie on sorting then sorted by second field name
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createAt");
    }

    // 3)Field Limiting
    if (req.query.fields) {
      let fieldsStr = JSON.stringify(req.query.fields); // process of selecting fields called projection
      fieldsStr = fieldsStr.split(",").join(" ");
      query = query.select(JSON.parse(fieldsStr));
    } else {
      query = query.select("-__v"); // - __V excludes a certain field from the response being sent to the user.
    }

    // 4) Execute the query
    const tours = await query; // await keyword is used to execute the query

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
