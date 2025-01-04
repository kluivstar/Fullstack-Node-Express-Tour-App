const Tour = require('./../Models/tourModel')

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
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

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
}

exports.getTours = (req,res) => {
    const id = req.params.id * 1
    const tour = tours.find(tour => tour.id === tour)
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
}

exports.updateTour =(req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour =(req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}