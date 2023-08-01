/**
 * @swagger
 * tags:
 *  name: emailCode
 *  description: 이메일 코드 발급
 */

const express = require('express')
const router = express.Router()
const emailCodeController = require('../controllers/emailCode')

router.post('/', emailCodeController.updateEmailCode)

module.exports = router
