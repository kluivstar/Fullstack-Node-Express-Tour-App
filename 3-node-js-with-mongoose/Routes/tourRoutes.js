const express = require('express')
const tourController = require('./../Controllers/tourControllers')

const router = express.Router()

router
    .route('/')
    .get(tourController.getAllTours)

module.exports = router