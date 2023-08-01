const { validationParamCheck } = require('../util/vaolidationParamCheck')
const { MakeQueryKey, PushStatus } = require('../../constants/push')
const { dbPoolProp } = require('../../db/config')
const { UpdateCountCmsPush } = require('../../api/mysql/cms.push')
const admin = require('../../firebase')
const { log } = require('../../winston/logger')
const mysql = require('mysql2/promise')

const dbPool = mysql.createPool(dbPoolProp)

/**
 * 쿼리작성 함수
 *  폰디바이스 와 올리브유저 테이블을 조인하는 이유는 use_push (푸시 발송 동의여부) 확인 및 fcm_token (토큰 여부) 를 확인하기 위해서 inner join 사용
 */
const makeQueryString = (key, value = '') => {
  let findTokenQuery = "SELECT fcm_token FROM phone_device JOIN olive_user ou ON olive_user_id = ou.id  WHERE fcm_token IS NOT NULL AND fcm_token != '' AND ou.use_push = 1 "
  let findTokenJoinQuery = "SELECT fcm_token FROM phone_device JOIN olive_user ou ON olive_user_id = ou.olive_user.id WHERE fcm_token IS NOT NULL AND fcm_token !='' AND ou.use_push = 1  "
  let query = ''
  // key 와 value를 한번더 확인
  if (validationParamCheck(key, value, true)) {
    return false
  }
  switch (key) {
    /** 모두에게 발송 key = all **/
    case MakeQueryKey.all:
      query = findTokenQuery
      break
    /** 이메일로 한명의 사용자에게 발송 key = email **/
    case MakeQueryKey.email:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.email='${value}'`)
      break
    /** 올리브유저 테이블의 id를 뽑아 발송 key = id_list**/
    case MakeQueryKey.id_list:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.id in (${value})`)
      break
    default:
      break
  }
  return query
}

/**
 * JDBC 방식으로 푸시 발송을 동의한 사람 ( use_push = 1 ) 및 fcmToken 이 있는 사람을 찾아 발송
 * 1000개씩  loop를 돌며 발송
 * successAllCount , failAllCount 성공 실패 카운트 할당
 */
exports.excuteQueryCronCmsPush = async (id, payload, { key, value }) => {
  // 발송 성공여부
  let isResult = false
  const findQuery = makeQueryString(key, value)
  /** key 와 value 가 없을경우 해당 key의 값 입력 필요 에러를 보내준다. **/
  if (!findQuery) {
    log.err(`Please check ${key} and ${value}`)
  }
  const connection = await dbPool.getConnection()
  try {
    let [rows, fields] = await connection.query(findQuery)
    let tokens = rows.map(row => {
      return row.fcm_token
    })
    log.info(`Push tokens ==> ${tokens} in executeQueryCronCmsPush `)
    let bulkTokenSize = 1000
    let options = {
      priority: 'high',
      timeToLive: 60 * 60,
    }
    /** 해당 조건에 맞는 유저들중 fcm token 있는경우 **/
    if (tokens.length > 0) {
      let noOfLoads = tokens.length / bulkTokenSize
      if (tokens.length % bulkTokenSize !== 0) {
        noOfLoads++
      }
      noOfLoads = Math.floor(noOfLoads)
      let successAllCount = 0
      let failAllCount = 0
      for (let i = 0; i < noOfLoads; i++) {
        let start = i * bulkTokenSize,
          end = (i + 1) * bulkTokenSize
        let batchTokens = tokens.slice(start, end)
        try {
          const result = await admin.messaging().sendToDevice(batchTokens, payload, options)
          const { successCount, failureCount: failCount } = result
          successAllCount += successCount
          failAllCount += failCount
          log.info(`Cms_push id : ${id} : ===> in send_notification`)
          log.info(`Message send successCount : ===>${successCount} in send_notification`)
          log.info(`Message send failCount : ===>${failCount} in send_notification`)
        } catch (error) {
          log.err(`${JSON.stringify(error)} in send_notification`)
          return isResult
        }
      }
      /** 모든비즈니스 로직이  끝나면 true 반환 후 성공카운트 , 실패카운트 업데이트후 true 반환 **/
      await UpdateCountCmsPush(id, successAllCount, failAllCount)
      isResult = true
      return isResult

      /** 해당 조건에 맞는 유저가 없는경우 enum을 반환 **/
    } else {
      log.err(`${key} and ${value} result : no tokens to send to in executeQueryCronCmsPush`)
      return PushStatus.NotFoundUser
    }
  } catch (error) {
    log.err(`error :${error} in executeQueryCronCmsPush`)
  } finally {
    connection.release()
  }
}
