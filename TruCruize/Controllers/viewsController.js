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
