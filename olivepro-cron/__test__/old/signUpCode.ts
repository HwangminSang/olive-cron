import * as express from 'express'

import { log } from '../../winston/logger'
import crypto from 'crypto'
import { redisCli } from '../../utils/redis'

// import { signUpVerifyCnt } from '../../utils/signUpVerifyCnt'

import { phoneApiErr } from '../../api/err-codes/verifyCount'
import Vonage, { SendSmsOptions } from '@vonage/server-sdk'

interface VonageSmsInfo {
  from: string
  to: string
  text: string
  opts: Partial<SendSmsOptions>
}

if (typeof process.env.SMS_API !== 'string' || typeof process.env.SMS_API_SEC !== 'string') {
  throw `Unable to read vonage SMS_API information from environment variable`
}
const vonage = new Vonage({
  apiKey: process.env.SMS_API,
  apiSecret: process.env.SMS_API_SEC,
})

const redisWrite = async (redisKey: string) => {
  const valStr: string = (await redisCli.get(redisKey)) || '0'
  const newNum = parseInt(valStr) + 1
  const newVal = newNum.toString()
  redisCli.set(redisKey, newVal, {
    EX: 10,
  })
  return newVal
}

exports.issueSignUpCode = async (req: express.Request, res: express.Response) => {
  const phoneNumber: string = req.body.phoneNumber
  const countryCode: string = req.body.countryCode

  const n = crypto.randomInt(0, 1000000)
  crypto.randomInt(0, 1000000, (err, n) => {
    if (err) throw err
    console.log(n)
  })
  const smsCode = n.toString().padStart(6, '0')

  console.log('smsCode', smsCode)

  let smsInfo: VonageSmsInfo = {
    from: 'Olive Union',
    to: countryCode + phoneNumber,
    text: 'Your SMS Code is ' + smsCode,
    opts: {},
  }

  let afterMinute5: any = new Date()
  afterMinute5.setMinutes(afterMinute5.getMinutes() + 5)
  afterMinute5 = afterMinute5.toISOString()

  try {
    const fullPhoneNum = countryCode + phoneNumber
    const PhoneNumKey = 'signUp:' + fullPhoneNum
    const issuedCount = await redisWrite(PhoneNumKey)

    // const signUpCodeCount: any = await signUpVerifyCnt(req, res)

    // if (signUpCodeCount !== null && parseInt(signUpCodeCount) >= 5) {
    // throw 'sign up issue count limit over error'
    // }

    vonage.message.sendSms(smsInfo.from, smsInfo.to, smsInfo.text, smsInfo.opts, async (err: any, responseData: any) => {
      if (err) {
        log.err(`Vonage API Error: ${err}`)
        res.send(phoneApiErr)
      } else {
        if (responseData.messages[0]['status'] === '0') {
          log.info(`sms Message sent successfully. num:${fullPhoneNum}, code:${smsCode}`)
          let successObj = {
            code: 200,
            data: {},
            msg: 'SMS Code has been issued.',
            success: true,
          }
          successObj.data = {
            smsCode: smsCode,
            smsExpireAt: afterMinute5,
            issuedCount: issuedCount,
          }
          res.send(successObj)
        } else {
          log.err(`Message failed with error: ${responseData.messages[0]['error-text']}`)
          phoneApiErr.data = {
            // signUpCodeCount: signUpCodeCount,
          }
          res.send(phoneApiErr)
        }
      }
    })
  } catch (error: any) {
    log.err(error)
  }
}
