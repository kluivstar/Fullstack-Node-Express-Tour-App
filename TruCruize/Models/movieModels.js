// const mongoose = require('mongoose');
// const validator = require('validator')
// const fs = require("fs");
// // creating a schema and model
// const movieSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required'],
//         unique: true,
//         trim: true,
//         maxLength: [100, "Movie name must not be more than 100 characters"],
//         minLength: [5, "Movie name must not be less than 5 characters"],
//         validate: [validator.isAlpha, 'Name should only contain alphabets']
//     },
    
//     description: {
//         type: String,
//         required: [true, 'Description is required field!'],
//         trim: true
//     },
//     duration: {
//         type: Number,
//         required: [true, 'Duration is required field!']
//     },
//     ratings: {
//         type: Number,
//         validate: {
//             validator: function(value){
//                 return value >= 1 && value <= 10;
//             },
//             message: "Ratings ({VALUE}) should be 1 or below 10"
//         },
//     },

//     totalRating: {
//         type: Number
//     },
//     releaseYear: {
//         type: Number,
//         required: [true, 'Release year is required field!']
//     },
//     releaseDate:{
//         type: Date
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now(),
//         select: false
//     },
//     genres: {
//         type: [String],
//         required: [true, 'Genres is required field!'],
//         enum: {
//             values: ['Action', 'Adventure', 'Sci-Fi', 'Comedy', 'Crime'],
//             message: "This genre no dey"
//         }
//         // enum: {
//         //      values: ["Action", "Adventure", "Sci-Fi", "Thriller", "Crime", "Drama", "Comedy", "Romance", "Biography"],
//         //      message: "This genre does not exist"
//         // }
//     },
//     directors: {
//         type: [String],
//         required: [true, 'Directors is required field!']
//     },
//     coverImage:{
//         type: String,
//         require: [true, 'Cover image is required field!']
//     },
//     actors: {
//         type: [String],
//         require: [true, 'actors is required field!']
//     },
//     price: {
//         type: Number,
//         require: [true, 'Price is required field!.']
//     },
//     createdBy: String
    
// }, {
//     toJSON: {virtuals: true},
//     toObject: {virtuals: true}
// });

// // virtual properites
// movieSchema.virtual('durationInHours').get(function(){
//     return this.duration / 60
// });

// // executing a 'pre' hook/a middleware function on a save event before a document is saved to database
// movieSchema.pre('save', function(next) {
//     this.createdBy = "X"
//     next();
// });

// movieSchema.post('save', function(doc, next){
//     const content = `A new movie document with ${doc.name} has been created by ${doc.createdBy}\n`;
//     fs.writeFileSync('./Log/log.txt', content, {flag: 'a'}, (err)=>{
//         console.log(err.message);
//     });
//     // calls the next middleware, which is the create post RHF
//     next();
// });

// // handling pre query with Query Middleware
// movieSchema.pre('find', function(next){
//     this.find({releaseDate: {$lte: Date.now()}})
//     next()
// })

// // using post Query middleware to display movies to be released
// movieSchema.post(/^find/, function(doc, next){
//     this.find({releaseDate: {$lte: Date.now()}})
//     this.endTime = Date.now()
//     const content = `Query took ${this.endTime - this.startTime} milliseconds to fetch the document`
//     fs.writeFileSync('./Log/log.txt', content, {flag: 'a'}, (err)=>{
//         console.log(err.message);
//     });
//     next()
// })

// // Pre - Aggregation query
// movieSchema.pre('aggregate', function(next){

//     next()
// })

// // creating model with schema..
// const Movie = mongoose.model('Movie', movieSchema);
// module.exports = Movie;

