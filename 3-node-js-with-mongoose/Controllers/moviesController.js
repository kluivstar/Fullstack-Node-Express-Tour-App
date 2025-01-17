const {params} = require('../Routes/moviesRoutes')
const Movie = require('./../Models/movieModels')
const ApiFeatures = require('./../Utils/ApiFeatures')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const AppError = require('../Utils/AppError')

// GETTING HIGHEST RATED USING ALIASE
exports.getHighestRated = (req, res, next) => {
    //setting properties on query object  from request obj
    req.query.limit = "5"
    req.query.sort = '-ratings'

    // calls getAllMovies with above properties applied to SORT and other logic that uses above properties 'limit', 'sort'
    next()
}

// ROUTE HANDLER FUNCTIONS
exports.getAllMovies = asyncErrorHandler(async (req, res, next)=>{
        const features = new ApiFeatures(Movie.find(), req.query)
                        .filter()
                        .sort()
                        .limitFields()
                        .paginate()

        // wait for query to return a result and assign to movie then movies is sent as a response
        let movies = await features.query
        //ADVANCE FILTERING (greater than/ less than/ greater than equal to/ less than equal to)

        // let queryStr = JSON.stringify(req.query)

        // CONVERT REQ QUERY TO MONGO DB FORMAT
        //const regex = /\b(gte|gt|lte|lt)\b/g

        //queryStr = queryStr.replace(regex, (match) => `$${match}`)

        //const queryObj1 = JSON.parse(queryStr)


        //this.query = this.query.find(queryObj1)
    //}
    
        // EXCLUDE FIELDS
        //const excludeFields = ['sort', 'page', 'limit', 'fields']
        //const queryObj = { ...req.query }
        //excludeFields.forEach((el) => //delete queryObj[el])


        //SORT
       // req.query.sort
        //? query.sort(req.query.sort.split(',').join(' '))
        //: query.sort('-name')

        //LIMITING FIELDS

       // req.query.fields
        //? query.select(req.query.fields.split(',').join(' '))
        //: query.select('-__v')

        //Pagination

        //const page = +req.query.page || 1
        //const limit = +req.query.limit || 5
        //const skip = (page - 1) * limit
        //query = query.skip(skip).limit(limit)

        //if (req.query.page) {
        //promise awaiting data and assigning to 'moviesCount
        //const moviesCount = await Movie.countDocuments()
       // if (skip >= moviesCount)
        //    throw new Error(' Page not found!')
        //}

    //const movies = await features.query
        res.status(200).json({
            status: "success.",
            length: movies.length,
            data: {
                movies
            }
        })
   
} )

// GET SPECIFIC MOVIE/ID RP
exports.getMovie = asyncErrorHandler(async (req, res, next) =>{
        const movie = await Movie.findById(req.params.id)
        
        console.log(x)
        if(!movie){
            const error = new AppError(`Movie with ID is not found`, 404)
            return next(error)
        }
        res.status(200).json({
            status: "success",
            data: {
                movie
            }
        })
    }
)


exports.createMovies = asyncErrorHandler(async (req, res, next) => {

        const movie = await Movie.create(req.body)
        
        res.status(200).json({
            status: "success",
            data: {
                movie
            }
        })

})

exports.updateMovie = async (req, res, next) => {
    try {
        const updateMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if(!updateMovie){
            const error = new AppError('Movie with that ID is not found', 404)
            return next(error)
        }
        
        res.status(200).json({
            status: "success",
            data: {
                movie: updateMovie
            }
        })
    }catch(err){
        res.status(404).json({
            status: "fail",
            data: {
                message: err.message
            }
        })
    }
}

exports.deleteMovie = asyncErrorHandler(async (req, res, next) =>{

    const deleteMovie = await Movie.findByIdAndDelete(req.params.id)
    
    if(!deleteMovie){
        const error = new AppError('Movie with that ID is not found', 404)
        return next(error)
    }
    
    res.status(201).json({
        status: "success",
        data: {
            message: 'Movie successfully deleted'
        }
    })
})


exports.getMovieStats = asyncErrorHandler(
    async (req, res, next) => {

        const stats = await Movie.aggregate([
            
            {$match: {ratings: {$gte: 8}}},
            {$group: {
                _id: '$releaseYear',
                avgRating: { $avg: '$ratings'},
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
                priceTotal: { $sum: '$price'},
                movieCount: {$sum: 1}
            }},
            {$sort: {minPrice: 1}},
            //{$match: {maxPrice: {$gte: 2}}}
        ])

        res.status(200).json({
            status: "success",
            count: stats.length,
            data: {
                stats
            }
        })
    
}
)


exports.getMovieByGenre = asyncErrorHandler(
    async (req, res, next) => {

        const genre = req.params.genre;
        const movies = await Movie.aggregate([
            {$match: {releaseDate: {$lte: new Date()}}},
            {$unwind: '$genres'},
            {$group: {
                _id: '$genres',
                movieCount: { $sum: 1},
                movies: {$push: '$name'}, 
            }},
            {$addFields: {genre: "$_id"}},
            {$project: {_id: 0}},
            {$sort: {movieCount: -1}},
            //{$limit: 6}
            //{$match: {genre: genre}}
        ]);

        res.status(200).json({
            status: 'success',
            count: movies.length,
            data: {
                movies
            }
        });
    }
)