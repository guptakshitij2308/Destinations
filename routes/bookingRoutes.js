const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get(
  "/checkout-session/:tourID",
  authController.protect,
  bookingController.getCheckoutSession,
);

router.use(authController.protect);
router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
