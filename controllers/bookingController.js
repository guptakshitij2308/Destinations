/* eslint-disable import/no-extraneous-dependencies */
const stripe = require("stripe")(`${process.env.STRIPE_TEST_KEY}`);
const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get booked tour for the payment
  const tour = await Tour.findById(req.params.tourID);
  // Create Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,

          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,

            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: "payment",
  });

  // Create Session as response
  res.status(200).json({
    status: "success",
    session,
  });
});
