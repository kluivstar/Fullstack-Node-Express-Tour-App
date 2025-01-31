const Tour = require('./../Models/tourModel')
const fs = require('fs')
const APIFeatures = require('../Utils/apiFeatures')
const AppError = require("../Utils/appError")
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')

exports.getOne = (Model, popOptions) => asyncErrorHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query;

    if(!doc){
        return next(AppError('No document found with that ID', 404))
    }
    
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => asyncErrorHandler(async (req, res, next) => {
    
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            tour: doc
        }
    })
})

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