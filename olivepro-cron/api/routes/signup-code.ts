'use strict'

/**
 * @swagger
 * tags:
 *  name: signUpCode
 *  description: 가입 시 인증코드 발급
 */

const express = require('express')
const router = express.Router()
const signUpCodeController = require('../controllers/signUpCode')
import { checkVerifyCode } from '../controllers/checkVerifyCode';

router.post('/', signUpCodeController.issueSignUpCode)
router.post('/check', checkVerifyCode)

module.exports = router
