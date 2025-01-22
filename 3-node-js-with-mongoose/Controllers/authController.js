const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const {promisify} = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')

// Reuseable sign Token 
const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {expiresIn: process.env.LOGIN_EXPIRES})
}

const createSendToken = (user, statusCode, res) => {
    // signToken adds jwt to received 'user' 
    // user._id is the payload to add to jwt
    const token = signToken(user._id)
    const cookieOptions = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production')
        cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions)
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
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    createSendToken(newUser, 201, res)
})

// RHF handles logging in a user
exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    // Check if email/password exist
    if(!email || !password){
        const error = new AppError("Kindly enter an email or a password", 400)
        return next(error)
    }

    // Check if user exist and password is correct
    // '+' adds/selects the previously hidden password in schema to the query/ouput
    const user = await User.findOne({email}).select('+password')

    // If user doesnt exist or password dont match
    // 'correctPassword' - schema/instance method that checks passwords
    // Authenticate users during login (correctPassword).
    if (!user || !(await user.correctPassword(password, user.password))){
        const error = new AppError('Incorrect credentials', 400)
        return next(error)
    }
    // If user with email and password exist, login user
    createSendToken(user, 200, res)
    
})

exports.protect = asyncErrorHandler(async (req, res, next) => {
    // const testToken = req.headers.authorization

    // Reads token and check if it exist
    let token
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1]
    }
    // If there not token in request = not logged in
    if(!token){
        next(new AppError("You're not logged in! Kindly log in to access.", 400))
    }

    // Validate token
    const decodedToken = await promisify(jwt.verify)(token, process.env.SECRET_STR)

    // If user exists
    const currentUser = await User.findById(decodedToken.id)
    if(!currentUser){
        const error = new AppError('The user with given token does not exist.', 401);
        next(error)
    };

    // Check if user changed password after token was issued by calling User.changedPasswordAfter instance
    if (currentUser.changedPasswordAfter(decodedToken.iat)) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }

    // Allow/Grant user access to protected route by calling getAllUser or any route
    // req used to put stuff on request object that will be available at a later point
    req.user = currentUser;
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
        return next(new AppError("User with this email doesnt exist..", 404));
        
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
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetTokenExpires: {$gt: Date.now()}})

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
    createSendToken(user, 200, res)
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    
    // Get user from DB
    const user = await User.findById(req.user.id).select('+password')
    
    // Checks if current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 401))
    }

    // If password is correct
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // Loin user, send JWT
    createSendToken(user, 200, res)
})

