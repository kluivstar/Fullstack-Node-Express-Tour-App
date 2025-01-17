const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')
const authController = require('./authController')

// Reusable Sign In Token
const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {expiresIn: process.env.LOGIN_EXPIRES})
}
// Reuseable function to Generate token and send response
const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id)
    // if a user is created
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

// Get All Users
exports.getAllUsers = asyncErrorHandler(async(req, res, next) => {
    // Get current user data from database
    const users = await User.find()

    res.status(200).json({
        status: "success",
        result: users.length,
        data: {
            users
        }
    })
})

// Filter through only allow fields during User update
const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(prop => {
            if(allowedFields.includes(prop))
                newObj[prop] = obj[prop]
    })
    return newObj
}

// Update User Password
exports.updatePassword = asyncErrorHandler(async(req, res, next) => {
    // Get current user data from database
    const user = await User.findById(req.user._id).select('+password')

    // check if the supplied current password is correct
    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new AppError('The current password you provided is wrong', 401))
    }

    // If supplied password is correct, update user password with new value
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    await user.save()

    // Login user and send JWT
    createSendResponse(user, 200, res)
})

// Update User Profile
exports.updateMe = asyncErrorHandler(async(req, res, next) => {
    // Get current user data from database
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError("You cannot update your password using this endpoint.", 400))
    }

    //Update user detail
    const filterObj = filterReqObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators: true, new: true})
    //await updateUser.save()

    res.status(200).json({
        status: "success",
        token,
        data: updatedUser
    })
})

// Deletes User Profile
exports.deleteMe = asyncErrorHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})
    res.status(204).json({
        status: "success",
        data: null
    })
})