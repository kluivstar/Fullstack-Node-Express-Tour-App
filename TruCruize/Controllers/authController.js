const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const {promisify} = require('util')
const Email = require('./../Utils/email')
const crypto = require('crypto')

// Create Reuseable sign in or JWT Token 
const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {expiresIn: process.env.LOGIN_EXPIRES})
}

// Called when a user signs up or logs in.
const createSendToken = (user, statusCode, res) => {
    // Create a token with the user's ID 
    const token = signToken(user._id)

    //Setup cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production')
        cookieOptions.secure = true;

    // Set the cookie in the response
    res.cookie('jwt', token, cookieOptions)

    //Remove password before sending user data back
    user.password = undefined
    
    // if a user is created - Send response
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
// Sign up RHF-Middleware
exports.signup = asyncErrorHandler(async (req, res, next) =>{
    
    // Extract signup fields
    const { name, email, password, passwordConfirm, role } = req.body;

    // Log the role value separately
    console.log('Role:', role); // Ensure the role is correct

    // Create new user with fields
    // .create() adds user to Mongoose DB
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: role || 'user' // Defaults to user if role is not provided
    })

      // Create a profile URL
    const url = `${req.protocol}://${req.get('host')}/me`;

      // Send welcome email
    await new Email(newUser, url).sendWelcome();
    
    // Send JWT in cookie & response
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

// Logou tRHF
exports.logout = (req, res) => {

    // 'jwt' is the name of the cookie used to store the token.
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now()), // The cookie expires immediately.
        httpOnly: true // Can't be accessed by client-side JavaScript
    })
    res.status(200).json({
        status: 'success'
    })
}

// Protect or a JWT authentication middleware
// It checks if the request has a valid JWT token/authenticated - If valid → it allows the user to continue (next())
exports.protect = asyncErrorHandler(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;

    // Looks for the JWT in: Auth header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) { // // Looks for the JWT in: cookies
      token = req.cookies.jwt;
    }
    
    // User to authorized, thrown and error - No access
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verify token if user is authorized
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_STR);
  
    // 3) Check if user still exists in DB
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
  
    // If all checks passed - Allow user access to protected route 
    req.user = currentUser;
    res.locals.user = currentUser; // Puts current user in res and res.locals - so templates can use the user eg PUG
    next();
  });
  

// Restrict Middleware - limits access based on the user's role.
// It's used after the protect middleware (which confirms the user is logged in).
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

// Initial password Reset process part 1
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    // Checks if a user with the provided email exists.
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new AppError("User with this email doesnt exist..", 404));
        
    }
    
    // Generate a reset token
    const resetToken = user.createResetPasswordToken(); // custom method defined on the user model.

    // skips field validations (like required password fields).
    await user.save({validateBeforeSave: false});

     // Send email with reset link
    try{
       
        const resetUrl = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;

        // Send mail with reset URL
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

// Resets password part 2
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {

    // Hash the incoming token - The token the user clicked in their email is plain text.
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

        // Find user with valid token where the hashded token in DB is the one from the URL and not expired.
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})


    if(!user){
        const error = new AppError('Token expired or invalid', 400)
        next(error)
    }

    // Resetting the user password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    // Removes reset token an expiration to avoid reuse
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now()

    // Saves user
    await user.save()
    
    // Login the user
    createSendToken(user, 200, res)
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    
    // Get user from DB
    // 'req.user.id' from protect MW - it confirms the user is logged in
    // + ensure password is included which is normally excluded in schema for security reasons
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

