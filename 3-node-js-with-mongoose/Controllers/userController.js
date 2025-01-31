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

// Fetch User
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next() // Calls userController.getUser
}

// Create User
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route is not defind, use /signup instead"
    })
}

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

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id), {active: false}
    res.status(204).json({
        status:' success',
        data: null
    })
})

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
// Update User - Only for admin - Do not update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

