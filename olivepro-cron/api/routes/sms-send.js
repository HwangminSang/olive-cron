'use strict'

/**
 * @swagger
 * tags:
 *  name: smsSend
 *  description: SMS 문자 발송
 */

const express = require('express')
const router = express.Router()
const smsSendController = require('../controllers/smsSend.js')
const { validatorErrorChecker, createSmsMessage } = require('../middleware/validator')

router.post('/', [...createSmsMessage, validatorErrorChecker], smsSendController.sendSmsMessage)

module.exports = router
