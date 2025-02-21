const express = require('express')
const userController = require('./../Controllers/userController')
const authController = require('./../Controllers/authController')
const viewsController = require('./../Controllers/viewsController')


// creates a mini express app/obj for handling route - organize routes(GET, POST, PUT, DELETE)
const router = express.Router()
router
    .get('/', viewsController.getOverview)
    .get('/login', viewsController.getLoginForm)

router
    .get('/tour/:slug', viewsController.getTour)


module.exports = router
