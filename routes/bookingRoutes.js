const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get(
  "/checkout-session/:tourID",
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
