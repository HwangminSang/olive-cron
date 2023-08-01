const request = require('request')

module.exports = {
  callAPI: function (url, data, callback) {
    const options = {
      method: 'PUT',
      url: url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
      },
      body: data,
      json: true,
    }

    request(options, function (error, response, result) {
      if (error) {
        return callback(error)
      } else {
        callback(null, result)
      }
    })
  },
}
