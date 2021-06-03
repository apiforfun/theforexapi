const express = require('express')
const router = express.Router()
const passport = require('passport')
const { Code, User } = require('./../models/User')

router.get('/google/', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback/',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async function (req, res) {
    console.log(req.user._json.name)
    // create user if he is not in the system already
    if (await User.exists({ id: req.user._json.id }) == false) {
      const user = new User({
        id: req.user._json.id,
        email: req.user._json.email,
        name: req.user._json.name
      })
      await user.save()
      res.redirect('/app/')
    } else if (await User.exists({ id: req.user._json.id, is_active: false })) {
      // if user is not active, logout the request and show him that his account is not active.
      req.logout()
      res.render('user/auth_blocked.html')
    } else {
      res.redirect('/app/')
    }
  }
)

module.exports = router
