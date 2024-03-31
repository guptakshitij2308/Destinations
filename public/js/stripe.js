/* eslint-disable no-unused-vars */
import axios from "axios";
import { showAlert } from "./alerts.js";
const stripe = Stripe(
  "pk_test_51Oz0lASCJtweFUnO9wDKXFYa1AkutDWZLoVgO8v93cRV5JqWf9TvGKVD5TjnI9a5bZSyyiBRJW0g78BbmfkD9HiP00HeI0YeUR",
);

export const bookTour = async (tourId) => {
  try {
    // Get session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // Create Checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.error(error);
    showAlert("error", error);
  }
};
