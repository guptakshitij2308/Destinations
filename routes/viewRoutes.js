const express = require("express");
const { getOverview, getTour } = require("../controllers/viewController");

const router = express.Router();

// Just for testing purposes.
// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Kshitij",
//   }); // we pass the data specified in object and this object is accessible in the template (locals)
// });

router.get("/", getOverview);

router.get("/tour", getTour);

module.exports = router;