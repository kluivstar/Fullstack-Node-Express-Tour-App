const express = require('express')
const reviewController = require('../Controllers/reviewsController')
const router = express.Router()
const authController = require('./../Controllers/authController')

// router
//     .route('/')
//     .get(reviewController.getAllReviews)
//     .post(authController.protect, authController.restrict('user'), reviewController.createReview)
    
module.exports = router