const { validationResult } = require('express-validator')
const { CSParameterError } = require('../err-codes/krCsErrorCode')
const { body, query, param } = require('express-validator')
const { apiResponse } = require('../../utils/apiResponse')
//밸리데이션 미들웨어
exports.validatorErrorChecker = (req, res, next) => {
  const errors = validationResult(req)
  // 에러가 있는경우
  if (!errors.isEmpty()) {
    const errorMsg = []

    errors.array().forEach((error, index) => {
      errorMsg[index] = `${error.param} : ${error.msg}`
    })
    CSParameterError.msg = `Please check your ${errorMsg.join(',')}`
    return res.status(400).json(apiResponse(CSParameterError))
  }
  //없는경우 다음으로 컨트롤러 진행
  next()
}

//밸리데이션시 사용할 array
// notEmpty()  ""값도 에러로 처리  <=> exsits ""값 에러처리 하지 않음
exports.orderPageBodyFilter = [
  body('keyWord').notEmpty().default('all'),
  body('startDate').notEmpty().default('all'),
  body('endDate').notEmpty().default('all'),
  body('shopName').notEmpty().default('all'),
  body('product').notEmpty().default('all'),
  body('returnReason').notEmpty().default('all'),
  body('returnType').notEmpty().default('all'),
]

exports.consultPageBodyFilter = [
  body('keyWord').notEmpty().default('all'),
  body('startDate').notEmpty().default('all'),
  body('endDate').notEmpty().default('all'),
  body('categoryMain').notEmpty().default('all'),
  body('categorySub').notEmpty().default('all'),
  body('staff').notEmpty().default('all'),
  body('csStatus').notEmpty().default('all'),
]

exports.getIdValidation = [
  param('id').notEmpty(), // id
]

exports.createCustomerValidation = [
  body('name').notEmpty(), // 이름
  body('phoneNumber').notEmpty(), // 번호
]

exports.createOrderValidation = [
  body('customer_id').notEmpty(), // 고객 id
  body('product').notEmpty(), // 제품
  body('shopName').notEmpty(), // 구매경로
  body('productCount').notEmpty(), // 수량
]

exports.createConsultValidation = [
  body('customer_id').notEmpty(), // 고객 id
  body('categoryMain').notEmpty(), // 대분류
  body('categorySub').notEmpty(), // 중분류
  body('consultDate').notEmpty(), // 상담 접수일
  body('staff').notEmpty(), // 담당자
  body('csStatus').notEmpty().isIn([1, 2]), // 예약 및 완료 상태
]

exports.brainGameEmailAndAccessToken = [body('email').notEmpty(), body('accessToken').notEmpty()]

exports.brainGameEmail = [query('email').notEmpty()]

exports.createSmsMessage = [body('countryCode').notEmpty(), body('phoneNumber').notEmpty(), body('message').notEmpty()]

exports.createSendEmail = [body('from', 'invalid email format').isEmail(), body('to', 'invalid email format').isEmail(), body('subject').notEmpty(), body('text').notEmpty()]
