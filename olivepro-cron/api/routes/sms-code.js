'use strict'

/**
 * @swagger
 * tags:
 *  name: smsCode
 *  description: SMS 코드 발급
 */

const express = require('express')
const router = express.Router()
const smsCodeController = require('../controllers/smsCode.js')

router.post('/', smsCodeController.updateSmsCode)

module.exports = router
