import CryptoJS from 'crypto-js'
import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

import dbPoolProp from '../db/config'
import { log } from '../winston/logger'
import * as resp from './authCheckerRes'
import { isPushAuth } from './isPushAuth'
/**
 * mysql DB pool
 */
const dbPool = mysql.createPool(dbPoolProp)

/**
 * In the olive_user table, check if there is a row with the same string as email in the column email.
 * @param email string
 * @param connection mysql dbPool connection
 * @returns boolean
 */
const userCheck = async (email: string, connection: any): Promise<boolean> => {
  const findQuery = `SELECT email from employee where email='${email}'`
  const [result, _str] = await connection.query(findQuery)
  const bool = result.length ? true : false
  return bool
}

interface JWTDocoded {
  sub?: string
  email: string
  role: string
  userId?: string
  oliveUserId?: string
  iat?: number
  exp?: number
}

/**
 * Objects in the decoded JWT token are encrypted. Decrypt encrypted objects.
 * @param encoded jwt.JwtPayload
 * @param key CryptoJS.lib.WordArray
 * @param IV CryptoJS.lib.WordArray
 * @returns
 */
const jwtInternalDecrypt = (encoded: jwt.JwtPayload, key: CryptoJS.lib.WordArray, IV: CryptoJS.lib.WordArray) => {
  try {
    const email = CryptoJS.AES.decrypt(encoded.email, key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: 256,
    })
    const role = CryptoJS.AES.decrypt(encoded.role, key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: 256,
    })
    const jwtDocoded: JWTDocoded = {
      email: email.toString(CryptoJS.enc.Utf8),
      role: role.toString(CryptoJS.enc.Utf8),
    }
    return jwtDocoded
  } catch (e) {
    log.err(`error in jwtInternalDecrypt: ${e}`)
  }
}

const roleCheck = (pathName: string, role: string): boolean => {

  let isNext: boolean = false

  switch (pathName) {
    case 'push':
      isNext = isPushAuth(role)
      break
    case 'notifications':
      isNext = isPushAuth(role)
      break
    default:
      break
  }

  return isNext
}

/**
 * Decodes and validates the JWT token contained in the authorization value of the request header.
 * @param req express.Request
 * @param res express.Response
 * @param next express.NextFunction
 * @returns void | boolean
 */
export const authChecker = async (req: Request, res: Response, next: NextFunction): Promise<void | boolean> => {
  const bearerToken = req.headers.authorization
  if (!(bearerToken && bearerToken.startsWith('Bearer '))) {
    res.status(401).send(resp.tokenTypeErr)
    log.err(`authorization token ${bearerToken}`)
    return
  }
  const token = bearerToken.substring(7)

  const jswDecoded: string | jwt.JwtPayload | null = jwt.decode(token)
  if (typeof jswDecoded === 'string' || jswDecoded === null || jswDecoded.exp === undefined) {
    res.status(401).send(resp.jswDecodedTypeErr)
    log.err(`Token Decoded does not exist or the type is not string`)
    return
  }
  const dateNow = Date.now()
  // 10e2 밀리세컨드 곱한다.
  const expireCheck: number = jswDecoded.exp * 10e2 - dateNow
  if (expireCheck < 0) {
    res.status(401).send(resp.expiredErr)
    log.err(`expired Token Error!`)
    return
  }
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).send(resp.secKetErr)
    log.err('Could not find jwt internal decode password in environment variable.')
    return
  }

  const key = CryptoJS.enc.Utf8.parse(secret)
  const IV = CryptoJS.enc.Utf8.parse(secret.substring(0, 16))
  const userInfo = jwtInternalDecrypt(jswDecoded, key, IV)
  if (userInfo === undefined) {
    res.status(500).send(resp.decodeErr)
    return
  }
  const connection: any = await dbPool.getConnection()
  try {
    if (!connection) {
      res.status(500).send(resp.dbConnErr)
      log.err('An error occurred while creating the db connection.')
    }
    const bool = await userCheck(userInfo.email, connection)
    if (!bool) {
      res.status(401).send(resp.dbFindErr)
      return
    }

    const pathName = req.baseUrl.split('/')[3]

    if (!roleCheck(pathName, userInfo.role)) {
      res.status(403).send(resp.accessDeniedErr)
      log.err(`A resource that can not be accessed with the privileges it has`)
      return
    }
    // 다음으로 이동
    next()
  } catch (error) {
    log.err(`error message ${error}`)
  } finally {
    if (connection) {
      // 컨넥션 풀에 컨넥션을 돌려준다
      connection.release()
    }
  }
}
