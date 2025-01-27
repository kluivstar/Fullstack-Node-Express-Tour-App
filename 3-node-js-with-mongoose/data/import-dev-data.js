const fs = require('fs')
const mongoose = require('mongoose')
// import dotenv
const dotenv = require('dotenv')

// Reading/loading our config file defining our environmental variable like CONN_STR
dotenv.config({path: './config.env'})

const Tour = require('./../Models/tourModel')

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true,
}).then((conn) => {
    console.log('DB started something.')
}).catch((error) =>{
    console.log(error)
})

// Read mock tour file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))

const deleteTour = async ()=> {
    try {
        await Tour.deleteMany()
        console.log('Data cleared successfully')
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

// To import mock data to DB first run node ./data/import-dev-data.json --delete

// Then node ./data/import-dev-data.json -- import

const importData = async ()=> {
    try {
        await Tour.create(tours)
        console.log('Data created successfully')
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

// Delete Prev data and import new one
if(process.argv[2] === '--import'){
    importData()
} else if(process.argv[2] === '--delete'){
    deleteTour()
}

// To import mock data to DB first run node ./data/import-dev-data.json --delete

// Then node ./data/import-dev-data.json -- import