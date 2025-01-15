const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        unique: true,
    },
    rating: {
        type: Number,
        
        min: 1,
        max: 5
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficult is either: easy, medium, difficult"
        }
    },
    images: [String],
    imageCover: {
        type: String,
        // required: [true, "A tour must have a cover image"]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // 'false' hides this field
        select: false
    },
    maxGroupSize: {
        type: Number,
        // required: [true, 'A tour must have a group size']
    },
    slug: String,
    difficulty: {
        type: String,
        // required: [true, ''],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
          }
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startDates: [Date],
    price: {
        type: Number,
        required: [true, 'Tour price is required'],
    },
    priceDiscount: {
        type: Number,
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        // required: [true, 'Add a description']
    },
    duration: {
        type: Number,
        // required: [true, 'Duration is required field!']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    startLocation: {
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
    
}, 
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// tourSchema.virtual('durutionWeeks'.get(function(){
//     return this.duration / 7
// }))

// tourSchema.virtual('reviews', {
//     ref: 'Review',
//     foreignField: 'tour',
//     localField: '_id'
// })

// tourSchema.pre('/^find/', function(next){
//     this.find({secretTour: {$ne: true}})
//     this.start = Date.now()
//     next()
// })

// tourSchema.pre('/^find/', function(next){
//     this.populate({
//         path: 'guides',
//         select: '-__v -passwordChangedAt'
//     })
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;