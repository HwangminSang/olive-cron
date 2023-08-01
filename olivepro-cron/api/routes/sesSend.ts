/**
 * @swagger
 * tags:
 *  name:  sesSendEmail
 *  description: sesSendEmail ses send email
 */

import { Router } from 'express'

import { log } from '../../winston/logger'
import { sesSendEmail } from '../controllers/sesSend'
const { validatorErrorChecker, createSendEmail } = require('../middleware/validator')

log.info('sesSend Routers')
const sesEmailRouter = Router()

sesEmailRouter.get('/', req => {
  return { success: true, message: 'Send Email Servie is Ready' }
})

sesEmailRouter.post('/mail', [...createSendEmail, validatorErrorChecker], sesSendEmail)

export default sesEmailRouter
