const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')

// reuseable sign Token 
const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {expiresIn: process.env.LOGIN_EXPIRES})
}

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id)
    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production')
        options.secure = true;

    res.cookie('jwt', token, options)
    user.password = undefined
    
    // if a user is created
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
// RHF handles signing up a user
// asyncErrorHandler catches error for exception i.e if a user is not created
exports.signup = asyncErrorHandler(async (req, res, next) =>{
    const newUser = await User.create(req.body)

    createSendResponse(newUser, 201, res)
})

// RHF handles logging in a user
exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    if(!email || !password){
        const error = new AppError("Kindly enter an email or a password", 400)
        return next(error)
    }

    const user = await User.findOne({email}).select('+password')

    //const isMatch = await user.comparePasswordInDb(password, user.password)

    if (!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new AppError('Incorrect credentials', 400)
        return next(error)
    }
    createSendResponse(user, 200, res)
    
})

exports.protect = asyncErrorHandler(async (req, res, next) => {
    // Read the token and check if it exist
    const testToken = req.headers.authorization
    let token
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1]
    }
    if(!token){
        next(new AppError("You're not logged in", 400))
    }

    // validate token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)

    // if user exists
    const user = await User.findById(decodedToken.id)
    if(!user){
        const error = new AppError('The user with given token does not exist.', 401);
        next(error)
    };

    // if user changed password after token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    if(isPasswordChanged){
        const error = new AppError("Password was changed resently, kindly login again", 401);
        return next(error);
    };

    // allow user to access route
    req.user = user;
    next();
});

exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new AppError("You do not have permission to perform this action..", 403);
            next(error);
        }
        // allows user delete movie if role is admin by called the next MW "deleteMovie"
        next();
    }
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    // Get user based on posted email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        const error = new AppError("User doesnt exist..", 404);
        return next(error);
    }
    
    // Generate a random reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    // Send the token back to the user email...
    const resetUrl = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;
    const message = `We received a password reset request. Kindly use the link below to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Password changed request received',
            message: message
        });
            res.status(200).json({
                status: 'success',
                message: 'Password reset link sent to the user email'
            });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending password reset email, kindly try again later', 500));
    };

});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    // If the user exist with the given Tooken and Token has not expired
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}})

    if(!user){
        const error = new AppError('Token expired or invalid', 400)
        next(error)
    }

    // Resetting the user password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    user.passwordChangedAt = Date.now()

    user.save()
    
    // Login the user
    createSendResponse(user, 200, res)
});

