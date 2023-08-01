const { dbPoolProp } = require('../../db/config')
const mysql = require('mysql2/promise')
const admin = require('../../firebase')
const { log } = require('../../winston/logger')
const { success, notExistUser } = require('../err-codes/cmsPushCode')
const { MakeQueryKey } = require('../../constants/push')
const mybatisMapper = require('mybatis-mapper')
const path = require('path')

const moment = require('moment')
const request = require('request')
const { apiResponse } = require('../../utils/apiResponse')
// DB 연결
const dbPool = mysql.createPool(dbPoolProp)

/** 한명에게 테스트 발송 **/
exports.send_notification_to_one_test = async (req, res) => {
  const { title, message, email, image, urlLink } = req.body

  if (validationParamCheck(title, message, email)) {
    res.status(400).json({ error: 'email, title, message are required' })
    log.err('email, title, message are required')
  } else {
    const payload = makeMsgWithLinkAndImage(title, message, urlLink, image)
    /** 이메일을 통해 한명에게 보내기 **/
    const params = { key: 'email', value: email }

    const result = await excuteQueryAndSendNodifiaction(res, payload, params)
    const date = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')

    sendToSlack(title, message, email, image, urlLink, date)
  }
}

/** 발송가능 인원수 체크 **/
exports.push_count_check = async (req, res) => {
  const { osType, gender, ageRange, appVersion, swv, locale } = req.body
  const params = {
    osType: osType ? osType : null,
    gender: gender ? gender : null,
    appVersion: appVersion ? appVersion : null,
    swv: swv ? swv : null,
    locale: locale ? locale : null,
    first: null,
    last: null,
  }

  const connection = await dbPool.getConnection()
  try {
    const format = { language: 'sql', indent: '  ' }
    let findQuery = ''
    mybatisMapper.createMapper([path.resolve(__dirname, 'apiMapper/countQuery.xml')])

    if (ageRange !== 'all' && ageRange !== undefined) {
      const [first, last] = ageRange.split('~')
      params.first = first
      params.last = last
      findQuery = mybatisMapper.getStatement('cmsPushCountQuery', 'pushCountCheckFilterAgeRangeParams', params, format)
    } else {
      findQuery = mybatisMapper.getStatement('cmsPushCountQuery', 'pushCountCheckFilterParams', params, format)
    }

    const findAll =
      'SELECT count(*) as totalCount FROM  olive_user ou INNER JOIN phone_device pd  ON  ou.id = pd.olive_user_id INNER JOIN ear_device ed ON pd.id = ed.phone_device_id WHERE pd.fcm_token IS NOT NULL AND ou.use_push = 1  '

    let [result] = await connection.query(findQuery)
    let [result1] = await connection.query(findAll)
    const filteredCount = result[0].filteredCount
    const totalCount = result1[0].totalCount

    log.info(`findQuery  ====> ${findQuery} in executeQueryMybatisCronCmsPush`)
    log.info(`totalCount  ====> ${totalCount} && filteredCount  ====> ${filteredCount} in excuteQueryMybatisCronCmsPush`)

    success.msg = 'success'
    success.code = 200
    success.data = {
      totalCount,
      filteredCount,
    }
    success.success = true
    res.status(200).json(success)
  } catch (e) {
    res.status(500).json({ msg: e, success: false })
    log.err(`error :${e} in push_count_check`)
  } finally {
    connection.release()
  }
}

/**  메세지 작성  및 링크 및 이미지  **/
const makeMsgWithLinkAndImage = (title, msg, url, image) => {
  /**  이미지가 없는 경우  **/
  if (image === null || image === undefined) {
    let payload = {
      // 안드로이드
      data: {
        title: title || 'Olive Union',
        body: `${msg} \n [Link] : ${url}`,
      },
      // ios
      notification: {
        title: title || 'Olive Union',
        body: `${msg} \n [Link] : ${url}`,
      },
    }
    return payload

    /**  이미지가 있는 경우  **/
  } else {
    let payload = {
      // 안드로이드
      data: {
        title: title || 'Olive Union',
        body: `${msg} \n [Link] : ${url}  \n [image] : ${image}  `,
      },
      // ios
      notification: {
        title: title || 'Olive Union',
        body: `${msg} \n [Link] : ${url}  \n [image] : ${image}  `,
      },
    }

    return payload
  }
}

/* 알림 보내기 */
let send_notification = (tokens, payload) => {
  let options = {
    priority: 'high',
    timeToLive: 60 * 60,
  }
  log.info(`tokens : ${tokens}  in send_notification`)
  return new Promise(function (resolve, reject) {
    admin
      .messaging()
      .sendToDevice(tokens, payload, options)
      .then(function (response) {
        resolve({ message: response })
      })
      .catch(function (error) {
        log.err(`Error sending message:${error}`)
        reject({ error })
      })
  })
}

//슬랙에 보내기 (공통함수 )
const sendToSlack = (title, message, email, image, urlLink, date) => {
  const OU_SLACK = process.env.OU_SLACK
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[Develop]'
  else if (process.env.NODE_ENV === 'production') prefix = '[Production]'

  request.post(`${OU_SLACK}`, {
    header: { 'Content-Type': 'application/json' },
    json: true,
    body: {
      username: `${prefix}`,
      attachments: [
        {
          // this defines the attachment block, allows for better layout usage
          color: '#f7f2f2', // color of the attachments sidebar.
          fields: [
            // actual fields
            {
              title: `EMAIL : ${email}`,
              short: false,
            },
            {
              title: `DATE : ${date}`,
              short: false,
            },
            {
              title: `title : ${title}`,
              short: false,
            },
            {
              title: `title 길이 : ${title !== undefined ? title.length : title}`,
              short: false,
            },
            {
              title: `msg : ${message}`,
              short: false,
            },
            {
              title: `msg 길이 : ${message !== undefined ? message.length : message}`,
              short: false,
            },
            {
              title: `[Link] : ${urlLink ? urlLink : '-'}`,
              short: false,
            },
            {
              title: `[image] : ${image ? image : '-'}`,
              short: false,
            },
          ],
        },
      ],
    },
  })
}

/**  validation 체크 **/
const validationParamCheck = (text, text1, text2 = '') => {
  if (text === undefined || text === '' || text1 === undefined || text1 === '' || text2 === undefined || text2 === '') {
    return true
  }
  return false
}

/**  쿼리 작성  **/
const makeQueryString = (key, value = '') => {
  let findTokenQuery = "SELECT fcm_token FROM phone_device WHERE fcm_token IS NOT NULL AND fcm_token != ''"
  let findTokenJoinQuery = "SELECT fcm_token FROM phone_device INNER JOIN olive_user ON olive_user_id = olive_user.id WHERE fcm_token IS NOT NULL AND fcm_token !=''"
  let query = ''
  // key 와 value 를 한번더 확인
  if (validationParamCheck(key, value, true)) {
    return false
  }

  switch (key) {
    case MakeQueryKey.all:
      query = findTokenQuery
      break
    case MakeQueryKey.osType:
      query = findTokenQuery.concat(' ', `AND os_type='${value}'`)
      break
    case MakeQueryKey.appVersion:
      query = findTokenQuery.concat(' ', `AND app_version='${value}'`)
      break
    case MakeQueryKey.locale:
      query = findTokenQuery.concat(' ', `AND locale = '${value}'`)
      break
    case MakeQueryKey.lang:
      query = findTokenQuery.concat(' ', `AND lang ='${value}'`)
      break
    case MakeQueryKey.email:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.email='${value}'`)
      break
    case MakeQueryKey.gender:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.gender='${value}'`)
      break
    case MakeQueryKey.ageRange:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.age_range='${value}'`)
      break
    case MakeQueryKey.id_list:
      query = findTokenJoinQuery.concat(' ', `AND olive_user.id in (${value})`)
    default:
      break
  }
  return query
}

// notification으로 바로 보내기
const excuteQueryAndSendNodifiaction = async (res, payload, { key, value }) => {
  const findQuery = makeQueryString(key, value)

  // key 와 value가 없을경우 해당 key의 값 입력 필요 에러를 보내준다.
  if (!findQuery) {
    res.status(400).json({ error: `Please check ${key} and ${value}` })
    log.err(`Please check ${key} and ${value}`)
  }
  const connection = await dbPool.getConnection()
  try {
    let [rows, fields] = await connection.query(findQuery)

    let tokens = rows.map(row => {
      return row.fcm_token
    })

    log.info(`Push tokens ==> ${tokens} in excuteQueryAndSendNodifiaction`)

    let bulkTokenSize = 1000

    if (tokens.length > 0) {
      let returnJson = []
      let statusCode = 200
      let noOfLoads = tokens.length / bulkTokenSize
      if (tokens.length % bulkTokenSize !== 0) {
        noOfLoads++
      }
      noOfLoads = Math.floor(noOfLoads)

      for (let i = 0; i < noOfLoads; i++) {
        let start = i * bulkTokenSize,
          end = (i + 1) * bulkTokenSize
        let batchTokens = tokens.slice(start, end)

        send_notification(batchTokens, payload)
          .then(jsonObj => {
            if (i + 1 === noOfLoads) {
              console.log(JSON.stringify(jsonObj.message))
              const { successCount, failureCount: failCount } = jsonObj.message
              log.info(`Message send successCount : ===>${successCount} in send_notification`)
              log.info(`Message send failCount : ===>${failCount} in send_notification`)
              res.status(statusCode).json({ loadNumber: i + 1, success: { successCount, failCount } })
            }
          })
          .catch(error => {
            returnJson.push({ loadNumber: i + 1, error: error })
            statusCode = 500

            if (i + 1 === noOfLoads) {
              log.err(`${returnJson} in send_notification`)
              res.status(statusCode).json(returnJson)
            }
          })
      }
    } else {
      log.err(`message : Not found user's token in excuteQueryAndSendNodifiaction`)
      res.status(404).json(apiResponse(notExistUser))
    }
  } catch (error) {
    log.err(error)
    res.status(500).json({
      error: error,
    })
  } finally {
    connection.release()
  }
}

// 아래는 현재 사용하지 않는다

// /* 전체 발송 */
// exports.send_notification_to_all = async (req, res) => {
//   const { title, msg } = req.body
//   if (validationParamCheck(title, msg, true)) {
//     res.status(400).json({ error: 'msg, title are required' })
//     log.err('msg, title are required')
//   } else {
//     const payload = makeMsg(title, msg)
//
//     const params = { key: 'all', value: 'all' }
//     await excuteQueryAndSendNodifiaction(res, payload, params)
//   }
// }

//
// /* 특정 성별에게 발송 */
// exports.send_notification_to_gender = async (req, res) => {
//   const { title, msg, gender } = req.body
//
//   if (validationParamCheck(title, msg, gender)) {
//     res.status(400).json({ error: 'title, message, gender are required' })
//     log.err('title, message, gender are required')
//   } else {
//     const payload = makeMsg(title, msg)
//     const params = { key: 'gender', value: gender }
//     await excuteQueryAndSendNodifiaction(res, payload, params)
//   }
// }
//
// /* 특정 나이대에게 발송 */
// exports.send_notification_to_age = async (req, res) => {
//   const { title, msg, age_range: ageRange } = req.body
//
//   if (validationParamCheck(title, msg, ageRange)) {
//     res.status(400).json({ error: 'title, message , ageRange are required' })
//     log.err('title, message, ageRange are required')
//   } else {
//     const payload = makeMsg(title, msg)
//     const params = { key: 'ageRange', value: ageRange }
//     await excuteQueryAndSendNodifiaction(res, payload, params)
//   }
// }
//
// /* 특정 OS TYPE에 발송 */
// exports.send_notification_to_os = async (req, res) => {
//   const { title, msg, os_type: osType } = req.body
//
//   if (validationParamCheck(title, msg, osType)) {
//     res.status(400).json({ error: 'title, message, osType are required' })
//     log.err('title, message, osType are required')
//   } else {
//     const payload = makeMsg(title, msg)
//     const params = { key: 'osType', value: osType }
//     await  excuteQueryAndSendNodifiaction(res, payload, params)
//   }
// }
//
// /* 특정 app version에 발송 */
// exports.send_notification_to_app = async (req, res) => {
//   const { title, msg, app_version: appVersion } = req.body
//
//   if (validationParamCheck(title, msg, appVersion)) {
//     res.status(400).json({ error: 'title, message, app_version are required' })
//     log.err('title, message, app_version are required')
//   } else {
//     const payload = makeMsg(title, msg)
//     const params = { key: 'appVersion', value: appVersion }
//     await excuteQueryAndSendNodifiaction(res, payload, params)
//   }
// }
// /* 토픽별 발송 */
// exports.send_notification_to_topic = (req, res, next) => {
//   const { title, msg } = req.body
//   let { topic } = req.body
//   if (validationParamCheck(title, msg, topic)) {
//     res.status(400).json({ error: 'title, msg, topic are required' })
//     log.err('title, msg, topic, and data are required')
//     return
//   }
//
//   if (PushTopic.includes(topic)) {
//     let payload = {
//       notification: {
//         type: topic || 'TOPIC',
//         title,
//         body: msg,
//       },
//       data: {
//         type: topic || 'TOPIC',
//         title,
//         body: msg,
//       },
//     }
//     topic = '/topics/' + topic
//     admin
//       .messaging()
//       .sendToTopic(topic, payload)
//       .then(response => {
//         log.info(`Topic send success :  ${JSON.stringify(response)}`)
//         res.status(200).json({ success: true })
//       })
//       .catch(error => {
//         log.err(error)
//         res.status(500).json({ success: false })
//       })
//   } else {
//     cmsPushKeyTopicErr.msg = `This ${topic} is not exist`
//     res.status(400).send(cmsPushKeyTopicErr)
//   }
// }
//

//
//
// /* 토픽별 발송 */
// exports.send_notification_to_topic = (req, res, next) => {
//   const { title, msg } = req.body
//   let { topic } = req.body
//   if (validationParamCheck(title, msg, topic)) {
//     res.status(400).json({ error: 'title, msg, topic are required' })
//     log.err('title, msg, topic, and data are required')
//     return
//   }
//
//   if (PushTopic.includes(topic)) {
//     let payload = {
//       notification: {
//         type: topic || 'TOPIC',
//         title,
//         body: msg,
//       },
//       data: {
//         type: topic || 'TOPIC',
//         title,
//         body: msg,
//       },
//     }
//     topic = '/topics/' + topic
//     admin
//         .messaging()
//         .sendToTopic(topic, payload)
//         .then(response => {
//           log.info(`Topic send success :  ${JSON.stringify(response)}`)
//           res.status(200).json({ success: true })
//         })
//         .catch(error => {
//           log.err(error)
//           res.status(500).json({ success: false })
//         })
//   } else {
//     cmsPushKeyTopicErr.msg = `This ${topic} is not exist`
//     res.status(400).send(cmsPushKeyTopicErr)
//   }
// }
//
//
// /* 메세지 작성 */
// const makeMsg = (title, msg) => {
//   const payload = {
//     data: {
//       title: title || 'Olive Union',
//       body: msg,
//     },
//     notification: {
//       title: title || 'Olive Union',
//       body: msg,
//     },
//   }
//
//   return payload
// }
