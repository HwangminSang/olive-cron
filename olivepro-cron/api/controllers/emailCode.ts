'use strict'

import crypto from 'crypto'
import { Request, Response } from 'express'
// sendinblue api 연동
import SibApiV3Sdk from 'sib-api-v3-sdk'

import { dbPoolProp } from '../../db/config'
import { redisCli } from '../../utils/redis'
import { redisKeyNumPlus, redisKeyValWrite } from '../../utils/verifyUtils'
import { log } from '../../winston/logger'
import { emailApiErr, emailLimitErr, noUserErr } from '../err-codes/emailCode'

const mysql = require('mysql2/promise')
// DB 연결
const dbPool = mysql.createPool(dbPoolProp)

const defaultClient = SibApiV3Sdk.ApiClient.instance
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.EMAIL_API

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail() // SendSmtpEmail | Values to send a transactional email

export const emailCnt = async (req: Request, res: Response, verifyKey: string) => {
  const redisEmailKey = verifyKey
  const limitCount = await redisCli.get(redisEmailKey)
  if (limitCount === null || parseInt(limitCount) < 5) {
    return limitCount
  } else {
    emailLimitErr.data = {
      issuedCount: limitCount,
    }
    log.err('Too many requests have come from that number. Please allow time and try again.')
    res.send(emailLimitErr)
    return limitCount
  }
}

function dateToUTC(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}

exports.updateEmailCode = async (req: Request, res: Response) => {
  const { email } = req.body
  log.info(`updateEmailCode get requested, email:${email}`)

  // emailcode 랜덤값으로 받아오기
  const n = crypto.randomInt(0, 1000000)
  crypto.randomInt(0, 1000000, (err: any, n: any) => {
    if (err) throw err
    log.info(n)
  })
  const emailCode = n.toString().padStart(6, '0')

  let today = new Date()
  let emailExpireAt: Date | string = new Date()
  emailExpireAt.setHours(emailExpireAt.getHours() + 1)

  const emailKey = 'emailKey:'
  const redisEmailKey = emailKey + email
  log.info(`redisEmailKey: ${redisEmailKey} ${today} ${emailExpireAt}`)
  let emailCount = await emailCnt(req, res, redisEmailKey)
  if (emailCount !== null && emailCount !== undefined && parseInt(emailCount) >= 5) {
    log.err(`phone issue limit error, num:${redisEmailKey} ${emailCount}`)
    throw `phone issue limit error, num:${redisEmailKey} ${emailCount}`
  }
  log.info(`emailCount!!! ${email} ${emailCount}`)

  let _
  ;[_, emailCount] = await Promise.all([redisKeyValWrite(email, redisEmailKey, 300), redisKeyNumPlus(redisEmailKey, 1800)])

  const emailTemplate = process.env.NODE_ENV === 'production' ? 3 : 2

  // template에 email_code로 정의 되어 있음. #2 (Dev), #3 (Prod)
  sendSmtpEmail = {
    to: [
      {
        email,
      },
    ],
    templateId: emailTemplate,
    params: {
      email,
      email_code: emailCode,
      emailExpireAt,
      emailCount,
    },
    headers: {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
    },
  }

  const connection = await dbPool.getConnection()
  try {
    const updateEmailVerifyQuery = `UPDATE olive_user SET email_code=${emailCode}, email_expire_at='${emailExpireAt.toISOString()}' where email='${email}'`
    const findEmail = `SELECT email from olive_user where email='${email}' order by id desc limit 1`
    const findResult = await connection.query(findEmail)
    const updateEmailCntQuery = `UPDATE olive_user SET email_count='${emailCount}' WHERE email='${email}'`

    if (findResult[0].length === 0) {
      log.err('There is no user with this email.')
      res.send(noUserErr)
    } else {
      await connection.query(updateEmailCntQuery)
      try {
        if (emailExpireAt < today) {
          const deleteExpiredHourQuery = `UPDATE olive_user SET email_code=NULL WHERE email_expire_at IS NOT NULL email_expire_at < ${today.toISOString()}`
          await connection.query(deleteExpiredHourQuery)
        }

        if (findResult[0].length === 1) {
          await connection.query(updateEmailVerifyQuery)
          const sendEmailResult = await apiInstance.sendTransacEmail(sendSmtpEmail)
          await connection.query(updateEmailCntQuery)

          if (sendEmailResult) {
            res.status(200).send({
              code: 200,
              msg: 'Email Code has been issued.',
              data: {
                emailCount: emailCount || 0,
              },
              success: true,
            })
          } else {
            log.err(`Email Sendinblue api Error:`)
            emailApiErr.data = {
              emailCount: emailCount || 0,
            }
            res.send(emailApiErr)
          }
        }
      } catch (error) {
        log.err(`error message ${error}`)
      }
    }
  } catch (error) {
    log.err(`error message ${error}`)
  } finally {
    connection.release()
  }
}
