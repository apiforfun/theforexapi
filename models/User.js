const mongoose = require('mongoose')

const User = mongoose.model('User', mongoose.Schema({
  id: String,
  name: String,
  email: String,
  registered_on: {
    type: Date,
    default: Date.now
  },
  is_active: { type: Boolean, default: true }
}, { timestamps: true }))

const ApiToken = mongoose.model('ApiToken', mongoose.Schema({
  token: String,
  user_id: String,
  created_on: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }))

module.exports = { User, ApiToken }
