const express = require('express')
const router = express.Router()
const { index, login } = require('../controller/common')

/* GET home page. */
router.get('/', index)
router.get('/login/', login)

router.get('/logout/', function (req, res) {
  req.logout()
  res.redirect('/')
})

router.get('/:slug', function (req, res) {
  console.log(req.params.slug)
  res.render('pages/' + req.params.slug + '.html')
})

module.exports = router
