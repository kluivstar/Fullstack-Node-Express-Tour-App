// const mongoose = require('mongoose');
// const validator = require('validator')
// const bcrypt = require('bcrypt')
// const crypto = require('crypto')

// // user Schema
// const userSchema = new mongoose.Schema({
//     name:{
//         type: String,
//         required: [true, "Please enter your name"]
//     },
//     email:{
//         type: String,
//         required: [true, 'Please enter your email'],
//         unique: true,
//         lowercase: true,
//         validate: [validator.isEmail, 'Please enter a valid email']
//     },
//     photo: String,
    
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user'
//     },
//     password: {
//         type: String,
//         required: [true, 'Please enter a password'],
//         minlength: 8,
//         select: false
//     },
//     confirmPassword: {
//         // validator checks if the value of confirmPassword matches the password field.
//         type: String,
//         required: [true, 'Please confirm your password'],
//         validate: {
//             validator: function(val){
//                 return val == this.password
//             },
//             message: "Password and Confirm password don't match"
//         }
//     },
//     active:  {
//         type: Boolean,
//         default: true,
//         select: false
//     },

//     passwordChangedAt: Date,
//     passwordResetToken: String,
//     passwordResetTokenExpires: Date
    
// })

// userSchema.pre('save', async function(next){
//     if(!this.isModified('password')) return next()
//         // encrypt password before saving it
//         this.password = await bcrypt.hash(this.password, 12)
//         this.confirmPassword = undefined
//         next()
// })

// // Instance runs before query in getAllUsers RHF to get active users
// userSchema.pre(/^find/, async function(next){
//     this.find({active: {$ne: false}})
//     next()
// })

// // logging in a user by comparing credentials
// userSchema.methods.comparePasswordInDb = async function(pswd, pswdDB){
//     return await bcrypt.compare(pswd, pswdDB)
// }

// userSchema.methods.isPasswordChanged = async function(JWTTimestamp) {
//     if(this.passwordChangedAt){
//         const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000)
//         console.log(pswdChangedTimestamp, JWTTimestamp)

//         return JWTTimestamp < pswdChangedTimestamp
//     }
//     return false
// }

// //
// userSchema.methods.createResetPasswordToken = function() {
//     // Generate random token
//     const resetToken = crypto.randomBytes(32).toString('hex')

//     // Hash the token and stores it in the passwordResetToken field
//     this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

//     // Set the token expiration time
//     this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    
//     console.log(resetToken, this.passwordResetToken)

//     //Return the plain token via email
//     return resetToken

// }
// // user Model
// const User = mongoose.model('User', userSchema)

// module.exports = User;