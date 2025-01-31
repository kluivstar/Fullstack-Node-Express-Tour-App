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

// Protect all route after this middleware - SETS req.user object
// Instead of adding protect controller inline in endpoint
    router.use(authController.protect)

    // router.patch('/updatePassword', authController.updatePassword)
    // router.get('/getUser', userController.getUser)
    router.patch('/updateUser', userController.updateUser)
    router.delete('/deleteUser', userController.deleteUser)

// User Route Definition
router
    // Routes defined as / under the /users path - {{URL}}/users
    .route('/') // root path of router - router did not define a route for /getAllUsers, so dont make a req to it, use /users instead, it handles GET req.
    .get(userController.getAllUsers)
    .post(userController.createUser)
    
// User Route Parameter
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateMe)
    .delete(userController.deleteUser)


module.exports = router
