const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// user Schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"]
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        // validator checks if the value of confirmPassword matches the password field.
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(val){
                return val == this.password
            },
            message: "Password do not match"
        }
    },
    active:  {
        type: Boolean,
        default: true,
        select: false
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
    
})

// INSTANCE METHODS

// Encrypts password before it is saved to DB
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

        // Encrypt/Hash password before saving it
        this.password = await bcrypt.hash(this.password, 12)
        
        // Delete confirm password field
        this.passwordConfirm = undefined
        next()
})

// Instance runs before query in getAllUsers RHF to get active users
userSchema.pre(/^find/, async function(next){
    this.find({active: {$ne: false}})
    next()
})

// Instance method - Verifies if password entered matches hashed password in DB - Authenticate users during login (correctPassword).
userSchema.methods.correctPassword = async function(
    candidatePassword, // Raw password entered by user
    userPassword // Hashed password
) {
    // Hashes and returns 'true' if match
    return await bcrypt.compare(candidatePassword, userPassword)
}

// For protect RHF
// The method checks if the token was issued before the password was changed. If it was, the token is no longer valid because the user’s credentials have changed.
// changedPasswordAfter is called during jwt auth when a used makes a request
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    // if a user changes their password, passwordChangedAt exists
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        
        return JWTTimestamp < changedTimestamp // Is token issued before password change?
    }

    return false // false means valid-password did not change-jwToken issued after password changed(false) not before(true)
}

//
userSchema.methods.createResetPasswordToken = function() {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash the token and stores it in the passwordResetToken field
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set the token expiration time
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    
    console.log(resetToken, this.passwordResetToken)

    //Return the plain token via email
    return resetToken

}
// user Model
const User = mongoose.model('User', userSchema)

module.exports = User;