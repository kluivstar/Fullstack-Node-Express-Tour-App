const fs = require('fs')
const mongoose = require('mongoose')
// import dotenv
const dotenv = require('dotenv')

// Reading/loading our config file defining our environmental variable like CONN_STR
dotenv.config({path: './config.env'})

const Tour = require('./../Models/tourModel')
const User = require('./../Models/userModel')
const Review = require('./../Models/reviewsModel')

// const DB = process.env.CONN_STR.replace('<PASSWORD>', process.env.DB_PASSWORD)

// mongoose.connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// }).then(() => {
//     console.log('DB started something.')
// })

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true,
}).then((conn) => {
    console.log('DB started something.')
}).catch((error) =>{
    console.log(error)
})

// Read mock "tour" data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))
// console.log('Tours data:', tours);
// console.log('Reviews data:', reviews);
// console.log('Users data:', users);


// Delete tour function
const deleteData = async () => {
    try {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      console.log('Data successfully deleted!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };

// Import tour data
const importData = async ()=> {
    try {
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews)
        console.log('Data created successfully')
    }catch(err){
        console.error('Import failed:', err)
    }
    process.exit()
}

// Delete Prev data and import new one
if(process.argv[2] === '--import'){
    importData()
} else if(process.argv[2] === '--delete'){
    deleteData()
}

