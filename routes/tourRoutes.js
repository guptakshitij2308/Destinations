const express = require("express");

const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require("../controllers/tourController");

router.param("id", (req, res, next, val) => {
  // param middleware only runs when it finds a specific parameter in the reuqest url.
  // console.log(val);
  next();
});

router.route("/").get(getAllTours).post(createTour);

// For optional parameter add a question mark at the end like :id?
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
