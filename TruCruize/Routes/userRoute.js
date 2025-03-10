const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')


// creates a mini express app/obj for handling route - organize routes(GET, POST, PUT, DELETE)
const router = express.Router()

// Auth Route
    router.post('/signup', authController.signup);
    router.post('/login', authController.login);
    router.get('/logout', authController.logout);
    router.post('/forgotPassword', authController.forgotPassword);
    router.patch('/resetPassword/:token', authController.resetPassword);
    

// Protect all route after this middleware - SETS req.user object
// Instead of adding protect controller inline in endpoint
    router.use(authController.protect)

    router.patch('/updatePassword', authController.updatePassword)

    router.get('/me', userController.getMe, userController.getUser)

    router.patch('/updateMe', 
        userController.uploadUserPhoto, 
        userController.resizeUserPhoto, userController.updateMe)
        
    router.delete('/deleteUser', 
        userController.deleteMe)

// User Route Definition
router.use(authController.restrict('admin'))

router
    // Routes defined as / under the /users path - {{URL}}/users
    .route('/') // root path of router - router did not define a route for /getAllUsers, so dont make a req to it, use /users instead, it handles GET req.
    .get(userController.getAllUsers)
    .post(userController.createUser)
    
// User Route Parameter
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router
