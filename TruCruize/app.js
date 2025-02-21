// Setting Up Express and Reading the JSON File
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const app = express()
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const sanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const authRouter = require('./Routes/authRouter')
const userRoute = require('./Routes/userRoute')
const tourRoute = require('./Routes/tourRoutes')
const reviewRoute = require('./Routes/reviewRoutes')
const viewRouter = require('./Routes/viewRoutes')
const AppError = require('./Utils/appError')
const globalErrorHandler = require('./Controllers/errController')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Serving static files
app.use(express.static(path.join(__dirname, 'Public')))

// Body parser - reading data from body into req.body- Middleware that parse incoming JSON request
app.use(express.json({limit: '10kb'}))

// Parse - reads data from cookie in req
app.use(cookieParser())

// Data Santization against NoSql query inject
app.use(sanitize())

// Data Santization against XSS -  Cleans user inputs for malicious code(e.g during login)
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
  // The whitelist option allows you to specify parameters that should not be sanitized by the middleware.
  whitelist: [
    'duration',
    'ratingQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))

// Development logging
if(process.env.NODE_ENV === 'development'){
   app.use(morgan('dev'))
}

// The logger middleware function defined earlier is then added, logging "Custom middleware called" on every request.
//app.use(logger)

// Helmet - Set security HTTP header
app.use(helmet()) 

// Rate limit
let limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request detected from the IP, take a walk and try again later'
})

// Using the limiter
app.use('/user', limiter)
app.use('/auth', limiter)
app.use('/tour', limiter)


// using/mounting our imported route module/middleware - specifing route to middleware.

// app.use('/auth', authRouter)
app.use('/', viewRouter)
app.use('/users', userRoute)
app.use('/tours', tourRoute)
app.use('/reviews', reviewRoute)

// defining route for non existent urls - Wild card route
app.all('*', (req, res, next) => {
    const err = new AppError(`Cant find ${req.originalUrl} on the server!`, 404)
    // Passes err to Global Error Handler
    next(err)
})

// using our error handler middleware
// globalErrorHandler receive "err" from wild card route
app.use(globalErrorHandler)

// import server
module.exports = app