const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')
const authController = require('./authController')
const factory = require('./handlerFactory')

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

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route is not defind, use /signup instead"
    })
}
// Get Specific User
exports.getUser = asyncErrorHandler(async(req, res, next) => {
    req.params.id = req.user.id
    next()
})

// Update User
exports.updateMe = asyncErrorHandler(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(
            new AppError('You cant update password with this route, kindly use /updatePassword', 400)
        )
    }

    // Allow only name and email to be updated - Filters out unwantd fields name that are not allowed to be updated
    const filteredBody = filterReqObj(req.body, 'name', 'email')
    // Update user
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
// Update User - Only for admin - Do not update password with this
exports.updateUser = factory.updateOne(User)

// Delete User
exports.deleteUser = factory.deleteOne(User)

