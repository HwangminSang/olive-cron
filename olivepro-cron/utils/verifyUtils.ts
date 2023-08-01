import Vonage from '@vonage/server-sdk';

import { log } from '../winston/logger';
import { redisCli } from './redis';

export interface UserPhone {
  countryCode: string
  phoneNumber: string
}

if (typeof process.env.VERIFY_API !== 'string' || typeof process.env.VERIFY_API_SEC !== 'string') {
  throw `Unable to read vonage VERIFY_API information from environment variable`
}

export const vonageVerify = new Vonage({
  apiKey: process.env.VERIFY_API,
  apiSecret: process.env.VERIFY_API_SEC,
})

/**
 * 국가코드나 폰넘버의 길이가 1 이하면 false를 리턴합니다.
 * @param userPhone
 * @returns boolean
 */
export const phoneLengthCheck = (userPhone: UserPhone): boolean => {
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

/**
 * // Number가 스트링으로 저장된 값을 가지고 있는 키와 해당키의 만료시간(초)를 인자로 받고 값을 +1 합니다.
 * @param redisKey string
 * @param exfireAt number
 * @returns string
 */
export const redisKeyNumPlus = async (redisKey: string, exfireAt: number) => {
  const valStr: string = (await redisCli.get(redisKey)) || '0'
  const newNum = parseInt(valStr) + 1
  const newVal = newNum.toString()
  redisCli.set(redisKey, newVal, {
    EX: exfireAt,
  })
  return newVal
}

/**
 * key, value expiretime(sec) 를 받아서 redis 서버에 저장합니다.
 * @param redisKey string
 * @param redisVale string
 * @param exfireAt number
 */
export const redisKeyValWrite = async (redisKey: string, redisVale: string, exfireAt: number) => {
  redisCli.set(redisKey, redisVale, {
    EX: exfireAt,
  })
}

/**
 * key, value expiretime(sec) 를 받아서 redis 서버에 저장합니다.
 * @param redisKey string
 */
export const redisKeyValDelete = async (redisKey: string) => {
  redisCli.del(redisKey)
}
