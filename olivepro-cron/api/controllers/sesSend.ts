import { NextFunction, Request, Response } from 'express'
import { error } from 'winston'

import config from '../config'
import { CSDBError, success } from '../err-codes/krCsErrorCode'
import { apiResponse } from '../../utils/apiResponse'

let nodemailer = require('nodemailer')
let AWS = require('aws-sdk')
const { log } = require('../../winston/logger')

// create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: '2010-12-01',
    accessKeyId: config.aws_access_key_id,
    secretAccessKey: config.aws_secret_access_key,
    region: config.aws_region,
  }),
})

//Attempt to write logs with no transports, which can increase memory usage: {"message":"Missing domain","code":"InvalidParameterValue","time":"2022-12-26T06:11:48.486Z","requestId":"8d5e2b9e-b944-40fb-9948-d52afdf88647","statusCode":400,"retryable":false,"retryDelay":63.90759848261964,"level":"error"}
// 한번에 최대 50개씩
export const sesSendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('sesSendEmail in SES')
    const { from, to, subject, text } = req.body

    // send some mail
    transporter.sendMail(
      {
        from, // 보낸 사람 이메일주소  ( ses 서비스에서 승인된 이메일만 가능 )
        to, // 받는 사람
        subject, // 이메일 제목
        text, // 내용
      },
      (err: any, info: { envelope: any; messageId: any }) => {
        if (err) {
          error(err)
          log.err(`Error : ${err} =========> sesSendEmail in SES`)
          res.status(500).send(apiResponse(CSDBError))
          return
        }

        console.log('sendEmail: ' + JSON.stringify(info.envelope))
        console.log(info.messageId)
        const data = { id: info.messageId }
        res.status(201).send(apiResponse(success, data))
      }
    )
  } catch (error) {
    log.err(`Error : ${error} =========> sesSendEmail in SES`)
    res.status(500).send(apiResponse(CSDBError))
  }
}
