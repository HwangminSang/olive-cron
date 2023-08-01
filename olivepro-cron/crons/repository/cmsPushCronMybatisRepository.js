const { PushStatus } = require('../../constants/push')
const { dbPoolProp } = require('../../db/config')
const { UpdateCountCmsPush } = require('../../api/mysql/cms.push')
const admin = require('../../firebase')
const { log } = require('../../winston/logger')
const mysql = require('mysql2/promise')
const mybatisMapper = require('mybatis-mapper')
const path = require('path')

/** 동적 쿼리문을 구현하기위해 마이바티스 사용 **/
exports.executeQueryMybatisByFilterCronCmsPush = async (id, payload, filter) => {
  const dbPool = mysql.createPool(dbPoolProp)
  /** 발송 성공 여부 판별 변수 **/
  let isResult = false
  /** filter 에 저장된  osType (os 타입 )  , gender(성별)  , ageRange(연령대별)  , appVersion(앱버젼) , swv( ear-device 의 펌웨어 버전 ) , locale (phone-device 의 지역) **/
  const { osType, gender, ageRange, appVersion, swv, locale } = filter
  const params = {
    osType,
    gender,
    appVersion,
    swv,
    locale,
    first: null,
    last: null,
  }
  const connection = await dbPool.getConnection()
  try {
    const format = { language: 'sql', indent: '  ' }
    let findQuery = ''
    /** ec2인스턴스에서는 경로를 찾기 못하여  path 사용 **/
    mybatisMapper.createMapper([path.resolve(__dirname, 'mapper/filterQuery.xml')])
    /** 조건으로 연령대별이 있는경우   11~20 으로 저장되기때문에 ~ 으로 자른후 동적쿼리문 작성 **/
    if (ageRange !== null) {
      const [first, last] = filter.ageRange.split('~')
      params.first = first
      params.last = last
      findQuery = mybatisMapper.getStatement('cmsPushFilter', 'cmsPushFilterAgeRangeParams', params, format)
    } else {
      /** 조건으로 연령대별이 없는경우 동적쿼리문 작성 **/
      findQuery = mybatisMapper.getStatement('cmsPushFilter', 'cmsPushFilterParams', params, format)
    }
    log.info(`findQuery  ====> ${findQuery} in executeQueryMybatisCronCmsPush`)
    let [rows, fields] = await connection.query(findQuery)
    /** 쿼리 검색후 나온값들을 기준으로 토큰값을 뽑은후 배열로 반환 **/
    let tokens = rows.map(row => {
      return row.fcm_token
    })
    log.info(`Push tokens ==> ${tokens} in executeQueryMybatisCronCmsPush `)
    let bulkTokenSize = 1000
    let options = {
      priority: 'high',
      timeToLive: 60 * 60,
    }
    /** 검색조건에 맞는 사람이 있으면서 fcm 토큰이 있는사람만 **/
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
          log.info(`Cms_push id : ${id} : ===> in executeQueryMybatisCronCmsPush`)
          log.info(`Message send successCount : ===>${successCount} in executeQueryMybatisCronCmsPush`)
          log.info(`Message send failCount : ===>${failCount} in executeQueryMybatisCronCmsPush`)
        } catch (error) {
          log.err(`${JSON.stringify(error)} in executeQueryMybatisCronCmsPush`)
          /** 실패시 false  반환 **/
          return isResult
        }
      }
      /** 발송 완료후 successAllCount (성공카운트 ) , failAllCount (실패카운트) 디비에 업데이트 후 true를 반환 **/
      await UpdateCountCmsPush(id, successAllCount, failAllCount)
      isResult = true
      return isResult
      /** 검색조건에 맞는 사람이 없을경우 해당 enum(검색 조건 없음) 을 반환 **/
    } else {
      log.err(`result : no tokens to send to in executeQueryMybatisCronCmsPush`)
      return PushStatus.NotFoundUser
    }
  } catch (error) {
    log.err(`error :${error} in executeQueryMybatisCronCmsPush`)
  } finally {
    connection.release()
  }
}
/** 토픽으로 보내기 (현재 모든 topic 구독되어 있기떄문에 조건처럼 으로 발송 ( os타입 , 지역 )
 *  토픽으로 보내기를 했을경우  successAllCount , failAllCount 가 집계되지 않아  파이어베이스의 해당 함수 호출 sendToDevice();
 *  1000개씩 loop 문을 순회하며 발송
 * **/
exports.executeQueryMybatisByTopicCronCmsPush = async (id, payload, country, os) => {
  const dbPool = mysql.createPool(dbPoolProp)
  let isResult = false

  const params = {
    osType: os,
    locale: country,
  }
  const connection = await dbPool.getConnection()
  try {
    const format = { language: 'sql', indent: '  ' }
    mybatisMapper.createMapper([path.resolve(__dirname, 'mapper/filterQuery.xml')])

    const findQuery = mybatisMapper.getStatement('cmsPushFilter', 'cmsPushTopicParams', params, format)

    log.info(`findQuery  ====> ${findQuery} in executeQueryMybatisCronCmsPush`)

    let [rows, fields] = await connection.query(findQuery)

    let tokens = rows.map(row => {
      return row.fcm_token
    })

    log.info(`Push tokens ==> ${tokens} in executeQueryMybatisCronCmsPush `)

    let bulkTokenSize = 1000
    let options = {
      priority: 'high',
      timeToLive: 60 * 60,
    }
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
          log.info(`Cms_push id : ${id} : ===> in executeQueryMybatisCronCmsPush`)
          log.info(`Message send successCount : ===>${successCount} in executeQueryMybatisCronCmsPush`)
          log.info(`Message send failCount : ===>${failCount} in executeQueryMybatisCronCmsPush`)
        } catch (error) {
          log.err(`${JSON.stringify(error)} in executeQueryMybatisCronCmsPush`)
          /** 실패시 false  반환 **/
          return isResult
        }
      }

      /** 발송 완료후 successAllCount (성공카운트 ) , failAllCount (실패카운트) 디비에 업데이트 후 true를 반환 **/
      await UpdateCountCmsPush(id, successAllCount, failAllCount)
      isResult = true
      return isResult
    } else {
      /** 검색조건에 맞는 사람이 없을경우 해당 enum (검색조건없음)   반환 **/
      log.err(`result : no tokens to send to in executeQueryMybatisCronCmsPush`)
      return PushStatus.NotFoundUser
    }
  } catch (error) {
    log.err(`error :${error} in executeQueryMybatisCronCmsPush`)
  } finally {
    connection.release()
  }
}
