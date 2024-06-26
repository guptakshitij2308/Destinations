/* eslint-disable import/no-extraneous-dependencies */
const stripe = require("stripe")(`${process.env.STRIPE_TEST_KEY}`);
const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const factory = require("./handlerFactory");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel.js");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get booked tour for the payment
  const tour = await Tour.findById(req.params.tourID);
  // Create Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    success_url: `${req.protocol}://${req.get("host")}/`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,

          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,

            images: [
              `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
            ],
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

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  // const price = session.line_items[0].price_data.unit_amount / 100;
  // console.log(session);
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split("?")[0]);
// });

exports.getAllBookings = factory.getAll(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.getBooking = factory.getOne(Booking);
