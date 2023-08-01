import * as express from 'express'
import OpenTok from 'opentok'

import { log } from '../../winston/logger'

const moment = require('moment')

const request = require('request')
const db = require('../models')
const VideoChat = db.videoChat
const SessionMnt = db.sessionMnt
const StreamMnt = db.streamMnt
const ArchiveMnt = db.archiveMnt

const { Op } = db.Sequelize
const handler = require('../../libs/util/mysql/handler')(VideoChat)

const oliveproApiKey = process.env.VIDEOCHAT_API
const oliveproApiSecret = process.env.VIDEOCHAT_SEC

const slackHookURL = process.env.VC_SLACK

interface ResObject {
  code: number
  data: Array<Object> | Object
  success: boolean
  message?: string
}

// 모바일에서 세션 생성 요청, 세션 생성 후 토큰 res
interface SessionData {
  sessionId: string
  owner: string
  name: string
  gender: string
  lang: string
  leftMaster: string
  leftLoud: string
  leftMedium: string
  leftSoft: string
  leftCoordnateTable: string
  rightMaster: string
  rightLoud: string
  rightMedium: string
  rightSoft: string
  rightCoordnateTable: string
  count: string
  birthDate: string
  oliveType: number
  title: string
  comment: string
  progressStatus: number
}

interface SlackKey {
  owner: string
  sessionId: string
  leftMaster: string
  leftLoud: string
  leftMedium: string
  leftSoft: string
  leftLength: string
  rightMaster: string
  rightLoud: string
  rightMedium: string
  rightSoft: string
  rightLength: string
  count: string
  oliveType: number
}

//모바일에서 비디오 챗팅을 위한 세션 생성 및 연결
export const createFromMobile = async (req: express.Request, res: express.Response): Promise<void> => {
  log.info('createSession by mobile')
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  // OpenTok객체 생성 (비디오 채팅을 위해)
  const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret) // 반복로직 공통함수처리하면 좋으듯
  // 새션 생성
  proOpentok.createSession(
    { mediaMode: 'routed', archiveMode: 'manual' },
    async function (
      err: { message: any },
      session:
        | {
            sessionId: any
            generateToken: (arg0: {
              role: string
              expireTime: number // six hour
              data: string
              initialLayoutClassList: string[]
            }) => any
          }
        | undefined
    ) {
      if (err) log.err(`error: ${err}`)
      //모바일에서 날라온 사용자의 이메일 또는 아이디
      const owner: string = req.body.owner ? req.body.owner : 'undefined'
      if (session !== undefined) {
        //콜백함수를 통해 받아온 session객체에서 sessionId를 뽑늗
        const sessionId: string = session.sessionId
        // 첫번째 인자로 sessionId , 두번째는 options객체 (토큰에 대한 옵션을 정의하는 객체 (선택사항) )
        const token: string = await session.generateToken({
          role: 'publisher', // 역할을 지정하지 않을 경우 기본값 !!!  ,subscriber , publisher , moderator
          expireTime: new Date().getTime() / 1000 + 60 * 60 * 6, // six hour   토큰 생성 시간 후 24시간의 기본 만료 시간 ,  최대 만료 시간은 생성 후 30일입니다
          data: `user=${owner}`, // 예를 들어 사용자 ID, 이름 또는 최종 사용자를 설명하는 기타 데이터를 전달할 수 있습니다.
          initialLayoutClassList: ['focus'], // 레이아웃 https://tokbox.com/developer/guides/archive-broadcast-layout/#assign-layout-classes-to-streams
        })

        const sessionDataJson: SessionData = {
          sessionId,
          owner,
          name: req.body.firstName ? req.body.lastName + req.body.firstName : '-',
          gender: req.body.gender || '-',
          lang: req.body.lang || '-',
          leftMaster: req.body.leftMaster || '-',
          leftLoud: req.body.leftLoud || '-',
          leftMedium: req.body.leftMedium || '-',
          leftSoft: req.body.leftSoft || '-',
          leftCoordnateTable: req.body.leftCoordnateTable || '-',
          rightMaster: req.body.rightMaster || '-',
          rightLoud: req.body.rightLoud || '-',
          rightMedium: req.body.rightMedium || '-',
          rightSoft: req.body.rightSoft || '-',
          rightCoordnateTable: req.body.rightCoordnateTable || '-',
          count: req.body.count || '-',
          birthDate: req.body.birthDate || '-',
          oliveType: 1, // 올리브 기기 타입 se, pro, max 등
          title: req.body.title || '-',
          comment: req.body.comment || '-',
          progressStatus: 1, // 1 = 세션 열림 2 = 대화 진행중 3 = 종료됨
        }
        try {
          await VideoChat.create(sessionDataJson) // video_chat 디비에 입력

          resObject.data = { sessionId, token } // 모바일에 응답
          res.send(resObject)

          const slackKey: SlackKey = {
            owner,
            sessionId,
            leftMaster: req.body.leftMaster || '-',
            leftLoud: req.body.leftLoud || '-',
            leftMedium: req.body.leftMedium || '-',
            leftSoft: req.body.leftSoft || '-',
            leftLength: req.body.leftCoordnateTable?.split(',').length || '0',
            rightMaster: req.body.rightMaster || '-',
            rightLoud: req.body.rightLoud || '-',
            rightMedium: req.body.rightMedium || '-',
            rightSoft: req.body.rightSoft || '-',
            rightLength: req.body.rightCoordnateTable?.split(',').length || '0',
            count: req.body.count || '-',
            oliveType: 1,
          }

          //슬렉에 보내기
          sendToSlack(slackKey)
        } catch (e) {
          log.err(`error: ${e}`)
          resObject = {
            code: -2000,
            data: {},
            success: false,
            message: 'Some error occurred while creating the sessionData.',
          }
          res.send(resObject)
        }
      }
    }
  )
}

// web애서 세션 조인 moderator token 생성
//중재자 권한이 포함된 토큰 으로 세션에 연결할 때 다른 클라이언트가 세션에서 연결을 끊거나 스트림 게시를 중지하거나 오디오를 음소거하도록 강제할 수 있습니다.
export const createModeratorToken = async (req: express.Request, res: express.Response) => {
  log.info('createModeratorToken from web')
  const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret)
  const sessionId: string = req.body.sessionId // 받아온 sessionId 유효하지 않으면 토큰을 발급받지 못한다
  const owner: string = req.body.owner // 사용자 이메일
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  try {
    const pubToken: string = await proOpentok.generateToken(sessionId, {
      role: 'moderator', // 모더레이터  https://tokbox.com/developer/guides/moderation/
      expireTime: new Date().getTime() / 1000 + 60 * 60 * 6, //  six hour
      data: `client=${owner}`,
      initialLayoutClassList: ['focus'],
    })
    resObject.data = { token: pubToken }
    res.send(resObject)
  } catch (e) {
    resObject.success = false
    res.send(resObject)
  }
}

//모바일에서 세션ID 등록 후 토큰 재생성
export const regenPubToken = async (req: express.Request, res: express.Response) => {
  log.info('regenerate PubToken from mobile')
  const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret)
  const sessionId: string = req.body.sessionId
  const owner: string = req.body.owner
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  try {
    const pubToken: string = await proOpentok.generateToken(sessionId, {
      role: 'publisher',
      expireTime: new Date().getTime() / 1000 + 60 * 60 * 6, //  six hour
      data: `client=${owner}`, // session_mnt의 connectionData 부분에 들어간다.
      initialLayoutClassList: ['focus'],
    })
    resObject.data = { token: pubToken }
    res.send(resObject)
  } catch (e) {
    log.err(`error: ${e}`)
    resObject.code = -2000
    resObject.success = false
    resObject.message = 'An error occurred while generating the token.'
    res.send(resObject)
  }
}

interface ReqConditions {
  minAge?: number
  maxAge?: number
  gender?: string
  lang?: string
  staus?: number
  text?: string
  progressStatus?: number
  id?: number
}

const opor: (strr: string) => { readonly 0: unique symbol }[0] = strr => Symbol(strr) as ReturnType<typeof opor>

interface ConditionsForDB {
  [index: string]: string | undefined | object | number
  age?: object
  lang?: string
  progressStatus?: number
  // opor?: object
}

const obj = {
  foo: 'hello',
}

const propertyName = 'foo'

const obj2 = {
  foo: 'hello',
}

let propertyName2 = 'foo'

log.info(obj[propertyName]) // ok!
log.info(obj['foo']) // ok!

// console.log(obj2[propertyName2]) // compile error!

const getConditions: Function = (condition: ReqConditions): {} => {
  let _condition: ConditionsForDB = {}
  const keys: Array<string> = Object.keys(condition) // 객체의 key값만 꺼낸다
  const values = Object.values(condition) // value값만 꺼낸다
  const keyStrs: Array<String> = ['gender', 'lang', 'progressStatus']
  for (let i = 0; i < keys.length; i++) {
    // key값의 갯수만큼 돌아간다
    if (keyStrs.includes(keys[i])) {
      // body의 key값으로 ['gender', 'lang', 'progressStatus'] 있는지 확인
      _condition[keys[i]] = values[i] //  _condition 해당 key값에 value값 할당
      continue // 다음으로 진행
    }
    // body에 ['gender', 'lang', 'progressStatus'] 그 외 age or text는 쿼리문을 만든다
    if (keys[i] === 'minAge' && keys.includes('maxAge')) {
      _condition['age'] = { [Op.between]: [condition.minAge, condition.maxAge] } // { betwwen minAge and maxAge }
      continue
    }
    if (keys[i] === 'minAge' && !keys.includes('maxAge')) {
      _condition['age'] = { [Op.lte]: condition.minAge } // where age  <= minAge
      continue
    }
    if (keys[i] === 'maxAge' && !keys.includes('minAge')) {
      _condition['age'] = { [Op.between]: [0, condition.maxAge] } // betwwen 0 and maxAge
      continue
    }
    if (keys[i] === 'text' && keys[i]) {
      _condition[Op.or] = [{ owner: { [Op.like]: '%' + condition.text + '%' } }, { name: { [Op.like]: '%' + condition.text + '%' } }]
      // where owner like = '%text%' or nane = '%text%'
    }
    continue
  }

  return _condition
}

// 조건에 맞는 VideoChat session List 가져오기
export const findByCondition = async (req: express.Request, res: express.Response): Promise<void> => {
  log.info('findByCondition requested')
  /**
   body로 받아오는 값
   {
  "minAge": 41,
  "maxAge": 50,
  "gender": "male",
  "lang": "en",
  "text": "olive",
  "progressStatus": 1  //1 = 세션 열림
}
   */
  const condition: ConditionsForDB = getConditions(req.body)

  const curOffset: number = req.body.curPage ? (req.body.curPage - 1) * 10 : 0 // 현재 curPage를 body로 받아오지 않음.  한페이지에 10개씩
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  try {
    //condietion =>  ` WHERE (`video_chat`.`owner` LIKE '%s%' OR `video_chat`.`name` LIKE '%s%') AND `video_chat`.`age` BETWEEN '41' AND '50' AND `video_chat`.`gender` = 'male' AND `video_chat`.`lang` = 'en' AND `video_chat`.`progressStatus` = 1
    //                 ORDER BY `video_chat`.`id` DESC LIMIT 0, 10;
    const resultArray: Array<object | number> = await Promise.all([
      // 프로미스를 all을 이용하여 병렬적으로 실행
      VideoChat.findAll({ where: condition, order: [['id', 'DESC']], offset: curOffset, limit: 10 }),
      VideoChat.count({ where: condition }),
    ])
    const filtered = resultArray[0] // VideoChat.findAll 결과값
    const total = resultArray[1] //VideoChat.count 결과값
    resObject.data = { filtered, total: total }
    res.send(resObject)
  } catch (e) {
    log.err(`error: ${e}`)
    resObject.code = -2000
    resObject.success = false
    resObject.message = 'Error occurred during inquiry'
    res.send(resObject)
  }
}

//모든 비디오쳇 session List 가져오기
export const findAllSession = async (req: express.Request, res: express.Response) => {
  log.info('findAll session')
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  try {
    const allList = await VideoChat.findAll() // video_chat 테이블에서 정보를 가져온다.
    resObject.data = allList
    res.send(resObject)
  } catch (e) {
    log.err(`error: ${e}`)
    resObject.code = -2000
    resObject.success = false
    resObject.message = 'Error occurred during inquiry'
    res.send(resObject)
  }
}

interface ReqEdit {
  id: number
  setTo: number // 0,1,2,3
}

export const editSessionProgress = async (req: express.Request, res: express.Response) => {
  let resObject: ResObject = {
    code: 200,
    data: {},
    success: true,
  }
  /**
   {
  "id": 1,
  "setTo": 1    progressStatus // 1 = 세션 열림 2 = 대화 진행중 3 = 종료됨
    }
   */
  const regEdit: ReqEdit = req.body
  log.info(`editProgress post requested id=${regEdit.id}, setTo=${regEdit.setTo} session`)
  const condition = {
    id: regEdit.id,
  }
  try {
    await VideoChat.update(
      {
        progressStatus: regEdit.setTo,
      },
      { where: condition }
    )
    res.send(resObject)
  } catch (e) {
    log.info(`error: ${e}`)
    resObject.code = -2000
    resObject.success = false
    res.send(resObject)
  }
}

//세션모니터링
export const sessionMonitoring = async (req: express.Request, res: express.Response) => {
  log.info(`sessionMonitoring post requested`)
  // console.log('req', req)
  if (Object.keys(req.body).length !== 0) {
    if (req.body.stream) {
      StreamMnt.create({
        sessionId: req.body.sessionId,
        projectId: req.body.projectId,
        event: req.body.event,
        reason: req.body.reason,
        timestamp: req.body.timestamp,
        streamId: req.body.stream.id,
        streamAt: req.body.stream.createdAt,
        streamName: req.body.stream.name,
        streamType: req.body.stream.videoType,
        connectionId: req.body.stream.connection.id,
        connectionAt: req.body.stream.connection.createdAt,
        connectionData: req.body.stream.connection.data,
      })
      res.send(201)
    } else {
      SessionMnt.create({
        sessionId: req.body.sessionId,
        projectId: req.body.projectId,
        event: req.body.event,
        reason: req.body.reason,
        timestamp: req.body.timestamp,
        connectionId: req.body.connection.id,
        connectionAt: req.body.connection.createdAt,
        connectionData: req.body.connection.data,
      })
      const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret)
      const role = req.body.connection.data.slice(0, 4)
      if (role === 'user') {
        const event = req.body.event === 'connectionCreated' ? 'appConnect' : 'appLost'
        proOpentok.signal(
          req.body.sessionId,
          null,
          {
            type: event,
            data: {
              reason: req.body.reason,
            },
          },
          () => res.send(201)
        )
      } else if (role === 'clie') {
        const event = req.body.event === 'connectionCreated' ? 'cmsConnect' : 'cmsLost'
        proOpentok.signal(
          req.body.sessionId,
          null,
          {
            type: event,
            data: {
              reason: req.body.reason,
            },
          },
          () => res.send(201)
        )
      } else {
        res.send(503)
        log.err('Invalid connection data came into session monitoring.')
      }
    }
    // res.send('session mnt data gotten')
  } else {
    res.send(503)
  }
}

// 녹화시작
export const startArchive = async (req: express.Request, res: express.Response) => {
  const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret)
  const sessionId = req.body.sessionId // 발급받았던 sessionId를 요청 받는다
  log.info(`StartArchive Post Requested sessionId:${sessionId}`)
  proOpentok.startArchive(sessionId, { name: 'Archive Test 3582' }, (err: any, archive: { id: any }) => {
    // 첫번째 메게변수는 		아카이브할 OpenTok 세션의 세션 ID입니다.   medioMode가 routed는만 가능
    // 2번째는 optional name(문자열) — 아카이브를 식별하는 데 사용할 수 있는 아카이브의 이름입니다
    // 녹화시작
    if (err) {
      res.sendStatus(503) // res.send 디클리션 되기떄문에 이렇게 바꿀필요 있음
      return log.err(err)
    } else {
      res.send({ archiveId: archive.id })
      proOpentok.signal(
        req.body.sessionId,
        null,
        {
          type: 'archive',
          data: 'started',
        },
        (e: any) => log.info(e)
      )
    }
  })
}

//녹화중지
export const stopArchive = async (req: express.Request, res: express.Response) => {
  const proOpentok = new OpenTok(oliveproApiKey, oliveproApiSecret)
  const archiveId = req.body.archiveId
  log.info(`StopArchive Post Requested archiveId:${archiveId}'`)
  proOpentok.stopArchive(archiveId, function (err: any, archive: { id: string }) {
    if (err) return log.err(err)
    log.info(`Stopped archive:${archive.id}`)
  })
  res.send(201)
  // archive.stop(function (err, archive) {
  //   if (err) return console.log(err);
  // });
}

//모니터링
export const archiveMonitoring = async (req: express.Request, res: express.Response) => {
  log.info(`Archive Monitoring Post Requested`)
  const url = `https://compression-archive.s3.ap-northeast-2.amazonaws.com/${req.body.partnerId}/${req.body.id}/archive.mp4`
  try {
    ArchiveMnt.create({
      archiveId: req.body.id,
      event: req.body.event,
      createdAt: req.body.createdAt,
      duration: req.body.duration,
      name: req.body.name,
      partnerId: req.body.partnerId,
      reason: req.body.reason,
      resolution: req.body.resolution,
      sessionId: req.body.sessionId,
      size: req.body.size,
      status: req.body.status,
      url,
    })
    res.send(201)
  } catch (e) {
    log.err(JSON.stringify(e))
    res.send(503)
  }
  res.send(201)
}

export const findOneSession = async (req: express.Request, res: express.Response) => {
  let resObject: ResObject = {
    code: 200,
    data: {},
    message: '',
    success: true,
  }

  try {
    const { id } = req.params

    log.info(`findOneSession Get Requested id:${id}'`)
    const videoChat = await handler.findOne({ where: { id } })

    console.log(videoChat.length)
    //해당 id가 존재하지 않을떄.  그래서 404로 보냅니다
    if (videoChat.length === 0) {
      log.info('`ID : ${id} is not exsit in Video_Chat` in findOneSession')
      resObject.code = -2600
      resObject.message = `ID : ${id} is not exsit in Video_Chat`
      resObject.success = false
      res.status(404).send(resObject)
      return
    }

    resObject.data = videoChat[0]
    resObject.message = 'VideoChat has been finded'
    res.status(200).send(resObject)
  } catch (error) {
    resObject.code = -9999
    resObject.success = false
    // @ts-ignore
    resObject.message = error.toString()
    log.err(`Error : ${error} =========> getCmsPush in cmsPush`)
    res.status(500).send(resObject)
  }
}

// 슬랙에 보내기
const sendToSlack: Function = (slackKey: SlackKey): void => {
  let prefix = ''
  if (process.env.NODE_ENV === 'qa') prefix = '[QA]'
  else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'develop') prefix = '[Develop]'
  else if (process.env.NODE_ENV === 'production') prefix = '[Production]'

  request.post(slackHookURL, {
    header: { 'Content-Type': 'application/json' },
    json: true,
    body: {
      username: `${prefix} ${moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')} Olive Union VideoChat`,
      attachments: [
        {
          color: '#f7f2f2',
          fields: [
            {
              title: `[video chat session open ] :  ${moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')}`, // Custom field
              short: false, // long fields will be full width
            },
            {
              title: `[요청자] :  ${slackKey.owner}`, // Custom field
              short: false, // long fields will be full width
            },
            {
              title: `[세션ID] :  ${slackKey.sessionId}`,
              short: false,
            },
            {
              title: `[leftMaster] :  ${slackKey.leftMaster}`,
              short: false,
            },
            {
              title: `[leftLoud] :  ${slackKey.leftLoud}`,
              short: false,
            },
            {
              title: `[leftMedium] :  ${slackKey.leftMedium}`,
              short: false,
            },
            {
              title: `[leftSoft] :  ${slackKey.leftSoft}`,
              short: false,
            },
            {
              title: `[leftCoordnateTableLength] :  ${slackKey.leftLength}`,
              short: false,
            },
            {
              title: `[rightMaster] :  ${slackKey.rightMaster}`,
              short: false,
            },
            {
              title: `[rightLoud] :  ${slackKey.rightLoud}`,
              short: false,
            },
            {
              title: `[rightMedium] :  ${slackKey.rightMedium}`,
              short: false,
            },
            {
              title: `[rightSoft] :  ${slackKey.rightSoft}`,
              short: false,
            },
            {
              title: `[rightCoordnateTableLength] :  ${slackKey.rightLength}`,
              short: false,
            },
            {
              title: `[count] :  ${slackKey.count}`,
              short: false,
            },
            {
              title: `[oliveType] :  ${slackKey.oliveType}`,
              short: false,
            },
          ],
        },
      ],
    },
  })
  log.info(`${prefix} ${moment().tz('Asia/Seoul').format('YYYY.MM.DD HH시 mm분')} Olive Union VideoChat is success`)
}
