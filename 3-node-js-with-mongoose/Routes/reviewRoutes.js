const express = require('express')
const authController = require('./../Controllers/authController')
const reviewController = require('./../Controllers/reviewsController')
const router = express.Router({ mergeParams: true})

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrict('user'), reviewController.setTourUserIds, reviewController.createReview)
    
router
    .route('/:id')
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview)
    
module.exports = router