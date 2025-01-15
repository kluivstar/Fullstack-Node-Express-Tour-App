const Tour = require('./../Models/tourModel')
const fs = require('fs')

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../data/tours-simple.json`)
  );

  
exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        //only returns if theres no name and price in req
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    // if theres a name and price in req.body next is called to create tour
    next()
}

exports.aliaTopTours = (req,res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.checkID = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    next()
}


exports.getAllTours = async (req, res) => {
    try{
        
        // const features = new APIFeatures(Tour.find(), req.query)
        // .filter()
        // .sort()
        // .limitFields()
        // .paginate()

        // Build query
        // 1 Filter
        const queryObj = {...req.query};
        const excludedFields = ['sort', 'fields', 'page', 'limit', 'page'];
        excludedFields.forEach(el => delete queryObj[el]);
        
        // Advance filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

        let query = Tour.find(JSON.parse(queryStr))
        
        // 2 Sort 
        if (req.query.sort) {
            // if sort exist, value is split into an arry and join with space to form a string
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            // if no sorting most recent tours will be re
            query = query.sort('-createdAt')
        }

        // 3 Field Limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }

        // 4 Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100
        const skip = (page - 1 ) * limit
        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numTours = await Tours.countDocuments()
            if(skip >= numTours) throw new Error('This page does not exist')
        }
        // Execute Query
        const tours = await query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
            }
        })
    } catch (err){
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour =  await Tour.findById(req.params.id)

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
        message: err
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
        message: err
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5}}
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'},
                    numTours: { $sum: 1},
                    numRatings: {$sum: '$ratingsAverage'},
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
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}