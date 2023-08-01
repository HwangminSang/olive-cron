/**
 * @swagger
 * tags:
 *  name: verifyCode
 *  description: 인증 코드 발급
 */

import { Router } from 'express';

import { checkVerifyCode } from '../controllers/checkVerifyCode';
import * as verifyCodeController from '../controllers/verifyCode';

const router = Router()

router.post('/', verifyCodeController.updateVerifyCode)
router.post('/check', checkVerifyCode)

module.exports = router
