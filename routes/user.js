const express = require('express')
const router = express.Router()
const { index, apiKeys, apiNewKey, codeHistory, codeDetail } = require('../controller/userapp')

/* GET users listing. */
router.get('/', index)

router.get('/api-keys', apiKeys)
router.get('/api-keys/new', apiNewKey)

router.get('/code-history/:page', codeHistory)
router.get('/code-detail/:codeId', codeDetail)

module.exports = router
