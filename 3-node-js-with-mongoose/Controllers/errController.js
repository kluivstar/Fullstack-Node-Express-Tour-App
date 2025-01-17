
const AppError = require("../Utils/appError")

// Send Dev errors to Developer/Engineer
const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err // full error obj
    })
}

// Handles exception for trying to fetch an invalid route parameter/getting a specific tour that doesnt exist
const castErrorHandler = err => {
    const message = `Invalid value for ${err.path}: ${err.value}.`
    //returns or create AppError instance to represent an operational error
    return new AppError(message, 400)
}
// Handles duplicate entries or tour creation
const duplicateKeyErrorHandler = (err) =>{
    const name = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(name)

    const message = `Theres is already a tour with name ${name}. Kindly use another name`
    return new AppError(message, 400)
}

const validationErrorHandler =(err) => {
    const errors = Object.values(err.errors).map(val => val.message)
    const message =`Invalid input data: ${errors.join('. ')}`

    return new AppError(message, 400)
    
}
// const handleExpiredJWT =(err) =>{
//     return new AppError('JWT has expired, kindly login again', 401)
// }
// const handleJWTError =(err) =>{
//     return new AppError('Invalid token, kindly login again', 401)
// }

// Production Error Handler - Send Operational Errors to clients
const sendProdError = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong....'
        })
    }
}

// Global Error Handling Middleware
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500 //default error
    err.status = err.status ||'error'
    
    if(process.env.NODE_ENV === 'development'){
        sendDevError(err, res)
    } else if(process.env.NODE_ENV === 'production'){
        // Retain properties of original err obj
        let error = Object.assign(err);


        if(error.name === 'CastError') error = castErrorHandler(error);
        if(error.code == 11000) error = duplicateKeyErrorHandler(error);
        if(error.name == 'ValidationError') error = validationErrorHandler(error);
        // if(error.name == 'TokenExpiredError') error = handleExpiredJWT(error);
        // if(error.name == 'JsonWebTokenError') error = handleJWTError(error);

        sendProdError(error, res)
    
}
}