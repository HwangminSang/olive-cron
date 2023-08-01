'use strict'

/**
 * @swagger
 * tags:
 *  name: changePhoneCode
 *  description: 폰 번호 변경 시 인증코드 발급
 */

const express = require('express')
const router = express.Router()
const changePhoneCodeController = require('../controllers/changePhoneCode')

import { checkVerifyCode } from '../controllers/checkVerifyCode';

router.post('/', changePhoneCodeController.issueChangePhoneCode)
router.post('/check', checkVerifyCode)

module.exports = router
