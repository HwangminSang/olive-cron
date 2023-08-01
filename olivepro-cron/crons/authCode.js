'use strict'

const cron = require('cron')
const moment = require('moment')
const { log } = require('../winston/logger')
const { dbPoolProp } = require('../db/config')

const mysql = require('mysql2/promise')

const dbPool = mysql.createPool(dbPoolProp)
// const dbPool = mysql.createPool({
//   host: "test-olivernd-mysql.coluvj80rday.ap-northeast-2.rds.amazonaws.com",
//   user: 'admin',
//   password: 'testOliveRds0704*',
//   database: 'olivepro_dev_social3',
//   port: 3306,
//   connectionLimit: 4,
// })

const cronTime = '00 */01 * * * *'

log.info(`Register Auth Code update Cron: ${process.env.NODE_ENV}_${new Date().toISOString()}_${process.pid}`)

const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function proc() {
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[Test]'

  const today = new Date()
  let startDate = new Date()
  let endDate = new Date()
  let afterMinute5 = new Date()
  let afterHour1 = new Date()

  startDate.setSeconds(startDate.getSeconds() - 30)
  startDate = startDate.toISOString()
  endDate.setSeconds(endDate.getSeconds() + 30)
  endDate = endDate.toISOString()
  afterMinute5.setMinutes(today.getMinutes() + 5)
  afterMinute5 = afterMinute5.toISOString()
  afterHour1.setHours(today.getHours() + 1)
  afterHour1 = afterHour1.toISOString()

  log.info(`Begin Auth code update.everyMinute (${prefix}) : ${startDate}, '< today(', ${today}, ')<', ${endDate} in authCode-proc`)

  const connection = await dbPool.getConnection()
  try {
    // TODO: SMS일 경우 5분 경과되면 업데이트
    const querySMS = `SELECT * FROM olive_user where sms_code is not NULL and sms_code <> ''
    and sms_expire_at <> '' and sms_expire_at is not NULL and sms_expire_at <= '${today.toISOString()}'`

    let [rows, fields] = await connection.query(querySMS)
    let idList = rows.map(row => {
      return row.id
    })

    if (idList.length > 0) {
      log.info(`sms update id list ==>  ${idList} in authCode-proc`)
      let [results] = await connection.query('UPDATE olive_user SET sms_code=?, sms_expire_at=NULL WHERE id in (?)', ['', idList])
      log.info(`update sms_code ==> ${results} in authCode-proc`)
    } else log.info(`Auth Code SMS data is not found! , ${new Date().toISOString()} in authCode-proc`)

    // TODO: 이메일 경우 3~6시간 경과되면 업데이트
    const queryEmail = `SELECT * FROM olive_user where email_code is not NULL and email_code <> '' and email_expire_at <> '' and email_expire_at is not NULL and email_expire_at <= '${today.toISOString()}'`

    ;[rows, fields] = await connection.query(queryEmail)
    idList = rows.map(row => {
      return row.id
    })

    if (idList.length > 0) {
      log.info(`email update id list ==>  ${idList} in authCode-proc`)
      ;[results] = await connection.query('UPDATE olive_user SET email_code=?, email_expire_at=NULL WHERE id in (?)', ['', idList])
      log.info(`update email_code ==> ${results} in authCode-proc`)
    } else log.info(`Auth Code Email data is not found! ,  ${new Date().toISOString()} in authCode-proc`)
  } catch (error) {
    log.err(`Auth Code update Error: ${error} in authCode-proc`)
  } finally {
    connection.release()
  }

  log.info(`\nFinish Auth Code update.everyMinute: ${new Date().toISOString()} in authCode-proc`)
}

exports.everyMinute = new cron.CronJob({
  cronTime,
  start: false,
  onTick: () => {
    proc()
      .then(() => {})
      .catch(err => {
        log.err(`Auth Code update ERROR:${err} in authCode`)
      })
  },
})

if (process.env.NODE_ENV === 'test') {
  proc()
    .then(() => {})
    .catch(err => {
      log.err(`Auth Code update ERROR:${err} in authCode`)
    })
}
