const express = require("express");
const {
  getAllReviews,
  createReview,
} = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true }); // we enable merge params as each router gets access to only their params; enabling this will give access of parent's params

router
  .route("/")
  .get(getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    createReview,
  );

module.exports = router;
