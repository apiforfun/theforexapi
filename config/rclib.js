
function randomString (length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result.toString()
}

function get_pagination_numbers (total, current_page, no_of_items) {
  pageCount = Math.ceil(total / no_of_items)
  prev_page = next_page = ''
  if (prev_page != 1) {
    prev_page = current_page - 1
  }
  if (total > 0 && current_page != pageCount) {
    next_page = parseInt(current_page) + 1
  }

  return prev_page, next_page, pageCount
}

// var rString = randomString(32);

module.exports = { randomString, get_pagination_numbers }
