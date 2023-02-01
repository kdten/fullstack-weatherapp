const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')

router.get('/', homeController.getIndex) 

// endpoint to receive data from front-end lat and long from current postion
router.post("/", homeController.postCurrentLoc)

module.exports = router