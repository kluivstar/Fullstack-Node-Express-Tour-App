const fs = require('fs')
const mongoose = require('mongoose')
// import dotenv
const dotenv = require('dotenv')

//reading/loading our config file defining our environmental variable like CONN_STR
dotenv.config({path: './config.env'})

const Tour = require('./../Models/tourModel')

// const DB = process.env.DATABASE.replace(
//     '<PASSWORD',
//     process.env.DATABASE_PASSWORD
// )

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true,
}).then((conn) => {
    console.log('DB started something.')
}).catch((error) =>{
    console.log(error)
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

const deleteTour = async ()=> {
    try {
        await Tour.deleteMany()
        console.log('Data cleared successfully')
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

const importData = async ()=> {
    try {
        await Tour.create(tours)
        console.log('Data created successfully')
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

if(process.argv[2] === '--import'){
    importData()
} else if(process.argv[2] === '--delete'){
    deleteTour()
}