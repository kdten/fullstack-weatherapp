const express = require('express')
const router = express.Router()
const weatherController = require('../controllers/weather')

// router.get("/", weatherController.getIndex) 

// endpoint to receive data from front-end lat and long from current postion
router.post("/", weatherController.postCurrentLoc)

router.put("/", weatherController.putNewCity) 

router.put("/current", weatherController.putCurrentCity)

router.delete("/", weatherController.deleteCity)

module.exports = router