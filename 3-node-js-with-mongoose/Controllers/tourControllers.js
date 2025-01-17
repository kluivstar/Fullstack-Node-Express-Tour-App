const Tour = require('./../Models/tourModel')
const fs = require('fs')
const APIFeatures = require('./../Utils/ApiFeatures')
const AppError = require("../Utils/AppError")
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')


exports.aliaTopTours = (req,res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = asyncErrorHandler(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

    
    // Execute Query
    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
            }
        })
    } 
)

exports.getTour = asyncErrorHandler(async (req, res, next)=>{
    
    const tour =  await Tour.findById(req.params.id)
    if (!tour){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.createTour = asyncErrorHandler(async (req, res, next) => {
    
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
})

exports.updateTour = asyncErrorHandler(async (req, res, next) => {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        
        if(!tour){
            return next(new AppError("No tour found with that ID", 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    
})

exports.deleteTour = asyncErrorHandler(async (req, res) => {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })
});

exports.getTourStats = asyncErrorHandler(async (req, res) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5}}
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'},
                    numTours: { $sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRatings: {$sum: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort: {avgPrice: 1}
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
})

exports.getMonthlyPlan = asyncErrorHandler(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {$unwind: '$startDates'},
        {$match: {
            startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`),
            }
        }},
        {
            $group: {
                _id: {$month: '$startDates'},
                numTourStarts: {$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0 // hides id field
            }
        },
        {
            $sort: {numTourStarts: -1}
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})
