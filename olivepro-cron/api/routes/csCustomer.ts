/**
 * @swagger
 * tags:
 *  name:  customerUser
 *  description: customerUser
 */

import { Router } from 'express'
import multer from 'multer'

import { log } from '../../winston/logger'
import { multerConfig } from '../config/multerConfig'
// import { authChecker } from '../../utils/authChecker'
const { validatorErrorChecker, createCustomerValidation, getIdValidation } = require('../middleware/validator')

import { createCustomer, deleteCustomer, getCustomerList, getCustomerPage, getCustomerWithOrderAndConsult, updateCSCustomer } from '../controllers/csCustomer'
import { UploadController } from '../controllers/UploadController'

log.info('customerUser Routers')
const csCustomerUserRouter = Router()

const upload = multer(multerConfig)

// csConsultRouter.use('/', authChecker)

csCustomerUserRouter.post('/', [...createCustomerValidation, validatorErrorChecker], createCustomer)

csCustomerUserRouter.get('/list', getCustomerList)

csCustomerUserRouter.get('/page', getCustomerPage)

// 검색
csCustomerUserRouter.post('/search', getCustomerPage)

// CSV upload
csCustomerUserRouter.post('/upload', upload.single('file'), UploadController.Upload)

csCustomerUserRouter.get('/:id', [...getIdValidation, validatorErrorChecker], getCustomerWithOrderAndConsult)

csCustomerUserRouter.put('/', updateCSCustomer)

csCustomerUserRouter.delete('/', deleteCustomer)

export default csCustomerUserRouter
