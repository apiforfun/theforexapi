const MongoClient = require('mongodb').MongoClient
const { ApiToken, Code, User } = require('./../models/User')
const db = require('../config/keys').MongoURI

async function latestData (req, res, next) {
  MongoClient.connect(db, { useUnifiedTopology: true }, function (err, dbo) {
      const db = dbo.db('theforexapi')
      const collection = db.collection('currency')
      fields = { base: 1, date: 1, _id: 0, rates: 1 }
      query = { base: 'EUR' }

      if (req.query.base) {
        query = { base: req.query.base.toUpperCase() }
      }
      if (req.query.symbols) {
        fields = { base: 1, date: 1, _id: 0 }
        symbols = req.query.symbols.split(',')
        for (each in symbols) {
          symbol = 'rates.' + symbols[each].toUpperCase()
          fields[symbol] = 1
        }
      }
      console.log(query)
      console.log(fields)
      const cursor = collection.find(query, { fields: fields }).sort({ date: -1 }).limit(1).toArray(function (err, result) {
        if (err) throw err
        dbo.close()
        if (result[0]) {
          res.writeHead(200, { 'Content-Type': 'text/json' })
          res.write(JSON.stringify(result[0]))
        } else {
          res.writeHead(400, { 'Content-Type': 'text/json' })
          res.write(JSON.stringify({ error: 'Invalid base or symbols' }))
        }
        res.end()
      })
    })
}


async function dateData (req, res, next) {
  console.log(req.params.dateParam);
  MongoClient.connect(db, function (err, dbo) {
      const db = dbo.db('theforexapi')
      const collection = db.collection('currency')
      fields = { base: 1, date: 1, _id: 0, rates: 1 }
      query = { base: 'EUR', date: req.params.dateParam }
      if (req.query.base) {
        query.base = req.query.base.toUpperCase()
      }
      if (req.query.symbols) {
        fields = { base: 1, date: 1, _id: 0 }
        symbols = req.query.symbols.split(',')
        for (each in symbols) {
          symbol = 'rates.' + symbols[each].toUpperCase()
          fields[symbol] = 1
        }
      }
      const cursor = collection.find(query, { fields: fields }).sort({ date: -1 }).toArray(function (err, result) {
        if (err) {
          throw err
        }
        dbo.close()
        if (result[0]) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.write(JSON.stringify(result[0]))
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(JSON.stringify({ error: 'Invalid base or symbols' }))
        }
        res.end()
      })
    })
  
}

module.exports = { latestData, dateData }
