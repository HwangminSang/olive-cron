import express from 'express'
import morgan from 'morgan'

import brainGameRouter from './api/routes/brainGameRedis'
import csConfigRouter from './api/routes/csConfig'
import csConsultRouter from './api/routes/csConsult'
import csCustomerUserRouter from './api/routes/csCustomer'
import csOrderRouter from './api/routes/csOrder'
import gaRouter from './api/routes/ga'
import sesEmailRouter from './api/routes/sesSend'
import { redisClient } from './utils/redis'
import { log, stream } from './winston/logger'

const dotenv = require('dotenv')

const app = express()
const cors = require('cors')
const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'

if (!(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'develop')) {
  // 기존 combined 포멧에서 timestamp만 제거
  dotenv.config()
}

const helmet = require('helmet')
if (process.env.ISDEBUG === 'true') {
  process.env.NODE_ENV === 'production'
    ? dotenv.config({ path: '.env.prod' })
    : process.env.NODE_ENV === 'develop'
    ? dotenv.config({ path: '.env.dev' })
    : process.env.NODE_ENV === 'local'
    ? dotenv.config({ path: '.env.local' })
    : log.err('Error: Unable to read value for operating environment.')
}

log.info(`cron ${process.env.NODE_ENV} server started`)

try {
  redisClient()
} catch {
  log.err('ERROR: redis server connect Error')
}

const morganFormat = process.env.NODE_ENV !== 'production' ? 'dev' : combined
// NOTE: morgan 출력 형태 server.env에서 NODE_ENV 설정 production : 배포 dev : 개발
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.use(morgan(combined, { stream }))

const pushRoutes = require('./api/routes/notifications')
const smsRoutes = require('./api/routes/sms')
const emailCodeRoutes = require('./api/routes/email-code')
const resetPasswordRoutes = require('./api/routes/resetPwd')
const smsCodeRoutes = require('./api/routes/sms-code')
const smsSendRoutes = require('./api/routes/sms-send')
const signUpCodeRoutes = require('./api/routes/signup-code')
const signUpCodeTestRoutes = require('./api/routes/signup-code-test')
const verifyCodeRoutes = require('./api/routes/verify-code')
const changePhoneCodeRoutes = require('./api/routes/change-phone-code')

const videoChatRoutes = require('./api/routes/video-chat')
const videoChatOpenRoutes = require('./api/routes/video-chat-open')

const cmsPushCron = require('./crons/cmsPush')
const smsCodeCron = require('./crons/smsCode')
const authCodeCron = require('./crons/authCode')

const { swaggerUi, specs } = require('./swagger')
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//운영시 바꿔주기!!!
// const corsOptions = {
//   origin: [
//     'https://dev.cms.oliveapi.com',
//     'https://test2.cms.oliveapi.com',
//     'https://dev.admin.oliveapi.com',
//     'https://cms.oliveapi.com',
//     'http://localhost:3000',
//     'http://localhost:5000',
//     'http://localhost:3003',
//     'https://compression.admin.oliveapi.com',
//   ],
// }

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? ['https://cms.oliveapi.com'] : '*',
}

app.use(cors(corsOptions))

const indexMsg = process.env.NODE_ENV === 'production' ? 'OliveUnion Cron application prod 0.12 (20220429)' : 'OliveUnion Cron application dev 0.12 (20221212)'
app.get('/', (req, res) => {
  res.json(indexMsg)
})

app.use(express.static('public/'))

app.use(express.urlencoded({ limit: '50000mb', extended: false }))
// user route for all path
app.use('/api/v1/notifications', pushRoutes)
app.use('/api/v1/sms', smsRoutes)
app.use('/api/v1/videoChat', videoChatRoutes)
app.use('/api/v1/video-chat-open', videoChatOpenRoutes)

app.use('/api/v1/reset-password', resetPasswordRoutes)
app.use('/api/v1/user/emailCode', emailCodeRoutes)
app.use('/api/v1/user/smsCode', smsCodeRoutes)
app.use('/api/v1/user/smsSend', smsSendRoutes)
app.use('/api/v1/user/signUpCode', signUpCodeRoutes)
app.use('/api/v1/user/signUpCodeTest', signUpCodeTestRoutes)
app.use('/api/v1/user/verifyCode', verifyCodeRoutes)
app.use('/api/v1/user/changePhoneCode', changePhoneCodeRoutes)
app.use('/api/v1/ga', gaRouter)

// 고객 등록
app.use('/api/v1/cs/user', csCustomerUserRouter)
app.use('/api/v1/cs/consult', csConsultRouter)
app.use('/api/v1/cs/order', csOrderRouter)
app.use('/api/v1/cs/config', csConfigRouter)
// 이메일 발송
app.use('/api/v1/ses', sesEmailRouter)

// 브레인게임
app.use('/api/v1/game/redis', brainGameRouter)

// 운영일떄는 스웨거 문서를 볼수없게 설정
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}

const db = require('./api/models')

if (process.env.NODE_ENV === 'develop') {
  // 운영 모드일 경우는 테이블이 강제로 생성 되지 않도록 해야 한다.
  db.sequelize.sync()
}

cmsPushCron.everyMinute.start()
smsCodeCron.everyMinute.start()

// 중복된 코드라서 사용 안함
// authCodeCron.everyMinute.start()

log.info('Cron Push, authCode, Customer Consult Server Started')

app.use((req, res, next) => {
  const err = new Error('not found')
  next(err)
})

app.use((err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).send({
    code: 500,
    success: false,
    msg: err,
  })
  log.err(`express error: ${err}`)
})

module.exports = app
