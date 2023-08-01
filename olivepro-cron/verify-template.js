const request = require('request')
// Connection information
const base_url = 'https://api.nexmo.com'
const version = ''
const action = '/verify/templates'
const { log } = require('./winston/logger')
// Authentication information
const api_key = 'apikey'
const api_secret = 'apisecret'

// Create the request URL
const url = `${base_url}${version}${action}?api_key=${api_key}&api_secret=${api_secret}`

// Create the custom template
const KRpayload = {
  action_type: 'sms',
  lg: 'ko-kr',
  contact_email: 'dev@oliveunion.com',
  template: '${brand} 인증번호 ${pin} 를 ${pin_expiry} 분 안에 입력해 주시기 바랍니다.',
  type: 'unicode',
}

const JPpayload = {
  action_type: 'sms',
  lg: 'ko-kr',
  contact_email: 'dev@oliveunion.com',
  template: 'Your ${brand} verification code is ${pin}',
}

const ENpayload = {
  action_type: 'sms',
  lg: 'en-us',
  contact_email: 'dev@oliveunion.com',
  template: 'Your ${brand} verification code is ${pin}',
}

const payload = KRpayload

// Create request option
const options = {
  url: url,
  headers: {
    'content-type': 'application/json',
    accept: 'application/json',
  },
  body: payload,
  json: true,
}

// request to vanage

request.post(options, async function (err, resp, body) {
  log.info(`verify-template , err:${err}`)
  log.info(`verify-template , body: ${body}`)
})
log.info(`verify-template , request url: ${url}`)
