/**
 * @swagger
 * tags:
 *  name: resetPassword
 *  description: 비밀번호 재설정
 */
const { redisKeyValWrite, redisKeyValDelete } = require('../../utils/verifyUtils')
const { log } = require('../../winston/logger')
const express = require('express')
const router = express.Router()
const { check, body, validationResult } = require('express-validator')
const authController = require('../controllers/resetPwdController.js')
const { response } = require('express')
let oliveApiUrl = ''
const resetPwdApi = '/api/v1/auth/user/email/password'

if (process.env.NODE_ENV === 'production') {
  oliveApiUrl = 'https://pro.oliveapi.com' + resetPwdApi
} else {
  oliveApiUrl = 'https://dev-pro.oliveapi.com' + resetPwdApi
}

router.get('/', (req, res) => {
  let datas = {
    email: req.query['email'],
    code: req.query['emailCode'],
  }
  let errors = []

  res.render('reset-password', {
    datas: datas,
    errors: errors,
  })
})

router.post(
  '/post',
  [
    check('password').not().isEmpty().withMessage('Please type your password.'),
    check('confirmedPassword')
      .not()
      .isEmpty()
      .withMessage('Please confirm your password.')
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords did not match')
        } else {
          return value
        }
      }),
  ],
  async (req, res, next) => {
    let datas = {
      email: req.query['email'],
      code: req.query['emailCode'],
    }
    const errors = validationResult(req)
    log.info(errors.array())

    if (!errors.isEmpty()) {
      res.render('reset-password', {
        datas: datas,
        errors: errors.array(),
      })
    } else {
      let { email, code, password } = req.body

      const newPasswordData = {
        cronKey: '#OliveCronKey!@',
        email,
        emailCode: code,
        password,
      }
      log.info(`api server call: ${newPasswordData} in resetPwd`)

      authController.callAPI(oliveApiUrl, newPasswordData, function (error, result) {
        if (error) {
          let response = {
            status: 400,
            message: error,
            data: null,
          }
          log.info(`response: ${response}, error : ${error} in  authController.callAPI`)
          res.render('failed-reset-pwd', { response: response })
        } else {
          if (result.code !== 200 || !result.success) {
            res.render('failed-reset-pwd', { response })
            log.err(`result:${result} in  authController.callAPI`)
          } else if (result.success) {
            // 이메일 변경이 성공 하면 레디스 Key값 삭제
            const redisEmailKey = 'emailKey:' + email
            redisKeyValDelete(redisEmailKey)

            res.render('successed-reset-pwd')
          }
        }
      })
    }
  }
)

module.exports = router
