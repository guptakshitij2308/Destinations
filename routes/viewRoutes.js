const express = require("express");
const {
  getOverview,
  getTour,
  loginForm,
  signupForm,
  getAccount,
  updateUserData,
  getMyTours,
} = require("../controllers/viewController");
const { isLoggedIn, protect } = require("../controllers/authController");
const { createBookingCheckout } = require("../controllers/bookingController");

const router = express.Router();

// Just for testing purposes.
// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Kshitij",
//   }); // we pass the data specified in object and this object is accessible in the template (locals)
// });

// router.use(isLoggedIn);

router.get("/", createBookingCheckout, isLoggedIn, getOverview);

router.get("/tour/:slug", isLoggedIn, getTour);

router.get("/signup", isLoggedIn, signupForm);
router.get("/login", isLoggedIn, loginForm);
router.get("/me", protect, getAccount);
router.get("/my-tours", protect, getMyTours);

router.post("/update-user-data", protect, updateUserData);

module.exports = router;
