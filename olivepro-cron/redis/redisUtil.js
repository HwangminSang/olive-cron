const { RedisKeyExpire } = require('../redis/redisKey')

/**
 * 레디스에 해당 키가 존재하는지 확인
 * @param redisCli
 * @param redisKey
 * @returns {Promise<boolean>}
 */
exports.executeRedisCacheCheck = async (redisCli, redisKey) => {
  try {
    const result = await redisCli.exists(redisKey) // true: 1 , false: 0
    if (result) return true

    return false
  } catch (e) {
    throw e
  }
}
/**
 * 해당 key의 value를 가져온다
 * @param redisCli
 * @param redisKey
 * @returns {Promise<*>}
 */
exports.executeRedisGet = async (redisCli, redisKey) => {
  try {
    const result = await redisCli.get(redisKey)
    return result
  } catch (e) {
    throw e
  }
}

/**
 * 해당 키를 셋팅
 * @param redisCli
 * @param redisKey
 * @param resBody
 * @returns {Promise<void>}
 */
exports.executeRedisSet = async (redisCli, redisKey, resBody) => {
  try {
    await redisCli.set(redisKey, JSON.stringify(resBody), checkRedisKeyExpireTime(redisKey))
  } catch (e) {
    throw e
  }
}

exports.executeRedisSetNoExpire = async (redisCli, redisKey, resBody) => {
  try {
    await redisCli.set(redisKey, JSON.stringify(resBody))
  } catch (e) {
    throw e
  }
}

/**
 * 해당 키의 유효기간을 안내
 * @param redisKey
 * @returns {*}
 */
const checkRedisKeyExpireTime = redisKey => {
  try {

    return RedisKeyExpire[redisKey]
  } catch (e) {
    throw e
  }
}

/**
 * 키값을 기준으로 삭제
 * @param {*} redisCli
 * @param {*} redisKey
 * @returns
 */
exports.executeRedisKeyDelete = async (redisCli, redisKey) => {
  try {
    const result = await redisCli.del(redisKey)
    return result
  } catch (e) {
    throw e
  }
}
