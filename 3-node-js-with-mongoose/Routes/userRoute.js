const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')

// parsing incoming request
const router = express.Router()

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.getAllUsers)

// router
//     route('/:id')
//     .get(userController.getAllUsers)


module.exports = router
