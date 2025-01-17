
class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail': 'error'; // Categorize the error as 'fail' (client error) or 'error' (server error)

        this.isOperational = true; // error is expected and can be handled by the application e.g errors caused by invalid user inputs
        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = AppError;