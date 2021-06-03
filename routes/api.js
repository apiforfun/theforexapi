const express = require('express')
const router = express.Router()
const { latestData, dateData } = require('../controller/api')

/* GET home page. */
router.get('/latest', latestData)
router.get('/:dateParam', dateData)

module.exports = router
