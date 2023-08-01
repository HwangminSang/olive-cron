const User = require('../models/user.js.bk')
const mysql = require('mysql2/promise')
const { dbPoolProp } = require('../../db/config')

const { sns } = require('../../libs/aws')
const { log } = require('../../winston/logger')
const dbPool = mysql.createPool(dbPoolProp)

const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/*
    send_sms function receives the phoneNumbers and
    the message and returns a promise
    TODO: INTEGRATE WITH A REAL SMS PROVIDER
 */
let send_sms = (phoneNumber, message) => {
  var otp = Math.floor(1000 + Math.random() * 9000)

  // let params = {
  //   Message: message,
  //   PhoneNumber: phoneNumber,
  // };

  var params = {
    Message: 'Welcome! your mobile verification code is: ' + otp + ' Mobile Number is : ' + phoneNumber,
    MessageStructure: 'string',
    PhoneNumber: '+' + phoneNumber,
  }

  var publishTextPromise = sns.publish(params).promise()

  publishTextPromise
    .then(function (message) {
      log.info(message)
    })
    .catch(function (error) {
      log.err('Error sending sms:', error.stack)
    })

  return publishTextPromise
}

/*
    send_sms_to_all function sends sms to all users,
    it extracts the message from the request body,
    gets the phone numbers for all users,
    divide the phone numbers in loads that sms provider
    can handle in one minute, iterate over the loads and
    send sms to each load, wait a minute and send again.
 */
exports.send_sms_to_all = async function send_sms_to_all(req, res, next) {
  const { message, phoneNumber } = req.body
  if (message === undefined || message === '') {
    res.status(400).json({ error: 'message is required' })
  } else {
    const connection = await dbPool.getConnection()
    try {
      // Select all rows from OliveUser table
      const query = "SELECT phone_number as phoneNumber FROM olive_user where phone_number is not null and phone_number != '' and phone_number != 'nil'"
      let [rows, fields] = await connection.query(query)

      let phoneNumbers = rows.map(row => {
        return row.phoneNumber
      })

      log.info(`SMS PhoneNumber ==>  ${phoneNumbers}`)

      if (phoneNumbers.length > 0) {
        let returnJson = []
        let statusCode = 200
        let maximumCapacity = 1
        let noOfLoads = phoneNumbers.length / maximumCapacity
        if (phoneNumbers.length % maximumCapacity !== 0) {
          noOfLoads++
        }
        noOfLoads = Math.floor(noOfLoads)

        for (let i = 0; i < noOfLoads; i++) {
          let start = i * maximumCapacity,
            end = (i + 1) * maximumCapacity
          let batchPhoneNumbers = phoneNumbers.slice(start, end)
          send_sms(batchPhoneNumbers[0], message)
            .then(jsonObj => {
              log.info(`AWS SMS Send Success ==>  ${jsonObj}`)
              returnJson.push({ loadNumber: i + 1, success: jsonObj })
              if (i + 1 === noOfLoads) {
                res.status(statusCode).json(returnJson)
              }
            })
            .catch(error => {
              log.err(`AWS SMS Send Fail ==> ${error}`)
              returnJson.push({ loadNumber: i + 1, error: error })
              statusCode = 500

              if (i + 1 === noOfLoads) {
                res.status(statusCode).json(returnJson)
              }
            })

          sleep(500)
        }
      } else {
        res.status(200).json({ message: 'no phone numbers to send' })
      }
    } catch (error) {
      log.err(error)
      res.status(500).json({
        error: err,
      })
    } finally {
      connection.release()
    }
  }
}

/*
    send_sms_to_specific function sends sms to a specific
    user or users, it extracts the message and ids from
    the request body, get the phone numbers associated
    with those ids then send sms to them
 */
exports.send_sms_to_specific = (req, res, next) => {
  const { message, phoneNumber } = req.body

  if (message === undefined || message === '' || phoneNumber === undefined) {
    res.status(400).json({ error: 'message and phoneNumber are required' })
  } else {
    User.find({ userId: Ids })
      .select('phoneNumber -_id')
      .then(users => {
        if (phoneNumber.length > 0) {
          send_sms(phoneNumber, message)
            .then(jsonObj => {
              res.status(200).json(jsonObj)
            })
            .catch(error => {
              res.status(500).json(error)
            })
        } else {
          res.status(200).json({ message: 'No valid user phoneNumber' })
        }
      })
      .catch(err => {
        log.err(err)
        res.status(500).json({
          error: err,
        })
      })
  }
}

exports.send_sms_to_user = (req, res, next) => {
  const { message, phoneNumber } = req.body

  if (message === undefined || message === '' || phoneNumber === undefined) {
    res.status(400).json({ error: 'message and phoneNumber are required' })
  } else {
    if (phoneNumber.length > 0) {
      send_sms(phoneNumber, message)
        .then(jsonObj => {
          res.status(200).json(jsonObj)
        })
        .catch(error => {
          res.status(500).json(error)
        })
    } else {
      res.status(200).json({ message: 'No valid user phoneNumber' })
    }
  }
}
