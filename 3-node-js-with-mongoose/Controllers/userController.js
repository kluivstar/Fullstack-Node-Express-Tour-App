const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')
const authController = require('./authController')

// Filter through only allow fields during User update
const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(prop => {
            if(allowedFields.includes(prop))
                newObj[prop] = obj[prop]
    })
    return newObj
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

// Get Specific User
exports.getUser = asyncErrorHandler(async(req, res, next) => {
    req.params.id = req.user.id
    next()
})

// Get Specific User
exports.updateUser = asyncErrorHandler(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(
            new AppError('You cant update password with this route, kindly use /updatePassword', 400)
        )
    }

    const filteredBody = filterReqObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

// Deletes User Profile
exports.deleteUser = asyncErrorHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: "success",
        data: null
    })
})
// Update User Password
// exports.updatePassword = asyncErrorHandler(async(req, res, next) => {
//     // Get current user data from database
//     const user = await User.findById(req.user._id).select('+password')

//     // check if the supplied current password is correct
//     if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
//         return next(new AppError('The current password you provided is wrong', 401))
//     }

//     // If supplied password is correct, update user password with new value
//     user.password = req.body.password
//     user.confirmPassword = req.body.confirmPassword
//     await user.save()

//     // Login user and send JWT
//     createSendResponse(user, 200, res)
// })


