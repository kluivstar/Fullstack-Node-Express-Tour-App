const Tour = require('./../Models/tourModel')

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
        const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    const tours = await feature.query

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
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

exports.getTour = async (req,res) => {
    try {
    const tour =  await Tour.findById(req.params.id * 1)
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
                tour: '<Updated tour here...>'
            }
        })
    } catch(err){
        res.status(404).json({
            status: 'fail',
        message: err
        })
    }
}

exports.deleteTour =(req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}