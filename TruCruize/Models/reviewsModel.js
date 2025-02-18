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
        // photo: String,
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

// 👉 Prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
      this.populate({
        path: 'user',
        select: 'name photo'
      });
      next();
});
    

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
    // console.log(stats)

if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
    } else {
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
    });
    }
};

// 👉 Recalculate ratings after adding a new review
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour)
})

// 👉 STEP 1: Store the current review before update/delete 
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});
  
// 👉 STEP 2: Update the tour's average rating after update/delete
reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review