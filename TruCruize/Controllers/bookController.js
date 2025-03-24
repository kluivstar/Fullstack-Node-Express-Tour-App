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
// const createBookingCheckout = async (reference) => {
//     try {
//         // Fetch transaction details from Paystack
//         const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//             headers: {
//                 Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
//             }
//         });

//         const session = response.data.data;

//         if (session.status === 'success' && session.metadata) {
//             const { tourId, userId } = session.metadata;
//             const price = session.amount / 100; // Convert back to Naira

//             await Booking.create({ tour: tourId, user: userId, price, paid: true });

//             console.log(`✅ Booking created for user ${userId} and tour ${tourId}`);
//         } else {
//             console.error("🚨 Metadata is missing or transaction not successful:", session);
//         }
//     } catch (error) {
//         console.error("❌ Error verifying transaction:", error.message);
//     }
// };


// Webhook for automatic bookings creation after successful payment
exports.webhookCheckout = asyncErrorHandler(async (req, res) => {
    console.log("🔔 Webhook hit! Data received:", req.body);
    try {
        const event = req.body;

        if (event.event === 'charge.success' && event.data.metadata) {
            const { metadata, amount } = event.data;
            const { tourId, userId } = metadata;

            await Booking.create({
                tour: tourId,
                user: userId,
                price: amount / 100, // Convert from kobo to naira
                paid: true
            });

            console.log(`✅ Webhook: Booking created for user ${userId} and tour ${tourId}`);

            return res.status(200).json({ success: true });
        } else {
            console.error("🚨 Webhook received but missing metadata:", event);
        }

        res.status(400).json({ success: false });
    } catch (error) {
        console.error("❌ Webhook processing error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Standard CRUD operations for bookings
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

