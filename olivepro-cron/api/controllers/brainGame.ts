'use strict'

import { BrainGameRedisKey } from '../../redis/redisKey';
import {
    executeRedisCacheCheck, executeRedisGet, executeRedisKeyDelete, executeRedisSetNoExpire
} from '../../redis/redisUtil';
import { redisCli } from '../../utils/redis';
import { log } from '../../winston/logger';
import { redisError, redisKeyDeleteErr, redisKyeNotFount, success } from '../err-codes/redisCode';

export const createAccessTokenRedis = async (req, res) => {
  log.info('createAccessTokenRedis in brainGame')

  try {
    const { email, accessToken } = req.body
    const redisKey = `${BrainGameRedisKey.BRAIN_GAME_ACCESS_TOKEN}_${email}`
    await executeRedisSetNoExpire(redisCli, redisKey, { email, accessToken })
    res.status(200).json(success)
  } catch (error) {
    log.err(`Error : ${error} =========> createAccessTokenRedis in brainGame`)
    res.status(500).send(redisError)
  }
}

export const deleteAccessTokenRedis = async (req, res) => {
  log.info('deleteAccessTokenRedis in brainGame')

  try {
    const { email } = req.query
    const redisKey = `${BrainGameRedisKey.BRAIN_GAME_ACCESS_TOKEN}_${email}`

    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const result = await executeRedisKeyDelete(redisCli, redisKey)
      if (result) {
        success.msg = 'redis-key has been deleted'
        res.status(200).json(success)
        return
      }
      res.status(404).json(redisKeyDeleteErr)
      return
    }

    res.status(404).json(redisKyeNotFount)
  } catch (error) {
    log.err(`Error : ${error} =========> deleteAccessTokenRedis in brainGame`)
    res.status(500).send(redisError)
  }
}

export const getAccessTokenRedis = async (req, res) => {
  log.info('getAccessTokenRedis in brainGame')
  try {
    const { email } = req.query
    const redisKey = `${BrainGameRedisKey.BRAIN_GAME_ACCESS_TOKEN}_${email}`
    const isExists = await executeRedisCacheCheck(redisCli, redisKey)

    if (isExists) {
      const result = await executeRedisGet(redisCli, redisKey)
      const { accessToken } = JSON.parse(result)
      res.status(200).json({ accessToken })
      return
    }
    res.status(404).json(redisKyeNotFount)
  } catch (error) {
    log.err(`Error : ${error} =========> getAccessTokenRedis in brainGame`)
    res.status(500).send(redisError)
  }
}
