'use strict'

const cron = require('cron')
const request = require('request')
const moment = require('moment')
const urlencode = require('urlencode')
const { PushStatus, PushSendType, SendTarget } = require('../constants/push')
const { sendPushToAll, sendPushToIdList, sendPushToFilter, sendPushToTopic } = require('./service/cmsPushCronService')
const { log } = require('../winston/logger')
const cmsPushMDB = require('../api/mysql/cms.push')

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
// const cronTime = '00 */01 * * * *'

const cronTime = '00 */01 * * * *'

const OU_SLACK = process.env.OU_SLACK

log.info(`process.env.NODE_ENV: ${process.env.NODE_ENV} in cmsPush`)
log.info(`OU_SLACK: ${OU_SLACK} in cmsPush`)
log.info(`Register Cms Push Cron:${process.env.NODE_ENV}_${new Date().toISOString()}_${process.pid} in cmsPush `)

//슬랙에 보내기 (공통함수 )
function sendToSlack(result) {
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[Develop]'
  else if (process.env.NODE_ENV === 'production') prefix = '[Production]'

  request.post(`${OU_SLACK}`, {
    header: { 'Content-Type': 'application/json' },
    json: true,
    body: {
      username: `${prefix} ${result.date} Olive Union Push`,
      attachments: [
        {
          // this defines the attachment block, allows for better layout usage
          color: '#f7f2f2', // color of the attachments sidebar.
          fields: [
            // actual fields
            {
              title: `${result.title}`, // Custom field
              short: false, // long fields will be full width
            },
            {
              title: `${result.subTitle}`,
              short: false,
            },
            {
              title: `${result.message}`,
              short: false,
            },
          ],
        },
      ],
    },
  })

  log.info(`\n>>> === >>> sendToSlack called: ${prefix} , ${JSON.stringify(result)} ===> in sendToSlack`)
}

// 공통함수  ( 슬랙에 보냄)
function sendToSlackChannel(title, subTitle, message) {
  const result = {
    date: moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분'),
    title,
    subTitle,
    message,
  }

  sendToSlack(result)
}

/**
 * 예약발송  send_Type =1   해당 함수실행 순서 : 3번
 * SendTarget 상수   ToAll = 1 ( 모두에게 )  , ToTopic = 2 ( 토픽 ) , ToFilter =3 ( 조건 )  , ToIdList = 4 ( idList )
 */
const reservedPushSend = async push => {
  const { ToAll, ToTopic, ToFilter, ToIdList } = SendTarget
  const { id, title, message, urlLink, sendTo, topic, idList, filter, country, os } = push
  const deepLink = 'ouapp://?game=normal'
  // //문제있음 config 라는 속성이 없음
  // let link = config.homeSiteUrl || 'https://www.oliveunion.shop/'
  let link = 'https://www.oliveunion.shop/'
  if (urlLink) link = urlLink
  link = urlencode(link)
  log.info(`Push urlLink ==>${link} in reservedPushSend`)
  let pushed = false
  /**
   *  해당 push row 의 id 칼럼으로 검색
   *  reserveStatus 의 상태값을  PushStatus.start = 1 (시작,예약)  --->  PushStatus.Process = 2 (진행) 으로 변경
   *  pushedDateTime ( 발송된시간 ) 을 현재시간으로 업데이트한다.
   *  updated_at ( 업데이트 시간 )을 현재시간으로 업데이트한다.
   */
  pushed = await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Process)
  /**
   * isSuccessSendPush 는 성공여부  false 로 설정 후 성공시 true
   */
  let isSuccessSendPush = false
  switch (sendTo) {
    // 모두에게 -> 1
    case ToAll:
      log.info(`id : ${id} , sendTo = ${sendTo} , sendToAll in reservedPushSend `)
      isSuccessSendPush = await sendPushToAll(id, title, message)
      break
    // 토픽 - > 2 ( 현재 해당 링크는 임으로 설정 ouapp://?openweb=${link}&hiddenbar=true )
    // 모바일팀과 프로토콜 상의 후 새롭게 정의하여 보낼 필요가 있음
    case ToTopic:
      log.info(`id : ${id} , sendTo = ${sendTo}, sendTopic in reservedPushSend`)
      isSuccessSendPush = await sendPushToTopic(id, topic, `ouapp://?openweb=${link}&hiddenbar=true`, message, title, country, os)
      break
    //   filter 는 json 형태로 디비에  string 으로 저장되어 다시 json 형태로 파싱합니다
    case ToFilter:
      log.info(`id : ${id} , sendTo = ${sendTo}, sendToFilter in reservedPushSend`)
      const jsonFilter = JSON.parse(filter)
      isSuccessSendPush = await sendPushToFilter(id, title, message, jsonFilter)
      break
    // 아이디 리스트 -> 4
    case ToIdList:
      log.info(`id : ${id} , sendTo = ${sendTo}, sendToIdList in reservedPushSend`)
      isSuccessSendPush = await sendPushToIdList(id, title, message, idList)
      break
    default:
      log.err(`Send_to type is unknown sendTo: ${sendTo} , ${new Date().toISOString()} in reservedPushSend`)
      break
  }
  /**
   *  isSuccessSendPush 가 false 경우 실패  , true 인 경우 성공
   */
  if (isSuccessSendPush) {
    /** isSuccessSendPush 가  true 이지만 검색조건에 맞는 유저가 없는 enum 을 ( 6 ) 반환시 **/
    if (isSuccessSendPush === PushStatus.NotFoundUser) {
      /** 해당 row 를  6(검색조건없음) 으로 업데이트  **/
      await cmsPushMDB.updatePushReserveStatus(push, PushStatus.NotFoundUser)
      return
    }
    /** 해당 row 를  발송완료로 업데이트  **/
    pushed = await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Complete)
    if (!pushed) {
      log.err(`\n>>> === >>> Push broadcast message send to user column update Fail: ${new Date().toISOString()} in reservedPushSend`)
      return false
    }
    /** 슬랙에 발송시 한국 시간으로 표기  **/
    const today = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')
    sendToSlackChannel(`[발송 완료] ${today}`, `[title] ${title}`, `[message] ${message}`)
    log.info(`Push reserved message send to user End: ${new Date().toISOString()} in reservedPushSend`)
    return true
  } else {
    /** isSuccessSendPush 가 false 인경우 발송 에러로  PushStatus.Error = 9 , ReserveStatus 상태변경 2->9 변경 **/
    log.err(`\n>>> === >>> Push broadcast message send to user column update Fail: ${new Date().toISOString()} in reservedPushSend`)
    await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Error)
    return false
  }
}

/** 다이렉트 보내기 send_type =2   해당 함수실행 순서 : 3번 **/
const directPushSend = async push => {
  const { ToAll, ToTopic, ToFilter, ToIdList } = SendTarget
  const { id, title, message, urlLink, sendTo, topic, idList, filter, country, os } = push

  const deepLink = 'ouapp://?game=normal'

  //문제있음 config 라는 속성이 없음
  // let link = config.homeSiteUrl || 'https://www.oliveunion.shop/'
  let link = 'https://www.oliveunion.shop/'
  if (urlLink) link = urlLink
  link = urlencode(link)
  log.info(`Push urlLink ==> ${link} in directPushSend`)

  let pushed = false
  // ReserveStatus 상태변경 2
  pushed = await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Process)
  let isSuccessSendPush = false
  switch (sendTo) {
    // 전체 ( 현재 사용하지 않음 )
    case ToAll:
      log.info(`id : ${id} , sendTo = ${sendTo} , sendToAll in directPushSend `)
      isSuccessSendPush = await sendPushToAll(id, title, message)
      break
    // 토픽 - > 2 ( 현재 해당 링크는 임으로 설정 ouapp://?openweb=${link}&hiddenbar=true )
    // 모바일팀과 프로토콜 상의 후 새롭게 정의하여 보낼 필요가 있음
    case ToTopic:
      log.info(`id : ${id} , sendTo = ${sendTo}, sendTopic in directPushSend`)
      isSuccessSendPush = await sendPushToTopic(id, topic, `ouapp://?openweb=${link}&hiddenbar=true`, message, title, country, os)
      break
    //   filter 는 json 형태로 디비에  string 으로 저장되어 다시 json 형태로 파싱합니다
    case ToFilter:
      log.info(`id : ${id} , sendTo = ${sendTo}, sendToFilter in directPushSend`)
      const jsonFilter = JSON.parse(filter)
      isSuccessSendPush = await sendPushToFilter(id, title, message, jsonFilter)
      break
    // Id_list
    case ToIdList:
      log.info(`id : ${id} ,sendTo = ${sendTo}, sendToIdList in directPushSend`)
      isSuccessSendPush = await sendPushToIdList(id, title, message, idList)
      break
    default:
      log.err(`id : ${id} , sendTo type is unknown send_to: ${sendTo} , ${new Date().toISOString()} in directPushSend`)
      break
  }

  /**
   *  isSuccessSendPush 가 false 경우 실패  , true 인 경우 성공
   */
  if (isSuccessSendPush) {
    /** isSuccessSendPush 가  true 이지만 검색조건에 맞는 유저가 없는 enum 을 ( 6 ) 반환시 **/
    if (isSuccessSendPush === PushStatus.NotFoundUser) {
      /** 해당 row 를  6(검색조건없음) 으로 업데이트  **/
      await cmsPushMDB.updatePushReserveStatus(push, PushStatus.NotFoundUser)
      return
    }
    /** 해당 row 를  발송완료로 업데이트  **/
    pushed = await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Complete)

    if (!pushed) {
      log.err(`\n>>> === >>> Push broadcast message send to user column update Fail: ${new Date().toISOString()} in directPushSend`)
      return false
    }
    /** 슬랙에 발송시 한국 시간으로 표기  **/
    const today = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')
    sendToSlackChannel(`[발송 완료] ${today}`, `[title] ${title}`, `[message] ${message}`)

    log.info(`Push direct message send to user End: ${new Date().toISOString()} in directPushSend`)
    return true
  } else {
    /** isSuccessSendPush 가 false 인경우 발송 에러로  PushStatus.Error = 9 , ReserveStatus 상태변경 2->9 변경 **/
    log.err(`isSuccessSendPush + ${isSuccessSendPush}`)
    await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Error)
    return false
  }
}

/**  onTick 속성에 의해  해당 함수실행 순서 : 2번 **/
async function proc() {
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[test || develop]'
  else if (process.env.NODE_ENV === 'production') prefix = '[Production]'
  const today = new Date().toISOString()
  let startDate = new Date()
  let endDate = new Date()
  /**
   * 검색 시간을 현재시간 기준으로 -30초  +30초로 설정하여 검색
   * toISOString()을 이용하여 db에 저장된 utc타임으로 변경
   */
  startDate.setSeconds(startDate.getSeconds() - 30)
  startDate = startDate.toISOString()
  endDate.setSeconds(endDate.getSeconds() + 30)
  endDate = endDate.toISOString()
  log.info(`Begin CMS Push.everyMinute (${prefix}) : ${startDate} '< today : ${today}<', ${endDate} in cmsPush-proc`)
  let push = {}
  try {
    /**
     * CMS_PUSH 테이블에서 update_at을 기준으로 DESC(내림차순)후  reserveDateTime 예약시간이 현재시간보다 이전인 row 1개만 가져온다
     * usable: 1 (삭제 되지 않은것만 ) , reserve_status: 1 (시작 ) --> PushStatus 상수 확인,
     * 보낼 cmsPush 가 없을경우 null 로 할당되어 else 구문으로 향한다.
     * 딜레이가 생길수 있는 부분에 대해서는 기획자에게 전달 완료 및 승인 받음
     */
    push = await cmsPushMDB.findToBeSendCMS()
    log.info(`push 데이터 확인 : ${JSON.stringify(push)} in cmsPush-proc`)
    if (push) {
      switch (push.sendType) {
        case PushSendType.Reserve:
          log.info('push no direct in cmsPush-proc')
          await reservedPushSend(push)
          break
        case PushSendType.Direct:
          log.info(`push direct in cmsPush-proc`)
          await directPushSend(push)
          break
        default:
          log.err(`Push message type is unknown sendType: ${push.sendType}, ${new Date().toISOString()} in cmsPush-proc`)
          break
      }
    } else {
      log.info(`\nPush message data is not found!  ${new Date().toISOString()} in cmsPush-proc`)
    }
  } catch (error) {
    if (push !== null && push !== undefined && Object.keys(push).length !== 0) {
      await cmsPushMDB.updatePushReserveStatus(push, PushStatus.Error)
      log.err(`CMS Push Error: ${error} in cmsPush-proc`)
    }
    log.err(`CMS Push Error: ${error} in cmsPush-proc`)
  }
  log.info(`\nFinish CMS Push.everyMinute:${new Date().toISOString()} in cmsPush-proc`)
}

/**
 * 1분마다 실행   순서 : 1번
 */
exports.everyMinute = new cron.CronJob({
  cronTime,
  start: false,
  onTick: () => {
    proc()
      .then(() => {})
      .catch(err => {
        log.err(`FINAL CMS Push ERROR:${err} in cmsPush`)
      })
  },
})
