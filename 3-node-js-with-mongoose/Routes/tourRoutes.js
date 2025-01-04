
exports.checkID = (res, req, next, val) => {
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid id'
        })
        
    }
    next()
}

exports.checkBody = (res, req, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    next()
}

exports.getAllTour = (res, req) => {
    const id = req.params.id * 1
    const tour = tours.find
}