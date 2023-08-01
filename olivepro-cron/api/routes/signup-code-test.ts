/**
 * @swagger
 * tags:
 *  name: verifyCode
 *  description: 인증 코드 발급
 */

import { Router } from 'express';

import jp from '../controllers/signUpCode-jp';
import kr from '../controllers/signUpCode-kr';
import us from '../controllers/signUpCode-us';

const router = Router()

router.post('/jp', jp)
router.post('/kr', kr)
router.post('/us', us)

module.exports = router
