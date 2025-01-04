const mongoose = require('mongoose')
// import dotenv
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

//Handing uncaught exceptions , happens sychrounsly
process.on('uncaughtException', (err) =>{
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...')

    process.exit(1)
})

// require express importing main express app from the app.js
const app = require('./app')

//reading/loading our config file defining our environmental variable like CONN_STR

console.log(process.env)

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        unique: true,
    },
    images: [String],
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    slug: String,
    difficulty: {
        type: String,
        required: [true, ''],
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
        required: [true, 'Add a description']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required field!']
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


const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;


// connecting to remote DB
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('DB started something.')
})

// Create Server
const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log("Server wanna be startin something.")
})

// Handling Mongoose Validation Error
process.on('unhandledRejection', (err) =>{
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down..')

    server.close(()=> {
        process.exit(1)
    })
})

