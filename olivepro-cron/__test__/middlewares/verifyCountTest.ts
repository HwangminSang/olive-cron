import { Response, Request, NextFunction } from 'express'
import { createClient } from 'redis'
import { log } from '../../winston/logger'
import { phoneLengthErr, phoneLimitErr } from '../../api/err-codes/changePhoneCode'

interface UserPhone {
  countryCode: string
  phoneNumber: string
}

const client = createClient()
const phoneLengthCheck = (userPhone: UserPhone): boolean => {
  if (userPhone.countryCode.length < 1) {
    log.err(`verify sms countryCode false`)
    return false
  } else if (userPhone.phoneNumber.length < 1) {
    log.err(`verify sms phoneNumber false`)
    return false
  } else {
    return true
  }
}
// Request body의 국가코드, 폰넘버를 redis 키에 저장하고 잘못된 요청이 5회가 되면 30분 동안의 요청에 대해서 실패를 반환합니다.

const req: object = {
  body: {
    countryCode: '82',
    phoneNumber: '0125925320',
  },
}

// EX 초: 지정된 만료시간 (초)를 설정합니다.
// countryCode + phoneNumber 넘버 키에 리미트 카운터를 스트링으로 저장
// 성공시에는 키를 지우거나 0으로 실패시 카운트 + 1
// import { createClient } from 'redis';
const redisWrite = async (redisKey: string) => {
  await client.connect()
  console.log('redisKey', redisKey)
  const valStr: string = (await client.get(redisKey)) || '0'
  console.log('valStr', valStr)
  const newNum = parseInt(valStr) + 1
  console.log('newNum', newNum)
  const newVal = newNum.toString()
  console.log('newVal', newVal)
  client.set(redisKey, newVal, {
    EX: 1800,
  })
  await client.quit()
}

const nextTest = async (redisKey: string) => {
  redisWrite(redisKey)
}

const verifyCountTest = async (req: any, res?: any) => {
  const userPhone: UserPhone = {
    countryCode: req.body.countryCode,
    phoneNumber: req.body.phoneNumber,
  }
  log.info(`verify sms requested countryCode: ${userPhone.countryCode}, phoneNumber: ${userPhone.phoneNumber}`)
  if (!phoneLengthCheck) {
    res.send(phoneLengthErr)
  }
  await client.connect()
  const redisKey = userPhone.countryCode + userPhone.phoneNumber
  const redisValue = await client.get(redisKey)
  await client.quit()
  console.log('redisValue', redisValue)
  if (redisValue === null || parseInt(redisValue) < 5) {
    nextTest(redisKey)
    console.log('next')
    return
  } else {
    console.log(phoneLimitErr)
    return
  }
}

verifyCountTest(req)
