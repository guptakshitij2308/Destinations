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
} = require("../controllers/tourController");
const authController = require("../controllers/authController");

router.param("id", (req, res, next, val) => {
  // param middleware only runs when it finds a specific parameter in the reuqest url.
  // console.log(val);
  next();
});

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours); // use case of middleware to reuse the controller logic to define custom routes.

router.route("/").get(authController.protect, getAllTours).post(createTour);

// For optional parameter add a question mark at the end like :id?
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
