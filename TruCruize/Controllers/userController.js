const User = require('./../Models/userModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const multer = require('multer')
const sharp = require('sharp');
const jwt = require('jsonwebtoken')
const AppError = require('../Utils/appError')
const util = require('util')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')
const authController = require('./authController')
const factory = require('./handlerFactory')

// 1. Setting Up Storage Configuration
// This defines how uploaded files should be stored.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   // Defines how the uploaded file should be named: extracting the file extension from file.mimetype in req body
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

// Use this used instead of above since we install Sharp for image processing
const multerStorage = multer.memoryStorage();

// 2. File Type Filtering
//This function ensures that only image files are accepted.
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        // cb stands for callback. It is a function provided by Multer to control whether a file should be accepted or rejected.
        cb(null, true) // No error , accept file
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false)
    }
}

// Multer - Initialize multer middleware
const upload = multer({
    storage: multerStorage, // Defines where files are saved and how they are named.
    fileFilter: multerFilter // Ensures only image files are uploaded.
})

// 4. Handling Single File Upload - one file can be uploaded at a time
exports.uploadUserPhoto = upload.single('photo')

// Resize user photo - runs after photo is uploaded
exports.resizeUserPhoto = asyncErrorHandler(async (req, res, next) => {
    // Checks if Images Exist
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    // Processes the Cover Image, Saves it to public/img/users
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

    next()
}
)

// Filter through only allow fields during User update
const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(prop => {
            if(allowedFields.includes(prop))
                newObj[prop] = obj[prop]
    })
    return newObj
}

// Fetch User
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
next() // Calls userController.getUser
}

// Create User
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route is not defind, use /signup instead"
    })
}
// Get user without needing the user Id
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };

// Update User
exports.updateMe = asyncErrorHandler(async (req, res, next) => {

    if(req.body.password || req.body.passwordConfirm){
        return next(
            new AppError('You cant update password with this route, kindly use /updatePassword', 400)
        )
    }

    // Allow only name and email to be updated - Filters out unwantd fields name that are not allowed to be updated
    const filteredBody = filterReqObj(req.body, 'name', 'email')

    // if a file is uploaded store its file name in filteredBody.photo
    if(req.file) filteredBody.photo = req.file.filename

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {

    await User.findByIdAndUpdate(req.user.id, { active: false });
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
// Update User - Only for admin - Do not update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

