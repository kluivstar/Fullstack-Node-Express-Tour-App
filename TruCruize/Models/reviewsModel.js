const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },

        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        createdAt: {
            type: Date,
            default: Date.now
        },
        photo: String,
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        // enables virtual properties
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
    );




// 👉 Calculate average rating

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    console.log(stats)

    await Tour.findByIdAndUpdate(tourId, {
        ratingQuantity: stats[0].nRating,
        ratingAverage: stats[0].avgRating
    })
    
}

// 👉 Recalculate ratings after adding a new review
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour)
})


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review