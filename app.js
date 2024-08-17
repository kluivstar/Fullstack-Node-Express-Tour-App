// Setting Up Express and Reading the JSON File
const express = require('express')
const fs = require("fs")

const app = express()
// Read file
let movies = JSON.parse(fs.readFileSync("./data/movies.json"))

// Middleware that parse incoming JSON request
app.use(express.json())


// GET - api/movies, GET Request to Retrieve All Movies
app.get('/movies', (req, res)=>{
    res.status(200).json({
        // json json formatting
        status: "success",
        data: {
            movies:movies
        }
    })
})

// GET Request to Retrieve a Single Movie by ID
app.get('/movies/:id', (req, res) =>{
    // The id is extracted from the URL (req.params.id) and converted to a number using 
    const id = req.params.id * 1
    // FIND MOVIE BASED ON PRODUCT ID PARAMETER
    let movie = movies.find(el => el.id === id)

    // IF MOVIE IS NOT FOUND
    if(!movie){
        return res.status(404).json({
            status: "fail",
            data: {
                message: `Movie with ${id} not found`
            }
        })
    }
    res.status(200).json({
        status: "success",
        data: {
            movie: movie
        }
    })
})
// POST - api/movies
app.post('/movies', (req, res) => {
     // extracting the id from the request using "params" then multiplying by 1 to make it a number
    const newID = movies[movies.length - 1].id + 1
    const newMovie = Object.assign({id: newID}, req.body)
    movies.push(newMovie)
    fs.writeFile('/data/movies.json', JSON.stringify(movies), (err)=>{
        res.status(201).json({
            status: "success",
            data: {
                movies:newMovie
            }
        })
    })
})
app.patch('/movies/:id', (req, res) => {
     // extracting the id from the request using "params" then multiplying by 1 to make it a number
    let id = req.params.id * 1
    let movieToUpdate  = movies.find(el => el.id === id)
    let index = movies.indexOf(movieToUpdate)
    Object.assign(movieToUpdate, req.body)

    movies[index] = movieToUpdate
    
    fs.writeFile("./data/movies.json", JSON.stringify(movies), (err)=>{
        res.status(200).json({
            status: "success",
            data: {
                movie: movieToUpdate
            }
        })
    })
})

app.delete('/movies/:id', (req, res) =>{
    // extracting the id from the request using "params" then multiplying by 1 to make it a number
    const id = req.params.id * 1
    
    // matching user route parameter id to id of movie array
    const movieToDelete = movies.find(el=> el.id === id)
    // If theres no movies to remove from the server
    if(!movieToDelete){
        return res.status(404).json({
            status: "fail",
            data: {
                message: `Movie with ${id} not found`
            }
        })
    }

    const index = movies.indexOf(movieToDelete)
    movies.splice(index, 1)

    // when theres movies to remove from server
    fs.writeFile('./data/movies.json', JSON.stringify(movies), (err) => {
        res.send(204).json({
            status: "success.",
            data: {
                movie: null
            }
        })
    })
})
// Create Server
const port = 3000
app.listen(port, ()=>{
    console.log("Server wanna be startin something.")
})