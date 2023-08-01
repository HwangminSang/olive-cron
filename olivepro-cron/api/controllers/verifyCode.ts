import { NextFunction, Request, Response } from 'express';

import { dbPool } from '../../utils/mysql';
import { verifyCnt } from '../../utils/verifyCnt';
// vonage api 연동
import { redisKeyNumPlus, redisKeyValWrite, vonageVerify } from '../../utils/verifyUtils';
import { log } from '../../winston/logger';
import { noExistPhoneErr, waitNextErr } from '../err-codes/changePhoneCode';
import { phoneApiErr } from '../err-codes/verifyCount';

/*
  verify api
  result.status

  0 = success
  1 = Throttled : You are trying to send more than the maximum of 30 requests per second.
  2 = Your request is incomplete and missing the mandatory parameter $parameter
  3 = Invalid value for parameter $parameter
  4 = Invalid credentials were provided : The supplied API key or secret in the request is either invalid or disabled.
  5 = Internal Error
  6 = The Nexmo platform was unable to process this message for the following reason: $reason
  7 = The number you are trying to verify is blacklisted for verification.
  8 = The api_key you supplied is for an account that has been barred from submitting messages.
  9 = Partner quota exceeded
  10 = Concurrent verifications to the same number are not allowed
  15 = The destination number is not in a supported network
  16 = The code inserted does not match the expected value
  17 = The wrong code was provided too many times
  18 = Too many request_ids provided
  19 = No more events are left to execute for this request
  101 = No request found
*/

export const updateVerifyCode = async (req: Request, res: Response, next: NextFunction) => {
  const { countryCode, phoneNumber } = req.body
  log.info(`updateSmsCode get requested, countryCode:${countryCode} phoneNumber:${phoneNumber}`)

  if (typeof countryCode !== 'string' || typeof phoneNumber !== 'string') {
    res.send({
      code: -2030,
      msg: 'request body error in updateVerifyCode',
      success: false,
    })
    log.err('error: request body error in updateVerifyCode')
    throw 'request body error in updateVerifyCode'
  }

  const connection = await dbPool.getConnection()
  const findByPhoneNumber = `SELECT country_code, phone_number from olive_user where country_code='${countryCode}' and phone_number='${phoneNumber}' order by id desc limit 1`

  const findResult: any = await connection.query(findByPhoneNumber)
  connection.release()

  try {
    const verifyKey = 'issue:'
    const number = countryCode + phoneNumber
    const redisKey = verifyKey + number
    let issuedCount = await verifyCnt(req, res, verifyKey)
    if (issuedCount !== null && issuedCount !== undefined && parseInt(issuedCount) >= 5) {
      log.err(`phone issue limit error, num:${redisKey}`)
      throw `phone issue limit error, num:${redisKey}`
    }
    if (findResult[0].length === 0) {
      log.err(`Vonage Verify API Error: noExistPhoneErr ${number}`)
      res.send(noExistPhoneErr)
      log.err('There is no user with this number')
    } else if (findResult[0].length === 1) {
      /**
       * todo: vonageVerify.verify.request(lg: 'string') 설정 변경 포스트 페이로드로 받거나 기타 설정 필요
       */
      vonageVerify.verify.request(
        {
          number,
          brand: 'Olive Union',
          workflow_id: 4, // sms만 보내는 flow, default: 1로 sms -> tts -> tts 순서
          // next_event_wait: 60, // min: 60, max: 900, default: 300
          pin_expiry: 300, // min: 60, max: 3600, default: 300
          code_length: 6,
        },
        async (err: any, result: any) => {
          if (err) {
            log.err(`Vonage Verify API Error: ${err}`)
            phoneApiErr.data = {
              issuedCount: issuedCount || 0,
            }
            res.send(phoneApiErr)
          } else if (result.status === '10') {
            log.info(`result : ${result} in updateVerifyCode`)
            log.err('error: Concurrent verifications to the same number are not allowed  in updateVerifyCode')
            waitNextErr.data = {
              issuedCount: issuedCount || 0,
            }
            res.send(waitNextErr)
          } else if (result.status === '0') {
            let sms_expire_time = new Date()
            sms_expire_time.setSeconds(sms_expire_time.getSeconds() + 300)
            const sms_expire_at = sms_expire_time.toISOString()

            log.info(`result : ${result} => ${sms_expire_at}`)

            const requestId = result.request_id
            const updateRequestIdQuery = `UPDATE olive_user SET sms_code='${requestId}', sms_expire_at='${sms_expire_at}' WHERE phone_number='${phoneNumber}' and country_code='${countryCode}'`

            const connection = await dbPool.getConnection()
            await connection.query(updateRequestIdQuery)
            connection.release()

            let _
            ;[_, issuedCount] = await Promise.all([
              // 리퀘스트시 폰넘버 확인을 위해 키 밸류로
              redisKeyValWrite(requestId, redisKey, 300),
              redisKeyNumPlus(redisKey, 1800),
            ])
            res.send({
              code: 200,
              data: {
                requestId,
                issuedCount: issuedCount || 0,
              },
              msg: 'VerifyCode has been issued.',
              success: true,
            })
          } else {
            log.err(err)
            res.send(phoneApiErr)
          }
        }
      )
    }
  } catch (err: any) {
    log.err(err)
    res.send(phoneApiErr)
  }
}
