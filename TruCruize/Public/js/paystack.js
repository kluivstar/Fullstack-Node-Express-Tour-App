import axios from "axios";

export const bookTour = async (tourId) => {
    try {
        console.log(`Booking tour: ${tourId}`);

        const session = await axios(`/bookings/checkout-session/${tourId}`);

        console.log("Received session data:", session.data);

        if (!session.data.session.authorization_url) {
            console.error("Authorization URL missing:", session.data);
            alert("Something went wrong. Please try again.");
            return;
        }

        window.location.href = session.data.session.authorization_url;
    } catch (err) {
        console.error("Payment error:", err.response?.data || err);
        alert("Payment failed, please try again.");
    }
};
