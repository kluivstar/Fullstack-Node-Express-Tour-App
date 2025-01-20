const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')

// parsing incoming request
const router = express.Router()

// Auth Route
router.post('/signup', authController.signup);


// User Route
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router
