'use strict'

const { log } = require('../../winston/logger')

// vonage api 연동
const Vonage = require('@vonage/server-sdk')
let vonage = new Vonage({
  apiKey: process.env.VERIFY_API,
  apiSecret: process.env.VERIFY_API_SEC,
})

// sms send
exports.sendSmsMessage = async (req, res) => {
  const { countryCode, phoneNumber, message } = req.body
  log.info(`sendSmsMessage get requested, countryCode:${countryCode} phoneNumber:${phoneNumber}`)
  const sms = {
    from: 'Olive Union',
    to: countryCode + phoneNumber,
    text: message,
  }

  const opts = {
    type: 'unicode',
  }

  try {
    await vonage.message.sendSms(sms.from, sms.to, sms.text, opts, async (err, resp) => {
      if (err) {
        log.err(`vonage.message.sendSms Error: ${err}`)
        res.send({
          code: -2000,
          msg: 'vonage.message.sendSms Error',
          success: false,
        })
      } else {
        if (resp.messages[0]['status'] === '0') {
          log.info('Message sent successfully.')
          res.send({
            code: 200,
            msg: 'SMS message has been sent',
            data: {
              id: resp.messages[0]['message-id'],
              to: resp.messages[0]['to'],
            },
            success: true,
          })
        } else {
          log.err(`Message failed with error: ${resp.messages[0]['error-text']}`)
          res.send({
            code: -2000,
            msg: 'Error occurred while sending message.',
            success: false,
          })
        }
      }
    })
  } catch (error) {
    log.err(error)
  }
}
