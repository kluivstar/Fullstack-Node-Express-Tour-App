const Review = require('../Models/reviewsModel')
const AppError = require('./../Utils/appError')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const APIFeatures = require('./../Utils/apiFeatures');
const factory = require('./handlerFactory')

exports.getAllReviews = asyncErrorHandler(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId}

    const reviews = await Review.find(filter)

    res.status(200).json({
        status: "success",
        results: reviews.length, // number of reviews found
        data: {
            reviews
        }
    })
    
})

exports.createReview = asyncErrorHandler(async(req, res, next) => {
    // Allow nested route
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id

    const newReview = await Review.create(req.body)
    res.status(201).json({
        status: "Review added",
        data: {
            review: newReview
        }
    })
})

exports.deleteReview = factory.deleteOne(Review)
