const { randomString, get_pagination_numbers } = require('./../config/rclib')
const { ApiToken, Code, User } = require('./../models/User')

function index (req, res, next) {
  res.render('user/index.html')
}

async function apiKeys (req, res, next) {
  console.log(req.user._json.sub)
  ApiToken.find({ user_id: req.user._json.sub }, function (err, docs) {
    res.render('user/api/list.html', { tokens: docs })
  })
}

async function apiNewKey (req, res, next) {
  const apitoken = new ApiToken({
    token: randomString(40),
    user_id: req.user._json.sub
  })
  await apitoken.save()
  res.redirect('/app/api-keys/')
}

function codeHistory (req, res, next) {
  const resPerPage = 9 // results per page
  const page = req.params.page // Page

  const current_page = req.params.page
  const no_of_items = 12

  ApiToken.find({ user_id: req.user._json.sub }, { token: 1 }, function (err, docs) {
    // Map the docs into an array of just the _ids
    const tokens = docs.map(function (doc) { return doc.token })
    console.log(req.user._json.sub)
    console.log(tokens)
    // Get the companies whose founders are in that set.
    Code.find({ api_token: { $in: tokens } }, {}, { skip: (resPerPage * current_page) - resPerPage, limit: resPerPage }, async function (err, docs) {
      const total_items = await Code.countDocuments({ api_token: { $in: tokens } })

      console.log(get_pagination_numbers(total_items, current_page, no_of_items))
      prev_page, next_page, page_count = get_pagination_numbers(total_items, current_page, no_of_items)

      res.render('user/code/list.html', {
        codes: docs,
        current_page: current_page,
        total_items: total_items,
        prev: prev_page,
        next: next_page,
        page_count: page_count + 1
      })
    })
  })
}

async function codeDetail (req, res, next) {
  if (req.params.codeId.length == 24) {
    const code = await Code.findById(req.params.codeId).then(async function (doc) {
      if (doc) {
        const apitoken = await ApiToken.findOne({ token: doc.api_token }, function (err, tokendoc) {
          if (tokendoc) {
            if (tokendoc.user_id == req.user._json.sub) {
              res.render('user/code/detail.html', { doc: doc })
            } else {
              res.render('user/code/not_found.html')
            }
          } else {
            res.render('user/code/not_found.html')
          }
        })
      } else {
        res.render('user/code/not_found.html')
      }
    }).catch((err) => {
      console.log(err)
    })
  } else {
    res.render('user/code/not_found.html')
  }
}

module.exports = { index, apiKeys, apiNewKey, codeHistory, codeDetail }
