const express = require('express')
const authController = require('./../Controllers/authController')

// parsing incoming request
const router = express.Router()

// 
    router.post('/signup', authController.signup);
    router.post('/login', authController.login);
    router.post('/forgotPassword', authController.forgotPassword);
    router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;