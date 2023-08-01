/**
 * @swagger
 * tags:
 *  name:  customerOrder
 *  description: customerOrder
 */

import { Router } from 'express'

import { log } from '../../winston/logger'
// import { authChecker } from '../../utils/authChecker'

import { createOrder, deleteOrder, getOrder, getOrderList, getOrderPage, updateCSOrder, getConsultCount } from '../controllers/csOrder'

const { validatorErrorChecker, orderPageBodyFilter, createOrderValidation, getIdValidation } = require('../middleware/validator')
log.info('csOrderRouter Routers')
const csOrderRouter = Router()

// csConsultRouter.use('/', authChecker)

csOrderRouter.post('/', [...createOrderValidation, validatorErrorChecker], createOrder)

csOrderRouter.get('/list', getOrderList)

csOrderRouter.get('/page', getOrderPage)

// 주문페이지 상단 목록
csOrderRouter.get('/page/count', getConsultCount)

// 검색
csOrderRouter.post('/page/search', [...orderPageBodyFilter, validatorErrorChecker], getOrderPage)

csOrderRouter.get('/:id', [...getIdValidation, validatorErrorChecker], getOrder)

csOrderRouter.put('/', updateCSOrder)

csOrderRouter.delete('/', deleteOrder)

export default csOrderRouter
