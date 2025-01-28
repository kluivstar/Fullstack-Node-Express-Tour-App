const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal to 40 characters'],
        minLength: [10, 'A tour name must have less or equal to 10 characters'],
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
        required: [true, "A tour must have a cover image"]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // 'false' hides this field
        select: false
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    startDates: [Date],
    price: {
        type: Number,
        required: [true, 'Tour price is required']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
            // this only points to current doc on NEW document creation
            return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour price is required']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Description is a required field!']    
    },
    duration: {
        type: Number,
        required: [true, 'Duration is a required field!']
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
        coordinates: 
            [Number],
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
            type: mongoose.Schema.ObjectId, // Referencing - shows guides Ids in doc
            ref: 'User'
        }
    ]
    
}, 
{
    // These options ensure that virtual properties are included when a document is converted to JSON (toJSON) or a plain JavaScript object (toObject).
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// calculates number of weeks based on the "duration" field
tourSchema.virtual('durutionWeeks').get(function(){
    return this.duration / 7
})

// Connect tours and users by embedding
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)

//     next()
// })

// DOCUMENT MIDDLEWARE: runs before a document is saved
// Generates a slug for each document, ensure they have a URL friendly identifier (slug) based on name
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

// tourSchema.virtual('reviews', {
//     ref: 'Review',
//     foreignField: 'tour',
//     localField: '_id'
// })

// QUERY MIDDLEWARE: runs before a query "find" query on the Tour model.
// '/^find/' executes on all find query unlike using 'find'
tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}})
    this.start = Date.now()
    next()
})

// populate query middleware - populate guides data rather than just displaying their IDs
tourSchema.pre(/^find/, function(next){
    // this points to the current query
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    
    next()
})


// AGGREGATION MIDDLEWARE: $match ensure only document with false secretTours are included in aggregation results
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({
        $match: {secretTour: {$ne: true}}
    })

    console.log(this.pipeline())
    next()
})

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;