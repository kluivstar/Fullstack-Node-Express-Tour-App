const Review = require('./../Models/reviewsModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')

exports.getAllReviews = asyncErrorHandler( async(req, res, next) => {
    const reviews = await Review.find()
    res.status(200).json({
        status: "success",
        data: {
            reviews
        }
    })
    
})

exports.createReview = asyncErrorHandler(async(req, res, next) => {
    const newReview = await Review.create(req.body)
    res.status(201).json({
        status: "Review added",
        data: {
            newReview
        }
    })
})