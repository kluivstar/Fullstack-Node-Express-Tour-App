const Review = require('../Models/reviewsModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')

// exports.setTourUserIds = (req, res, next) => {
//     if(!req.body.tour) req.body.tour = req.params.setTourId
//     if(!req.body.user) req.body.user = req.user.id
//     next()
// }

exports.getAllReviews = asyncErrorHandler( async(req, res, next) => {
    const reviews = await Review.find()

    res.status(200).json({
        status: "success",
        results: reviews.length,
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

