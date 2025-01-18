
class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail': 'error'; // Determines if the error is a client error (fail) or a server error (error), based on the statusCode.

        this.isOperational = true; // Marks the error as an operational error (an expected error caused by invalid user input or some controlled behavior). 
        Error.captureStackTrace(this, this.constructor); // Captures the stack trace of the error at the point where it was created. This is helpful for debugging.
    }
};

module.exports = AppError;