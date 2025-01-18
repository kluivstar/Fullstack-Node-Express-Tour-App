const mongoose = require('mongoose')

// import dotenv - read variable from config which is then console logged
const dotenv = require('dotenv')

//Handing uncaught exceptions - called before requiring express app below
process.on('uncaughtException', (err) =>{
    console.log(err);
    console.log('Uncaught Exception occured ❗ Shutting down...')

    process.exit(1)
})

dotenv.config({path: './config.env'})

// require express importing main express app from the app.js
const app = require('./app')

//reading/loading our config file defining our environmental variable like CONN_STR
console.log(process.env)

// connecting to remote DB
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('DB Connection Successful 🔗')
})

// Create Server
const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log("Server Launch Successful 🚀")
})

// Handling Unhandled Rejection - Mongoose Validation Error
process.on('unhandledRejection', (err) =>{
    console.log(err);
    console.log('Unhandled rejection occured ❗ Shutting down..')

    // close server and shuts down the application
    server.close(()=> {
        process.exit(1)
    })
})
