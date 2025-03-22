const express = require('express');
const bookingController = require('../Controllers/bookController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get payment session for Paystack
router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

// Paystack webhook (listen for successful payments)
router.post('/webhook-checkout', express.json(), bookingController.webhookCheckout);

// Standard booking routes
router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
