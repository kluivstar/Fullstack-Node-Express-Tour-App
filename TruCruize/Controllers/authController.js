const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const {promisify} = require('util')
const Email = require('./../Utils/email')
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
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
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
// Sign up Middleware
// asyncErrorHandler catches error for exception i.e if a user is not created
exports.signup = asyncErrorHandler(async (req, res, next) =>{
    const { name, email, password, passwordConfirm, role } = req.body;

    // Log the role value separately
    console.log('Role:', role); // Ensure the role is correct
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: role || 'user' // Defaults to user is role is not provided
    })
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();
    
    createSendToken(newUser, 201, res)
})

// Login Middleware
exports.login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email/password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
      }

    // Check if user exist and password is correct
    // '+' adds/selects the previously hidden password in schema to the query/ouput
    const user = await User.findOne({email}).select('+password')

    // If user doesnt exist or password dont match
    // 'correctPassword' - schema/instance method that checks passwords
    // Authenticate users during login (correctPassword).
    if (!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }
    // If user with email and password exist, login user
    createSendToken(user, 200, res)
    
})

// Only for render pages, no error
exports.isLoggedIn = async(req, res, next) => {
    if(req.cookies.jwt) {
        try {
            // verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.SECRET_STR
            )
            // check if user exist
            const currentUser = await User.findById(decoded.id)
            if(!currentUser){
                return next()
            }
            // check if user changed password after token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)){
                return next()
            }

            // If there is logged in user - make user accessible to template 
            res.locals.user = currentUser
            return next()
        } catch (err){
            return next()
        }
    }
    next()
}

//
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now(0)), // The cookie disappears after 10 seconds.
        httpOnly: true // Prevents JavaScript from accessing the cookie.
    })
    res.status(200).json({
        status: 'success'
    })
}

// Protect or a JWT authentication middleware
exports.protect = asyncErrorHandler(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_STR);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
  
    //  Allow/Grant user access to protected route 
    req.user = currentUser;
    res.locals.user = currentUser; // Puts current user in res and res.locals - makes current user avaliable in templates
    next();
  });
  

// Restrict Middleware - If the user is authenticated and has the admin role, the route handler runs.
// The protect middleware ensures that the user is authenticated and populates "req.user" stored in protect MW.
exports.restrict = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action..", 403));
        }
        // allows user delete tour if role is admin by calling the next MW "deleteTour"
        next();
    }
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    // Get user based on posted email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError("User with this email doesnt exist..", 404));
        
    }
    
    // createResetPasswordToken() generates a random encrypted reset token
    const resetToken = user.createResetPasswordToken();
    // Deactivate validators in schema
    await user.save({validateBeforeSave: false});

     // Sends the mail with reset url to user
    try{
       
        const resetUrl = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;

        await new Email(user, resetUrl).sendPasswordReset();
            res.status(200).json({
                status: 'success',
                message: 'Password reset link sent to the user email'
            });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending password reset email, kindly try again later', 500));
    };

});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    // Recieved token in req is hashed ,if the user exist with the given Token and Token has not expired
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

        // Hashed token is then compared with the passwordResetToken(also hashed) stored in the database and checked against the expiration time
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

    if(!user){
        const error = new AppError('Token expired or invalid', 400)
        next(error)
    }

    // Resetting the user password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now()

    await user.save()
    
    // Login the user
    createSendToken(user, 200, res)
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    
    // Get user from DB
    // 'req.user' from protect MW
    // + ensure password is retrieved
    const user = await User.findById(req.user.id).select('+password')
    
    // Checks if current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 401))
    }

    // If password is correct update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // Login user, send JWT
    createSendToken(user, 200, res)
})

