const Tour = require('./../Models/tourModel')
const fs = require('fs')
const APIFeatures = require('../Utils/apiFeatures')
const AppError = require("../Utils/appError")
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')



exports.deleteOne = Model => asyncErrorHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc) {
        return next(new AppError('No tour found with that ID'), 404)
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});