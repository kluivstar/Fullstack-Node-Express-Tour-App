const express = require('express')
const tourController = require('./../Controllers/tourControllers')
const authController = require('./../Controllers/authController')
const reviewRouter = require('./../Routes/reviewRoutes')
const router = express.Router()

// from tourRouter in app.js all tours queries matching /:tourId/reviews is rerouted to reviewRouter
router.use('/:tourId/reviews', reviewRouter)

///////////////

// Tour routes
router
    .route('/monthly-plan/:year')
    .get(authController.protect, authController.restrict('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router
    .route('/top-5-cheap')
    .get(tourController.aliaTopTours, tourController.getAllTours)
    
router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.deleteTour)



module.exports = router