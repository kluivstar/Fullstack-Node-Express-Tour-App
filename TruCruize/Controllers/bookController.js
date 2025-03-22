const axios = require('axios');
const User = require('../Models/userModel');
const Tour = require('../Models/tourModel');
const Booking = require('../Models/bookingModel');
const factory = require('./handlerFactory');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');

exports.getCheckoutSession = asyncErrorHandler(async (req, res, next) => {
    //  Get the tour being booked
    const tour = await Tour.findById(req.params.tourId);

    //  Create a Paystack payment session
    console.log("Tour found:", tour);
    const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
            email: req.user.email,
            amount: tour.price * 100, // Paystack expects amount in kobo
            callback_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
            metadata: {
                tourId: req.params.tourId,
                userId: req.user.id
            }
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    console.log("Paystack Response:", response.data);

    //  Send the Paystack session URL to the frontend
    res.status(200).json({
        status: 'success',
        session: response.data.data
    });
});

// Automatically create a booking when payment is successful
const createBookingCheckout = async (reference) => {
    // Get transaction details from Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    const session = response.data.data;

    if (session.status === 'success') {
        const tour = session.metadata.tourId;
        const user = session.metadata.userId;
        const price = session.amount / 100; // Convert back to Naira

        await Booking.create({ tour, user, price });
    }
};

// Webhook for automatic booking creation
exports.webhookCheckout = (req, res) => {
    const event = req.body;

    if (event.event === 'charge.success') {
        createBookingCheckout(event.data.reference);
    }

    res.status(200).json({ received: true });
};

// Standard CRUD operations for bookings
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
