const request = require('request')
const { log } = require('./winston/logger')
const api_key = 'apikey'
const api_secret = 'apisecret'

const url = `https://api.nexmo.com/verify/templates?api_key=${api_key}&api_secret=${api_secret}`

request.get(url, async function (err, resp, body) {
  log.info(`verify-template-chk , err:${err}`)
  log.info(`verify-template-chk , body: ${body}`)
})
