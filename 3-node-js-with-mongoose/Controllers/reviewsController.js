const Review = require('../Models/reviewsModel')
const AppError = require('./../Utils/appError')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const APIFeatures = require('./../Utils/apiFeatures');
const factory = require('./handlerFactory')

exports.setTourUserIds = (req, res, next) => {
    // Allow nested route
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id
    next()

}
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
