const MongoClient = require('mongodb').MongoClient
const { ApiToken, Code, User } = require('./../models/User')
const db = require('../config/keys').MongoURI

async function latestData(req, res, next) {
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
    const cursor = collection.find(query, { fields: fields }).sort({ date: -1 }).limit(1).toArray(function (err, result) {
      if (err) throw err
      dbo.close()
      if (result[0]) {
        currency_keys = Object.keys(result[0]['rates'])
        for (let key of currency_keys) {
          result[0]['rates'][key] = parseFloat(result[0]['rates'][key])
        }
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


async function dateData(req, res, next) {
  dateParam = req.params.dateParam
  date_obj = new Date(dateParam);
  dateparam1 = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + (date_obj.getDate() < 10 ? '0' : '') + date_obj.getDate()
  if (date_obj.getDay() == 6) {
    console.log('satuarday')
    date_obj.setDate(date_obj.getDate() - 1);
    dateParam = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + date_obj.getDate()
    dateparam1 = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + (date_obj.getDate() < 10 ? '0' : '') + date_obj.getDate()
  }
  if (date_obj.getDay() == 0) {
    console.log('sunday')
    date_obj.setDate(date_obj.getDate() - 2);
    dateParam = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + date_obj.getDate()
    dateparam1 = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + (date_obj.getDate() < 10 ? '0' : '') + date_obj.getDate()
  }
  MongoClient.connect(db, function (err, dbo) {
    const db = dbo.db('theforexapi')
    const collection = db.collection('currency')
    fields = { base: 1, date: 1, _id: 0, rates: 1 }
    query = { base: 'EUR', "$or": [{date: dateParam}, {date: dateparam1}] }
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
    const cursor = collection.find(query, { fields: fields }).sort({ date: -1 }).toArray(async function (err, result) {
      if (err) {
        throw err
      }
      if (result.length > 0) {
        dbo.close()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(result[0]))
        res.end()
      }
      else {
        index = 0
        function getLastDateData() {
          index = index + 1;
          date_obj = new Date(dateParam);
          date_obj.setDate(date_obj.getDate() - 1);
          dateParam = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + date_obj.getDate()
          dateparam1 = date_obj.getFullYear() + "-" + ("0" + (date_obj.getMonth() + 1)).slice(-2) + "-" + (date_obj.getDate() < 10 ? '0' : '') + date_obj.getDate()
          query = { base: 'EUR', "$or": [{date: dateParam}, {date: dateparam1}] }
          console.log(query)
          const cursor = collection.find(query, { fields: fields }).sort({ date: -1 }).toArray(function (err, result) {
            if (err) {
              throw err
            }
            console.log(result)
            if (result.length > 0) {
              dbo.close()
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.write(JSON.stringify(result[0]))
              res.end()
              return
            } else if (index === 100) {
              res.writeHead(400, { 'Content-Type': 'text/json' })
              res.write(JSON.stringify({ error: 'Invalid base or symbols' }))
            } else {
              getLastDateData()
            }
          })
        }
        getLastDateData()
      }
    })
  })

}

module.exports = { latestData, dateData }
