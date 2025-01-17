const AppError = require("../Utils/AppError")

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

const castErrorHandler = (err)=> {
    const msg = `Invalid value for ${err.path}: ${err.value}`
    return new AppError(msg, 400)
}

const duplicateKeyErrorHandler = (err) =>{
    const name = err.err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value)

    const msg = `Theres is already a tour with name ${name}. Kindly use another name`
    return new AppError(msg, 400)
}

const validatioinErrorHandler =(err) => {
    const errors = Object.values(err.errors).map(val => val.message)
    const errorMessages = errors.join('. ')
    const msg =`Invalid input data: $//{errorMessages}`

    return new AppError(msg, 400)
    
}
const handleExpiredJWT =(err) =>{
    return new AppError('JWT has expired, kindly login again', 401)
}
const handleJWTError =(err) =>{
    return new AppError('Invalid token, kindly login again', 401)
}

const prodErrors = (res, error) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            
        })
    }else {
        res.status(500).json({
            status: 'error',
            message: 'Somthing went wrong....'
        })
    }
}
module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500
    error.status = error.status ||'error'
    
    if(process.env.NODE_ENV === 'development'){
        devErrors(res, error)
    } else if(process.env.NODE_ENV === 'production'){
        
        if(error.name == 'CastError') error = castErrorHandler(error);
        if(error.code == 11000) error = duplicateKeyErrorHandler(error);
        if(error.name == 'ValidationError') error = validatioinErrorHandler(error);
        if(error.name == 'TokenExpiredError') error = handleExpiredJWT(error);
        if(error.name == 'JsonWebTokenError') error = handleJWTError(error);
        prodErrors(res, error)
    
}
}