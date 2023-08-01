'use strict'

const mysql = require('mysql2/promise')
const { dbPoolProp } = require('../../db/config')
const { log } = require('../../winston/logger')
const crypto = require('crypto')

// DB 연결
const dbPool = mysql.createPool(dbPoolProp)

// vonage api 연동
const Vonage = require('@vonage/server-sdk')
let vonage = new Vonage({
  apiKey: process.env.VERIFY_API,
  apiSecret: process.env.VERIFY_API_SEC,
})

let smsCount = 0

const countMiddleware = async (req, res, next) => {
  smsCount++
  if (smsCount > 5) {
    smsCount = 0
  }
  if (next) next()
}

// smsCode 발급
exports.updateSmsCode = async (req, res) => {
  const { country_code: countryCode, phone_number: phoneNumber } = req.body
  log.info(`updateSmsCode get requested, countryCode:${countryCode} phoneNumber:${phoneNumber}`)

  const connection = await dbPool.getConnection()

  // smsCode 랜덤 값으로 받아오기
  const n = crypto.randomInt(0, 1000000)
  crypto.randomInt(0, 1000000, (err, n) => {
    if (err) throw err
    log.info(n)
  })
  const smsCode = n.toString().padStart(6, '0')

  let smsInfo = {
    from: 'Olive Union',
    to: countryCode + phoneNumber,
    text: 'Your SMS Code is ' + smsCode,
  }

  let today = new Date()
  let afterMinute5 = new Date()
  afterMinute5.setMinutes(afterMinute5.getMinutes() + 5)
  afterMinute5 = afterMinute5.toISOString()

  const updateSmsVerifyQuery = `UPDATE olive_user SET sms_code='${smsCode}', sms_expire_at='${afterMinute5}' where phone_number='${phoneNumber}' and country_code='${countryCode}'`
  const findPhoneNum = `SELECT country_code, phone_number from olive_user where country_code='${countryCode}' and phone_number='${phoneNumber}' order by id desc limit 1`
  const findResult = await connection.query(findPhoneNum)
  const updateSmsCntQuery = `UPDATE olive_user SET sms_count='${smsCount}' WHERE phone_number='${phoneNumber}' and country_code='${countryCode}'`

  if (findResult[0].length === 0) {
    res.send({
      code: 200,
      msg: 'There is no user with that phone number.',
      success: false,
    })
  } else {
    countMiddleware()
    try {
      if (afterMinute5 < today) {
        const deleteExpiredMinQuery = `UPDATE olive_user SET sms_code=NULL WHERE sms_expire_at IS NOT NULL AND sms_expire_at < ${today.toISOString()}`
        await connection.query(deleteExpiredMinQuery)
      }
      if (findResult[0].length === 1) {
        await connection.query(updateSmsVerifyQuery)

        await vonage.message.sendSms(smsInfo.from, smsInfo.to, smsInfo.text, async (err, responseData) => {
          await connection.query(updateSmsCntQuery)

          if (err) {
            log.error('vonage.message.sendSms Error: ', err)
            res.send({
              code: -2000,
              msg: 'vonage.message.sendSms Error',
              data: {
                smsCount,
              },
              success: false,
            })
          } else {
            if (responseData.messages[0]['status'] === '0') {
              log.info('Message sent successfully.')
              res.send({
                code: 200,
                msg: 'SMS Code has been issued.',
                data: {
                  smsCode,
                  smsCount,
                  smsExpireAt: afterMinute5,
                },
                success: true,
              })
            } else {
              log.err(`Message failed with error: ${responseData.messages[0]['error-text']}`)
              res.send({
                code: -2000,
                msg: 'Error occurred while sending message.',
                data: {
                  smsCount,
                },
                success: false,
              })
            }
          }
        })
      }
    } catch (error) {
      log.err(error)
    } finally {
      connection.release()
    }
  }
}
