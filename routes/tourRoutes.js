const express = require("express");

const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

router.param("id", (req, res, next, val) => {
  // param middleware only runs when it finds a specific parameter in the reuqest url.
  // console.log(val);
  next();
});

router.use("/:tourId/reviews", reviewRouter); // merge params ; mounting a router itself similar to app.use

router.route("/tour-stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    getMonthlyPlan,
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours); // use case of middleware to reuse the controller logic to define custom routes.

router.route("/").get(getAllTours).post(createTour);

// For optional parameter add a question mark at the end like :id?
router
  .route("/:id")
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    deleteTour,
  );

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     createReview,
//   );

module.exports = router;
