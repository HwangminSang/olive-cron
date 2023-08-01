const { PushTopic } = require('../../constants/push')
const { log } = require('../../winston/logger')

const { validationParamCheck } = require('../util/vaolidationParamCheck')
const { executeQueryMybatisByFilterCronCmsPush, executeQueryMybatisByTopicCronCmsPush } = require('../repository/cmsPushCronMybatisRepository')
const { excuteQueryCronCmsPush } = require('../repository/cmsPushCronRepository')
/**
 * cron - cmsPush 전체 보내기
 * validationParamCheck() 파라미터 체크
 * makeMsg()를 통해 타이틀 및 메세지 작성
 * params 객체를 통해 어떻게 보낼지 결정
 * ( 현재 사용 0 )
 */
exports.sendPushToAll = async (id, title, message) => {
  if (validationParamCheck(title, message, true)) {
    log.err(`Error : title : ${title}, msg  : ${msg} are required`)
  } else {
    const payload = makeMsg(title, message)
    const params = { key: 'all', value: 'all' }
    return await excuteQueryCronCmsPush(id, payload, params)
  }
}

/**
 * cron - 아이디 리스트로만 보내기
 * idList 를 파라미터로 받는다 ( 현재 사용 x )
 * params 객체를 통해 어떻게 보낼지 결정
 * 일반 쿼리문을 작성하여 처리
 */
exports.sendPushToIdList = async (id, title, msg, idList) => {
  if (validationParamCheck(title, msg, idList)) {
    log.err(`Error : title : ${title}, msg  : ${msg}, idList  : ${idList} are required`)
  } else {
    const payload = makeMsg(title, msg)
    const params = { key: 'id_list', value: idList }

    return await excuteQueryCronCmsPush(id, payload, params)
  }
}

/**
 * cron - 조건으로 보내기
 * params 객체를 통해 어떻게 보낼지 결정
 * filter 는 json 형태로 디비에  string 으로 저장되어 다시 json 형태로 파싱합니다
 * 마이바티스 이용 동적 쿼리 사용
 * ( 현재 사용 0 )
 */
exports.sendPushToFilter = async (id, title, msg, filter) => {
  if (validationParamCheck(title, msg, filter)) {
    log.err(`Error : title  : ${title},   msg : ${msg}, filter : ${JSON.stringify(filter)} are required`)
  } else {
    const payload = makeMsg(title, msg)

    return await executeQueryMybatisByFilterCronCmsPush(id, payload, filter)
  }
}

/**
 * cron - topic으로 보내기
 * params 객체를 통해 어떻게 보낼지 결정
 * 마이바티스 이용 동적 쿼리 사용
 * ( 현재 사용 0 )
 */
exports.sendPushToTopic = async (id, topic, link, message, title, country, os) => {
  if (validationParamCheck(topic, message, title)) {
    log.err(`Error : topic  : ${topic}, message : ${message}, title : ${title} are required in sendPushToTopic`)
    return
  }

  /** ['game', 'event', 'notice', 'promo']  게임 , 이벤트 , 공지 , 프로모션  여부 확인 **/
  if (PushTopic.includes(topic)) {
    const payload = {
      // 안드로이드
      data: {
        title: title || 'Olive Union',
        body: message,
        topic,
        link,
      },

      // ios
      notification: {
        title: title || 'Olive Union',
        body: message,
        topic,
        link,
      },
    }

    // const payload = makeMsg(title, message)
    return await executeQueryMybatisByTopicCronCmsPush(id, payload, country, os)
  } else {
    log.err(`error : This topic : ${topic} in not exist in sendPushToTopic`)
    return false
  }
}

/**
 * 메세지 작성 ( 추후 앱팀과 상의하여 업데이트 필요 )
 */
const makeMsg = (title, msg) => {
  const payload = {
    // 안드로이드
    data: {
      title: title || 'Olive Union',
      body: msg,
    },

    // ios
    notification: {
      title: title || 'Olive Union',
      body: msg,
    },
  }

  return payload
}
