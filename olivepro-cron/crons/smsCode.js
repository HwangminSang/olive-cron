'use strict'

const cron = require('cron')
const { dbPoolProp } = require('../db/config')
const { log } = require('../winston/logger')
const mysql = require('mysql2/promise')

const moment = require('moment')

const dbPool = mysql.createPool(dbPoolProp)

const cronTime = '00 */01 * * * *'

log.info(`Register Auth(sms, email) Code update Cron: ${process.env.NODE_ENV}_${new Date().toISOString()}_${process.pid}  in smsCode`)

const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function proc() {
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[Test]'

  let todayString = new Date().toISOString()
  const dateFormat = 'YYYY-MM-DD HH:mm:ss'
  const today = moment(todayString).format(dateFormat)
  let startDate = new Date()
  let endDate = new Date()

  startDate.setSeconds(startDate.getSeconds() - 30)
  startDate = startDate.toISOString()
  endDate.setSeconds(endDate.getSeconds() + 30)
  endDate = endDate.toISOString()

  log.info(`Begin Auth(sms,email) code update.everyMinute (${prefix}) : ${startDate}, '< today(', ${todayString}, ')<', ${endDate} in smsCode`)

  const connection = await dbPool.getConnection()
  try {
    const querySMS = `SELECT * FROM olive_user where sms_code is not NULL and sms_code <> '' and sms_expire_at <> '' and sms_expire_at is not NULL and sms_expire_at < '${today}'`

    let [rows, fields] = await connection.query(querySMS)
    let idList = rows.map(row => {
      return row.id
    })

    if (idList.length > 0) {
      log.info(`sms update id list ==> ${idList} in smsCode-proc`)
      let [results] = await connection.query('UPDATE olive_user SET sms_code=?, sms_expire_at=NULL WHERE id in (?)', ['', idList])
      log.info(`update sms_code ==> ${results} in smsCode-proc`)
    } else log.info(`smsCode : SMS data is not found!, ${new Date().toISOString()} in smsCode-proc `)

    const queryEmail = `SELECT * FROM olive_user where email_code is not NULL and email_code <> '' and email_expire_at <> '' and email_expire_at is not NULL and email_expire_at < '${today}'`

    ;[rows, fields] = await connection.query(queryEmail)
    idList = rows.map(row => {
      return row.id
    })

    if (idList.length > 0) {
      log.info(`email update id list ==>${idList} in smsCode-proc`)
      ;[results] = await connection.query('UPDATE olive_user SET email_code=?, email_expire_at=NULL WHERE id in (?)', ['', idList])
      log.info(`update email_code ==> ${results} in smsCode-proc`)
    } else log.info(`smsCode : Email data is not found!, ${new Date().toISOString()} in smsCode-proc`)
  } catch (error) {
    log.err(`smsCode update Error:${error} in smsCode-proc`)
  } finally {
    connection.release()
  }

  log.info(`\nFinish Auth(sms, email) Code update.everyMinute: ${new Date().toISOString()} in smsCode-proc`)
}

exports.everyMinute = new cron.CronJob({
  cronTime,
  start: false,
  onTick: () => {
    proc()
      .then(() => {})
      .catch(err => {
        log.info(`Auth(sms, email) Code update ERROR: ${err} in in smsCode`)
      })
  },
})

if (process.env.NODE_ENV === 'test') {
  proc()
    .then(() => {})
    .catch(err => {
      log.info(`test Auth(sms, email) Code update ERROR: ${err} in in smsCode`)
    })
}
