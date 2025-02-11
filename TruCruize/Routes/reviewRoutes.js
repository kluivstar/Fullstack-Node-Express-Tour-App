const express = require('express')
const authController = require('./../Controllers/authController')
const reviewController = require('./../Controllers/reviewsController')
const router = express.Router({ mergeParams: true})

router.use(authController.protect)

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrict('user'), reviewController.setTourUserIds, reviewController.createReview)
    
router
    .route('/:id')
    .delete(authController.restrict('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrict('user', 'admin'), reviewController.updateReview)
    
module.exports = router