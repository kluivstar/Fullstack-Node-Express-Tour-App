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

reviewSchema.pre(/^find/, function(next){
    // this points to the current query
    this.populate({
        path: 'user',
        select: "name photo"
    })
    
    next()
})


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review