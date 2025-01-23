const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')

// parsing incoming request
const router = express.Router()

// Auth Route
    router.post('/signup', authController.signup);
    router.post('/login', authController.login);
    router.post('/forgotPassword', authController.forgotPassword);
    router.patch('/resetPassword/:token', authController.resetPassword);
    router.patch('/updatePassword', authController.protect, authController.updatePassword)

// Protect all route after this middleware
    // router.use(authController.protect)

    // router.patch('/updatePassword', authController.updatePassword)
    // router.get('/getUser', userController.getUser)
    // router.patch('/updateUser', userController.updateUser)
    // router.delete('/deleteUser', userController.deleteUser)

// User Route
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.getAllUsers)
    
// User Route Parameter
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router
