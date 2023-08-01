'use strict'

import { NextFunction, Request, Response } from 'express'

import { executeRedisCacheCheck, executeRedisGet, executeRedisKeyDelete, executeRedisSetNoExpire } from '../../redis/redisUtil'
import { redisCli } from '../../utils/redis'
import { log } from '../../winston/logger'
import { CSDBError, success } from '../err-codes/krCsErrorCode'
import { apiResponse } from '../../utils/apiResponse'
export const createConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log.info('createConfig in csConfig')
    const { redisKey, redisValue } = req.body
    executeRedisSetNoExpire(redisCli, redisKey, redisValue)
    const data = { redisKey }
    success.msg = 'Config has been created'
    res.status(201).send(apiResponse(success, data))
  } catch (error) {
    log.err(`Error : ${error} =========> getConfig in csConfig`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
  const { key: redisKey } = req.params

  try {
    log.info('getConfig in csConfig')
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const result = await executeRedisGet(redisCli, redisKey)
      const data = {
        redisKey,
        redisValue: JSON.parse(result),
      }
      success.msg = `csConfig has been found`
      res.status(200).send(apiResponse(success, data))
    } else {
      log.info(`redisKey : ${redisKey} is not exist in getConfig in csConfig`)
      success.msg = `redisKey : ${redisKey} is not exist in csConfig`
      res.status(404).send(apiResponse(success))
    }
  } catch (error) {
    log.err(`Error : ${error} =========> getConfig in csConfig`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

// 업데이트와 삭제를 동시에 진행할 수 있는 api
export const updateCSConfig = async (req: Request, res: Response, next: NextFunction) => {
  const { redisKey, redisValue } = req.body

  try {
    log.info('updateCSConfig in csConfig')
    executeRedisSetNoExpire(redisCli, redisKey, redisValue)

    success.msg = `ID: ${redisKey} has been Updated in csConfig`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> updateCSConfig in csConfig`)
    res.status(500).send(apiResponse(CSDBError))
  }
}

// 현재 사용하지 않음
export const deleteConfig = async (req: Request, res: Response, next: NextFunction) => {
  const { redisKey } = req.query

  try {
    log.info('deleteConfig in csConfig')
    executeRedisKeyDelete(redisCli, redisKey)
    success.msg = `Key: ${redisKey} has been Deleted in csConfig`
    res.status(200).send(apiResponse(success))
  } catch (error) {
    log.err(`Error : ${error} =========> deleteConfig in csConfig`)
    res.status(500).send(apiResponse(CSDBError))
  }
}
