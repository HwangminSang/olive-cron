'use strict'

const { csOrder, csCustomer, Sequelize } = require('../models')
const handler = require('../../libs/util/mysql/handler')(csOrder)
const { log } = require('../../winston/logger')
const Op = require('../../api/models').Sequelize.Op
const { endDateChangeSameTime, startDateChangeUtcTime, endDateChangeUtcTime } = require('../../utils/changeTime')
exports.findAllOrder = async () => {
  log.info('all in findAllOrder')
  const consult = await handler.findAll({
    where: { usable: 1 },
    order: [['updated_at', 'DESC']],
  })

  if (consult === undefined) return false
  return consult
}

/**
 * customer Order
 */

exports.insertOrder = async consult => {
  log.info('create in insertOrder')

  try {
    return await handler.create(consult)
  } catch (error) {
    throw new Error(error)
  }
}

exports.findOneOrder = async id => {
  log.info('find in findOneOrder')
  const consult = await handler.findOne({ where: { id, usable: 1 } })

  if (consult.length === 0) return false
  return consult
}

exports.updateOrder = async (id, order) => {
  log.info('Update in updateOrder')

  const option = {
    where: { id, usable: 1 },
    value: order,
  }
  try {
    return await handler.update(option)
  } catch (error) {
    throw new Error(error)
  }
}

exports.bulkSoftDelete = async idArrray => {
  log.info('Delete in bulkSoftDelete')

  try {
    return await handler.bulkSoftDelete(idArrray)
  } catch (error) {
    throw new Error(error)
  }
}

exports.deleteOrder = async id => {
  log.info('delete in deleteOrder')
  const where = { id }
  try {
    const result = await handler.delete(where)
    if (!result) {
      return false
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

exports.orderGetCount = async (startDate, endDate) => {
  // 모든 판매 건수를 구한다.  ( 반품 교환 따지지 않는다 )
  // 12월 기준 -> // 12월 기준 -> BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00'
  // SELECT count(*) AS `count` FROM `cs_order` AS `cs_order` WHERE `cs_order`.`usable` = 1 AND `cs_order`.`order_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00'
  const orderCount = await csOrder.count({
    where: {
      usable: 1,
      orderAt: { [Op.between]: [startDate, endDate] }, // 주문내역
    },
    raw: true,
  })

  //반품건수
  //SELECT count(*) AS `count` FROM `cs_order` AS `cs_order` WHERE `cs_order`.`usable` = 1 AND `cs_order`.`return_type` = '반품' AND `cs_order`.`return_at` BETWEEN '20221-30 15:00:00' AND '2022-12-30 15:00:00'
  const returnTypeReturnCount = await csOrder.count({
    where: {
      usable: 1,
      returnType: '반품',
      returnAt: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  })

  // 교환건수
  //SELECT count(*) AS `count` FROM `cs_order` AS `cs_order` WHERE `cs_order`.`usable` = 1 AND `cs_order`.`return_type` = '교환' AND `cs_order`.`return_at` BETWEEN '20221-30 15:00:00' AND '2022-12-30 15:00:00'
  const returnTypeExchangeCount = await csOrder.count({
    where: {
      usable: 1,
      returnType: '교환',
      returnAt: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  })

  // 반품사유
  //SELECT `return_reason` AS `returnReason`, count('*') AS `count` FROM `cs_order` AS `cs_order` WHERE `cs_order`.`usable` = 1 AND `cs_order`.`return_type` = '반품' ANDcs_order`.`return_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00' GROUP BY `returnReason`;
  const returnTypeReturnReason = await csOrder.findAll({
    where: {
      usable: 1,
      returnType: '반품', //
      returnAt: { [Op.between]: [startDate, endDate] },
    },
    attributes: ['returnReason', [Sequelize.fn('count', '*'), 'count']],
    group: 'returnReason',
    raw: true,
  })

  // 교환사유
  //SELECT `return_reason` AS `returnReason`, count('*') AS `count` FROM `cs_order` AS `cs_order` WHERE `cs_order`.`usable` = 1 AND `cs_order`.`return_type` = '교환' ANDcs_order`.`return_at` BETWEEN '2022-11-30 15:00:00' AND '2022-12-30 15:00:00' GROUP BY `returnReason`
  const returnTypeExchangeReason = await csOrder.findAll({
    where: {
      usable: 1,
      returnType: '교환', //
      returnAt: { [Op.between]: [startDate, endDate] },
    },
    attributes: ['returnReason', [Sequelize.fn('count', '*'), 'count']],
    group: 'returnReason',
    raw: true,
  })

  //

  let returnReason = null
  if (returnTypeReturnReason[0] !== undefined) {
    returnReason = returnTypeReturnReason.reduce((prev, value) => {
      return prev.count >= value.count ? prev : value
    })
  }

  let exchangeReason = null
  if (returnTypeExchangeReason[0] !== undefined) {
    exchangeReason = returnTypeExchangeReason.reduce((prev, value) => {
      return prev.count >= value.count ? prev : value
    })
  }

  const result = {
    orderCount,
    returnTypeReturnCount,
    returnTypeExchangeCount,
    returnReason,
    exchangeReason,
  }

  return result
}

exports.orderPage = async (pageNum, limit, order, orderKeyWord, keyWord, startDate, endDate, filter) => {
  log.info('page in orderPage')

  const page = pageNum === undefined ? 1 : pageNum
  const sort = order === 'ASC' ? 'ASC' : 'DESC'
  const checkLimit = limit === undefined ? 10 : parseInt(limit)
  const keyWordOrder = orderKeyWord === undefined ? 'id' : orderKeyWord

  let offset = 0
  if (page > 1) {
    offset = checkLimit * (page - 1)
  }
  try {
    return await csOrder.findAndCountAll({
      include: [{ model: csCustomer, attributes: ['id', 'phoneNumber', 'name'], where: csCustomerKeyWordCondition(keyWord) }],
      attributes: ['id', 'orderAt', 'shopName', 'productCount', 'product', 'returnType', 'returnReason', 'returnAt', 'returnUsed'],
      where: {
        ...orderAtDateCondition(startDate, endDate),
        [Op.and]: [orderCondition(filter)],
      },
      order: [[keyWordOrder, sort]],
      offset,
      limit: checkLimit,
      raw: true, // 조인된 테이블의 칼럼을 하나의 객체에 필드값으로 보내게 설정
    })
  } catch (error) {
    throw new Error(error)
  }
}

//동적쿼리 function  ( customer name , phoneNumber  like 검색 )
const csCustomerKeyWordCondition = keyWord => {
  let csCustomerKeyWordCondition = {}

  if (keyWord !== 'all') {
    csCustomerKeyWordCondition = {
      [Op.or]: [
        {
          name: {
            [Op.substring]: keyWord,
          },
        },
        {
          phoneNumber: {
            [Op.substring]: keyWord,
          },
        },
      ],
    }
  }

  return csCustomerKeyWordCondition
}

//동적쿼리 function  ( order.orderAt  주문일자 )
const orderAtDateCondition = (startDate, endDate) => {
  let orderDate = {}

  if (startDate !== 'all' && endDate !== 'all') {
    //동일날자 일경우
    if (startDate === endDate) {
      orderDate.orderAt = {
        //ex)  10/12 ~ 10/12 ->  BETWEEN '2021-10-11 15:00:00' AND '2021-10-12 15:00:00'
        [Op.between]: [startDateChangeUtcTime(startDate), endDateChangeSameTime(endDate)],
      }
      return orderDate
    }

    orderDate.orderAt = {
      //ex)  10/12 ~ 10/14 -> BETWEEN '2021-10-11 15:00:00' AND '2021-10-13 15:00:00'
      [Op.between]: [startDateChangeUtcTime(startDate), endDateChangeUtcTime(endDate)],
    }
  }

  return orderDate
}

// 동적쿼리 function  ( //구매경로  //제품명  // 반품 or 교환 or AS //반품사유)
const orderCondition = filter => {
  //조건 담는 곳
  let condition = {
    usable: 1, // 삭제 되지 않은것만
  }

  // 기타 조건 담는곳
  Object.keys(filter).map(key => {
    if (filter[key] !== 'all') {
      condition[key] = filter[key]
    }
  })

  return condition
}
