const Tour = require('./../Models/tourModel')
const fs = require('fs')
const APIFeatures = require('../Utils/apiFeatures')
const AppError = require("../Utils/appError")
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')

// Get All Document
exports.getAll = Model => asyncErrorHandler(async (req, res, next) => {

    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}

    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

    
    // Execute Query
    const doc = await features.query
    // const doc = await features.query.explain() // explain method provide sexecutionStats in query result/response

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
            }
        })
    } 
)

// Get Single Document (e.g., user, tour, product) by its ID from the database.
exports.getOne = (Model, popOptions) => asyncErrorHandler(async (req, res, next) => {

    //  Build the base query
    let query = Model.findById(req.params.id)

    //  Optionally populate referenced fields
    if (popOptions) query = query.populate(popOptions)
      
    // Execute the query
    const doc = await query;

    if(!doc){
        return next(new AppError('No document found with that ID', 404))
    }

    // Send back the document
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

// Create Document
exports.createOne = Model => asyncErrorHandler(async (req, res, next) => {
    
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            tour: doc
        }
    })
})

// Update Document
exports.updateOne = Model => asyncErrorHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    if(!doc){
        return next(new AppError("No document found with that ID", 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })

})

// Delete Document
exports.deleteOne = Model => asyncErrorHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc) {
        return next(new AppError('No document found with that ID'), 404)
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});