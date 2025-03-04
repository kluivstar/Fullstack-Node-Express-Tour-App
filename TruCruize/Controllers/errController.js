const AppError = require("../Utils/appError")

// Send Dev errors to Developer/Engineer
// Displays DEV Error - User make request - We get error details
const sendDevError = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err // DISPLAYS FULL ERROR IN RESPONSE
        })
    }
    
    // Render Website
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    })
}

// Handles exception for trying to fetch an invalid route parameter/getting a specific tour that doesnt exist
const castErrorHandler = err => {
    const message = `Invalid value for ${err.path}: ${err.value}.`
    //returns or create AppError instance to represent an operational error
    return new AppError(message, 400)
}

// Handle duplicate document creation
const duplicateKeyErrorHandler = (err) =>{
    const name = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value)

    const message = `Theres is already a tour with name ${name}. Kindly use another name`
    return new AppError(message, 400)
}
// Handles/Displays Validation Errors
const validationErrorHandler =(err) => {
    // val.message simply targets "error" obj ".message" property
    const errors = Object.values(err.errors).map(val => val.message)
    // join('. ') seperates the string in response message with . and space for readabilty
    // send message from AppError to GEH
    const message =`Invalid input data: ${errors.join('. ')}`

    return new AppError(message, 400)
    
}
// Handles token expiration in prod
const handleExpiredJWT =() =>{
    return new AppError('JWT has expired, kindly login again', 401)
}

// Handles error/invalid token in prod
const handleJWTError =() =>{
    return new AppError('Invalid token, kindly login again', 401)
}

// Production Error Handler - Send Operational Errors to clients
const sendProdError = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')){
        if (err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
    // Send Generic Message
    console.log('Error', err)
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong'
    })
}

    // Render Website
    if (err.isOperational) {
        console.log(err)
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }

    console.log('Error', err)
    // Send Generic Message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
    })
}

// Global Error Handling Middleware
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500 //default error
    err.status = err.status ||'error'
     // Handles Dev Errors
    if(process.env.NODE_ENV === 'development'){
        sendDevError(err, req, res)
        // Handles/Calls Production Error
    } else if(process.env.NODE_ENV === 'production'){
        // Creates copy of error object then passed to error handlers like castErrorHandler
        let error = Object.assign(err);
        error.message = err.message;

        if(error.name === 'CastError') error = castErrorHandler(error);
        if(error.code == 11000) error = duplicateKeyErrorHandler(error);
        if(error.name == 'ValidationError') error = validationErrorHandler(error);
        if(error.name == 'TokenExpiredError') error = handleExpiredJWT();
        if(error.name == 'JsonWebTokenError') error = handleJWTError();

        sendProdError(error, res)
    
}
}