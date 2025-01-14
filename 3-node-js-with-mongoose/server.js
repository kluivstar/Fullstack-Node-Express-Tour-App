const mongoose = require('mongoose')

// import dotenv - read variable from config which is then console logged
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
// require express importing main express app from the app.js
const app = require('./app')

//Handing uncaught exceptions , happens sychrounsly
process.on('uncaughtException', (err) =>{
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...')

    process.exit(1)
})

//reading/loading our config file defining our environmental variable like CONN_STR
console.log(process.env)

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

