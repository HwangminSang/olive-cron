import { Request, Response } from 'express'

import { phoneLengthErr, phoneLimitErr } from '../api/err-codes/changePhoneCode'
import { log } from '../winston/logger'
import { redisCli } from './redis'
import { phoneLengthCheck } from './verifyUtils'

interface UserPhone {
  countryCode: string
  phoneNumber: string
}

/**
 * Request body의 국가코드, 폰넘버를 키로 redis에서 조회하고 값이 5 이상이면 실패 response를 보냅니다.
 * @param req express.Request
 * @param res express.Response
 * @param verfiyKey string
 * @returns
 */
export const verifyCnt = async (req: Request, res: Response, verfiyKey: string) => {
  const { countryCode, phoneNumber } = req.body
  const userPhone: UserPhone = {
    countryCode,
    phoneNumber,
  }
  log.info(`verify sms requested countryCode: ${userPhone.countryCode}, phoneNumber: ${userPhone.phoneNumber}`)
  if (!phoneLengthCheck(userPhone)) {
    res.send(phoneLengthErr)
  }
  const redisKey = verfiyKey + userPhone.countryCode + userPhone.phoneNumber
  const limitCount = await redisCli.get(redisKey)
  if (limitCount === null || parseInt(limitCount) < 5) {
    return limitCount
  } else {
    // console.log('limitCount', limitCount)
    phoneLimitErr.data = {
      issuedCount: limitCount,
    }
    res.send(phoneLimitErr)
    return limitCount
  }
}


