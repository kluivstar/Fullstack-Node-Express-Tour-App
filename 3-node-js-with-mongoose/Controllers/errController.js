const CustomError = require("../Utils/CustomError")

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
    return new CustomError(msg, 400)
}

const duplicateKeyErrorHandler = (err) =>{
    const name = err.keyValue.name
    const msg = `Theres is already a movie with name ${name}. Kindly use another name`
    return new CustomError(msg, 400)
}

const validatioinErrorHandler =(err) => {
    const errors = Object.values(err.errors).map(val => val.message)
    const errorMessages = errors.join('. ')
    const msg =`Invalid input data: $//{errorMessages}`

    return new CustomError(msg, 400)
    
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
    
    if(process.env.NODE_DEV === 'development'){
        devErrors(res, error)
    } else if(process.env.NODE_DEV === 'production'){
        
        if(error.name == 'CastError') error = castErrorHandler(error);
        if(error.code == 11000) error = duplicateKeyErrorHandler(error);
        if(error.name == 'ValidationError') error = validatioinErrorHandler(error);
        prodErrors(res, err)
    
}
}