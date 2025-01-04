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
    price: {
        type: Number,
        required: [true, 'Tour price is required'],
    },
    rating: {
        type: Number,
        required: [true, 'Required']
    }
    
}, 
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});


const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;

const testTour = new Tour({
    name: 'The Hello tours',
    rating: 4.3,
    price: 233
})
testTour.save().then(doc => {
    console.log(doc)
}).catch(err => {
    console.log(err)
})

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

