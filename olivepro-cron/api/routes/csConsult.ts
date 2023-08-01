/**
 * @swagger
 * tags:
 *  name:  customerConsult
 *  description: customerConsult
 */

import { Router } from 'express'

const { validatorErrorChecker, consultPageBodyFilter, createConsultValidation, getIdValidation } = require('../middleware/validator')
import { log } from '../../winston/logger'

import { createConsult, deleteConsult, getConsult, getConsultList, getConsultPageFilter, updateCSConsult, getConsultCount } from '../controllers/csConsult'

log.info('customerConsult Routers')
const csConsultRouter = Router()

// csConsultRouter.use('/', authChecker)

// 등록
csConsultRouter.post('/', [...createConsultValidation, validatorErrorChecker], createConsult)

// 리스트 목록
csConsultRouter.get('/list', getConsultList)

// 페이지 상단 목록
csConsultRouter.get('/page/count', getConsultCount)

// 필터별 검색
csConsultRouter.post('/page/search', [...consultPageBodyFilter, validatorErrorChecker], getConsultPageFilter)

// 한개조회
csConsultRouter.get('/:id', [...getIdValidation, validatorErrorChecker], getConsult)

// 업데이트
csConsultRouter.put('/', updateCSConsult)

// 삭제
csConsultRouter.delete('/', deleteConsult)

export default csConsultRouter
