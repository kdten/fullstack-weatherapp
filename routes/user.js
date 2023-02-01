const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')

router.get('/', userController.getUser)

router.post('/createUser', userController.createUser)

// router.put('/markDelete', userController.markDelete)

// router.delete('/deleteCity', userController.deleteTodo)

module.exports = router