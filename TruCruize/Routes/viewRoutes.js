const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')
const viewsController = require('./../Controllers/viewsController')


// creates a mini express app/obj for handling route - organize routes(GET, POST, PUT, DELETE)
const router = express.Router()

// router.use(authController.isLoggedIn)
/// authController.protect and authController.isLoggedIn both checks if users are logged in
router
    .get('/', authController.isLoggedIn, viewsController.getOverview)
    
router
    .get('/login', authController.isLoggedIn, viewsController.getLoginForm)

router
    .get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)

router
    .get('/me', authController.protect, viewsController.getAccount)

    
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);


module.exports = router
