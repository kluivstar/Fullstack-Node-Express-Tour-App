const express = require('express')
const tourController = require('./../Controllers/tourControllers')

const router = express.Router()

// router
//     .route('/top-5-cheap')
//     .get(tourController.aliaTopTours, tourController.getAllTours)
    
// router
//     .route('/tour-stats')
//     .get(tourController.getTourStats)

// .router
//     .route('monthly-plan/:year')
//     .get(tourController.getMonthlyPlan)

router
    .route('/top-5-cheap')
    .get(tourController.aliaTopTours, tourController.getAllTours)
    
router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router