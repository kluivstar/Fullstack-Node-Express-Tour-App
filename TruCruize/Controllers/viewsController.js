const Tour = require('../Models/tourModel.js')
const User = require('../Models/userModel.js')
const AppError = require('../Utils/appError')
const asyncErrorHandler = require('../Utils/asyncErrorHandler')

exports.getOverview = asyncErrorHandler( async (req, res, next) => {
    // get tour data from collection

    const tours = await Tour.find()

    // render template using tour data - populate
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = asyncErrorHandler( async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if(!tour){
        return next (new AppError ('There is no tour with that name...', 404))
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLoginForm = asyncErrorHandler( async(req, res, next) => {
    const tours = await Tour.find()

    res.status(200).render('login', {
        title: 'Log into your account',
    })
})


exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
    console.log(res)
}