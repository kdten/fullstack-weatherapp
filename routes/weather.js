const express = require('express')
const router = express.Router()
const weatherController = require('../controllers/weather')

router.get("/", weatherController.getIndex) 

// endpoint to receive data from front-end lat and long from current postion
router.post("/", weatherController.postCurrentLoc)

module.exports = router